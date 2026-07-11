# rag/generation.py
import time
from langchain_google_genai import ChatGoogleGenerativeAI

class RAGGenerator:
    """
    Handles prompt construction and LLM generation.
    
    Design decision: Inject API key from settings, never hardcode.
    """
    
    def __init__(self, google_api_key: str):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=google_api_key,
            temperature=0.1,  # Low temp = more factual, less creative
            max_tokens=1024
        )
    
    async def generate(self, query: str, retrieved_docs: list) -> dict:
        """
        Generate an answer from retrieved documents.
        
        Returns dict with answer, sources, and timing.
        """
        start_time = time.time()
        
        if not retrieved_docs:
            return {
                "answer": "I could not find any relevant information in the uploaded paper for your question.",
                "sources": [],
                "processing_time_ms": (time.time() - start_time) * 1000
            }
        
        # Build context with citations embedded
        context_parts = []
        sources = []
        
        for i, doc in enumerate(retrieved_docs):
            paper_id = doc.metadata.get("paper_id", "unknown")
            page = doc.metadata.get("page", 0)
            score = doc.metadata.get("relevance_score", 0.0)
            
            context_parts.append(
                f"[Source {i+1} — Page {page+1}]\n{doc.page_content}"
            )
            
            sources.append({
                "paper": doc.metadata.get("filename", paper_id),
                "page": page + 1,  # Convert 0-indexed to 1-indexed
                "content_preview": doc.page_content[:150] + "...",
                "relevance_score": round(score, 4)
            })
        
        context = "\n\n---\n\n".join(context_parts)
        
        prompt = f"""You are a precise academic assistant. Answer the question using ONLY the provided context.

Rules:
1. If the answer is not in the context, say exactly: "I cannot find that information in the provided paper."
2. After each factual claim, cite the source: [Source N, Page X]
3. Be concise but complete
4. Do not add information from outside the context

Context:
{context}

Question: {query}

Answer:"""
        
        response = await self.llm.ainvoke(prompt)  # ainvoke = async version
        
        return {
            "answer": response.content,
            "sources": sources,
            "processing_time_ms": round((time.time() - start_time) * 1000, 2)
        }