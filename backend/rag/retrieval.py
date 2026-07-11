# rag/retrieval.py
import cohere
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.retrievers import BM25Retriever
from langchain_classic.retrievers import EnsembleRetriever

MAX_BM25_CORPUS = 10000  # safety cap when pulling a whole collection into memory for BM25


class HybridRetriever:
    """
    Stage 1: Hybrid search (BM25 + Vector) -> top-N candidates per paper
    Stage 2: Cohere's hosted Rerank API -> top-k final results

    Reranking happens via a hosted API instead of a local CrossEncoder
    model, which keeps memory usage low enough for Render's free tier.

    Supports two modes:
      - retrieve():               search within a single paper's collection
      - retrieve_across_papers(): search across every paper in the library
                                   (used when the user hasn't filtered to
                                   one specific paper in the UI)
    """

    def __init__(self, embeddings: GoogleGenerativeAIEmbeddings, cohere_api_key: str):
        self.embeddings = embeddings
        self.cohere_client = cohere.Client(api_key=cohere_api_key)

    def _hybrid_candidates(self, query: str, paper_id: str, persist_directory: str, k: int) -> list:
        """Stage 1 only: BM25 + vector ensemble candidates for a single paper collection."""
        vectorstore = Chroma(
            persist_directory=persist_directory,
            embedding_function=self.embeddings,
            collection_name=f"paper_{paper_id}"
        )

        all_results = vectorstore.similarity_search("", k=MAX_BM25_CORPUS)

        if not all_results:
            return []

        bm25 = BM25Retriever.from_documents(all_results)
        bm25.k = min(k, len(all_results))

        vector_retriever = vectorstore.as_retriever(
            search_kwargs={"k": min(k, len(all_results))}
        )

        ensemble = EnsembleRetriever(
            retrievers=[bm25, vector_retriever],
            weights=[0.5, 0.5]
        )

        return ensemble.invoke(query)

    def _rerank(self, query: str, candidates: list, top_k: int) -> list:
        """Stage 2: send candidates through Cohere Rerank and attach scores."""
        if not candidates:
            return []

        rerank_response = self.cohere_client.rerank(
            model="rerank-v3.5",
            query=query,
            documents=[doc.page_content for doc in candidates],
            top_n=min(top_k, len(candidates)),
        )

        results = []
        for r in rerank_response.results:
            doc = candidates[r.index]
            doc.metadata["relevance_score"] = float(r.relevance_score)
            results.append(doc)

        return results

    def retrieve(
        self,
        query: str,
        paper_id: str,
        persist_directory: str,
        top_k: int = 5
    ) -> list:
        """Search within a single paper's collection."""
        candidates = self._hybrid_candidates(query, paper_id, persist_directory, k=20)

        if not candidates:
            raise ValueError(f"No documents found for paper {paper_id}")

        return self._rerank(query, candidates, top_k)

    def retrieve_across_papers(
        self,
        query: str,
        papers: list[dict],
        top_k: int = 5
    ) -> list:
        """
        Search across every paper in the library.

        `papers` is a list of dicts each containing at least
        "paper_id" and "persist_directory" (as stored by PaperStore).

        Each paper contributes a smaller candidate pool (k=10) than the
        single-paper path (k=20), since results are merged before the
        final rerank — this keeps the combined candidate set (and the
        Cohere rerank call) a reasonable size even with many papers indexed.
        """
        all_candidates = []
        for paper in papers:
            try:
                candidates = self._hybrid_candidates(
                    query,
                    paper_id=paper["paper_id"],
                    persist_directory=paper["persist_directory"],
                    k=10
                )
            except Exception:
                # One paper's collection being unreadable shouldn't break
                # the whole cross-library search — skip it and continue.
                continue
            all_candidates.extend(candidates)

        if not all_candidates:
            return []

        return self._rerank(query, all_candidates, top_k)
