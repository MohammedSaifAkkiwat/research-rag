# main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from config import get_settings, Settings
from models import (
    UploadResponse, QueryRequest, QueryResponse,
    PaperInfo, ErrorResponse, HealthResponse, Source
)
from rag.ingestion import DocumentIngester
from rag.retrieval import HybridRetriever
from rag.generation import RAGGenerator
from storage.paper_store import PaperStore


# ============================================================
# CONCEPT: Application Lifespan
# ============================================================
# The @asynccontextmanager lifespan function runs ONCE at startup
# and ONCE at shutdown. This is where you initialize expensive resources.
# Never initialize models inside route handlers — that would reload
# the 400MB model on every single request.

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup: Initialize all expensive resources once.
    Shutdown: Clean up connections.
    """
    print("🚀 Starting RAG API...")
    settings = get_settings()
    
    # Initialize core components — expensive, done ONCE
    ingester = DocumentIngester(google_api_key=settings.google_api_key)
    retriever = HybridRetriever(ingester.embeddings, cohere_api_key=settings.cohere_api_key) # Loads reranker model
    generator = RAGGenerator(google_api_key=settings.google_api_key)
    paper_store = PaperStore()
    
    # Attach to app.state — accessible from any route handler
    app.state.ingester = ingester
    app.state.retriever = retriever
    app.state.generator = generator
    app.state.paper_store = paper_store
    app.state.settings = settings
    
    print("✅ RAG API ready")
    
    yield  # Application runs here
    
    # Shutdown cleanup (if needed)
    print("🛑 Shutting down RAG API")


# ============================================================
# Application Creation
# ============================================================
app = FastAPI(
    title="Research Paper RAG API",
    description="Upload research papers and ask questions about them using hybrid RAG",
    version="1.0.0",
    lifespan=lifespan
)


# ============================================================
# CONCEPT: CORS (Cross-Origin Resource Sharing)
# ============================================================
# When your frontend (running on vercel.app) calls your backend
# (running on render.com), the browser blocks the request by default.
# This is a security feature — browsers prevent scripts from making
# requests to different domains unless the SERVER explicitly allows it.
#
# CORS middleware tells browsers: "Yes, requests from these origins are allowed."
# Without this, your frontend CANNOT talk to your backend.

settings = get_settings()
allowed_origins = settings.origins_list()
print("Allowed origins:", allowed_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Which frontend domains can call this API
    allow_credentials=True,
    allow_methods=["*"],            # Allow all HTTP methods
    allow_headers=["*"],            # Allow all headers
)


# ============================================================
# ROUTE: Health Check
# ============================================================
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Deployment platforms ping this to verify the server is alive.
    Must respond quickly — no heavy computation.
    """
    return HealthResponse(
        status="healthy",
        environment=app.state.settings.app_env,
        papers_indexed=len(app.state.paper_store.list_papers())
    )


# ============================================================
# ROUTE: Upload Paper
# ============================================================
@app.post("/upload", response_model=UploadResponse)
async def upload_paper(
    file: UploadFile = File(..., description="PDF file to process"),
    paper_name: str = Form(default="")
):
    """
    Upload and index a research paper PDF.
    
    This is the most complex endpoint:
    1. Validate the file
    2. Read bytes
    3. Run ingestion pipeline
    4. Store metadata
    5. Return paper_id for future queries
    """
    # ---- Validation ----
    if file.content_type not in ["application/pdf", "application/x-pdf"]:
        raise HTTPException(
            status_code=400,
            detail=f"Only PDF files are accepted. Received: {file.content_type}"
        )
    
    max_size = app.state.settings.max_file_size_mb * 1024 * 1024
    content = await file.read()
    
    if len(content) > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {app.state.settings.max_file_size_mb}MB"
        )
    
    if len(content) < 100:  # Suspiciously small for a PDF
        raise HTTPException(status_code=400, detail="File appears to be empty")
    
    # ---- Ingestion ----
    try:
        result = await app.state.ingester.ingest(
            file_bytes=content,
            filename=paper_name or file.filename
        )
    except ValueError as e:
        # ValueError = something wrong with the PDF content
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        # Unexpected error = our fault
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to process PDF: {str(e)}"
        )
    
    # ---- Store Metadata ----
    app.state.paper_store.add_paper(
        paper_id=result["paper_id"],
        metadata={
            "filename": paper_name or file.filename,
            "num_pages": result["num_pages"],
            "num_chunks": result["num_chunks"],
            "persist_directory": result["persist_directory"]
        }
    )
    
    return UploadResponse(
        paper_id=result["paper_id"],
        filename=paper_name or file.filename,
        num_pages=result["num_pages"],
        num_chunks=result["num_chunks"],
        message=f"Successfully indexed {result['num_chunks']} chunks from {result['num_pages']} pages"
    )


