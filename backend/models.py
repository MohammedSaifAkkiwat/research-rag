# models.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UploadResponse(BaseModel):
    paper_id: str = Field(..., description="Unique identifier for this paper")
    filename: str
    num_pages: int
    num_chunks: int
    status: str = "indexed"
    message: str

class Source(BaseModel):
    paper: str
    page: int
    content_preview: str  # First 100 chars of the chunk
    relevance_score: float

class QueryRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=1000)
    # Optional on purpose: the frontend lets a user ask a question either
    # scoped to one selected paper, OR across every indexed paper at once
    # (the "Searching across all papers" state when no paper is selected).
    # When omitted/null, the API searches across all papers in the library.
    paper_id: str | None = Field(default=None, description="ID returned from /upload. Omit to search across all indexed papers.")
    top_k: int = Field(default=5, ge=1, le=10)

class QueryResponse(BaseModel):
    answer: str
    sources: list[Source]
    paper_id: str | None = None
    question: str
    processing_time_ms: float

class PaperInfo(BaseModel):
    paper_id: str
    filename: str
    upload_time: datetime
    num_pages: int
    num_chunks: int

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    environment: str
    papers_indexed: int