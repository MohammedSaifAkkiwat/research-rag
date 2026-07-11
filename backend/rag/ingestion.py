# rag/ingestion.py
# rag/ingestion.py
import os
import uuid
import tempfile
from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma

CHROMA_BASE_PATH = "chroma_db"

class DocumentIngester:
    """
    Handles the full ingestion pipeline:
    PDF -> chunks -> embeddings -> vector store

    Uses Google's hosted embedding API instead of a local model.
    This removes torch/sentence-transformers from the dependency tree,
    which was blowing past Render's 512MB free-tier RAM limit.
    """

    def __init__(self, google_api_key: str):
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=google_api_key
        )
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )

    async def ingest(self, file_bytes: bytes, filename: str) -> dict:
        paper_id = str(uuid.uuid4())[:8]

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        try:
            loader = PyPDFLoader(tmp_path)
            docs = loader.load()
            num_pages = len(docs)

            if num_pages == 0:
                raise ValueError("PDF appears to be empty or unreadable")

            for doc in docs:
                doc.metadata["paper_id"] = paper_id
                doc.metadata["filename"] = filename

            chunks = self.splitter.split_documents(docs)
            num_chunks = len(chunks)

            if num_chunks == 0:
                raise ValueError("No text could be extracted from the PDF")

            persist_directory = os.path.join(CHROMA_BASE_PATH, paper_id)

            Chroma.from_documents(
                documents=chunks,
                embedding=self.embeddings,
                persist_directory=persist_directory,
                collection_name=f"paper_{paper_id}"
            )

            return {
                "paper_id": paper_id,
                "num_pages": num_pages,
                "num_chunks": num_chunks,
                "persist_directory": persist_directory
            }

        finally:
            os.unlink(tmp_path)

    def delete_paper(self, paper_id: str, persist_directory: str):
        import shutil
        if os.path.exists(persist_directory):
            shutil.rmtree(persist_directory)