# ============================================================
# ROUTE: Query Paper
# ============================================================
@app.post("/query", response_model=QueryResponse)
async def query_paper(request: QueryRequest):
    """
    Ask a question about an uploaded paper, or across the whole library.

    Pipeline:
    1. If paper_id is given, validate it exists; otherwise search all papers
    2. Hybrid retrieval (BM25 + Vector + Reranking)
    3. LLM generation with citations
    """
    # ---- Retrieve ----
    if request.paper_id:
        # Scoped to a single paper — validate it exists first.
        paper_info = app.state.paper_store.get_paper(request.paper_id)
        if not paper_info:
            raise HTTPException(
                status_code=404,
                detail=f"Paper {request.paper_id} not found. Upload it first via POST /upload"
            )
        try:
            retrieved_docs = app.state.retriever.retrieve(
                query=request.question,
                paper_id=request.paper_id,
                persist_directory=paper_info["persist_directory"],
                top_k=request.top_k
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Retrieval failed: {str(e)}"
            )
    else:
        # No paper_id provided — search across every indexed paper.
        all_papers = app.state.paper_store.list_papers()
        if not all_papers:
            raise HTTPException(
                status_code=400,
                detail="No papers have been uploaded yet. Upload a paper first via POST /upload"
            )
        try:
            retrieved_docs = app.state.retriever.retrieve_across_papers(
                query=request.question,
                papers=all_papers,
                top_k=request.top_k
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Retrieval failed: {str(e)}"
            )
    
    # ---- Generate ----
    try:
        generation_result = await app.state.generator.generate(
            query=request.question,
            retrieved_docs=retrieved_docs
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Generation failed: {str(e)}"
        )
    
    return QueryResponse(
        answer=generation_result["answer"],
        sources=[Source(**s) for s in generation_result["sources"]],
        paper_id=request.paper_id,
        question=request.question,
        processing_time_ms=generation_result["processing_time_ms"]
    )


# ============================================================
# ROUTE: List Papers
# ============================================================
@app.get("/papers", response_model=list[PaperInfo])
async def list_papers():
    """List all uploaded and indexed papers."""
    papers = app.state.paper_store.list_papers()
    return [
        PaperInfo(
            paper_id=p["paper_id"],
            filename=p["filename"],
            upload_time=datetime.fromisoformat(p["upload_time"]),
            num_pages=p["num_pages"],
            num_chunks=p["num_chunks"]
        )
        for p in papers
    ]


# ============================================================
# ROUTE: Delete Paper
# ============================================================
@app.delete("/papers/{paper_id}")
async def delete_paper(paper_id: str):
    """Remove a paper and its indexed data."""
    paper_info = app.state.paper_store.get_paper(paper_id)
    if not paper_info:
        raise HTTPException(status_code=404, detail=f"Paper {paper_id} not found")
    
    # Remove vector store from disk
    app.state.ingester.delete_paper(
        paper_id=paper_id,
        persist_directory=paper_info["persist_directory"]
    )
    
    # Remove from registry
    app.state.paper_store.delete_paper(paper_id)
    
    return {"message": f"Paper {paper_id} deleted successfully", "paper_id": paper_id}

# Add this to main.py for local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)