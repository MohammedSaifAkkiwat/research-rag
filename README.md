<div align="center">

<br/>

```
██████╗  █████╗  ██████╗     ██████╗ ██╗██████╗ ███████╗██╗     ██╗███╗   ██╗███████╗
██╔══██╗██╔══██╗██╔════╝     ██╔══██╗██║██╔══██╗██╔════╝██║     ██║████╗  ██║██╔════╝
██████╔╝███████║██║  ███╗    ██████╔╝██║██████╔╝█████╗  ██║     ██║██╔██╗ ██║█████╗  
██╔══██╗██╔══██║██║   ██║    ██╔═══╝ ██║██╔═══╝ ██╔══╝  ██║     ██║██║╚██╗██║██╔══╝  
██║  ██║██║  ██║╚██████╔╝    ██║     ██║██║     ███████╗███████╗██║██║ ╚████║███████╗
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝     ╚═╝     ╚═╝╚═╝     ╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝
```

### Ask anything about any research paper. Get cited, accurate answers — instantly.

<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-0.139-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_Store-FF6B35?style=for-the-badge)](https://trychroma.com)
[![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-LLM_+_Embeddings-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com)
[![Cohere](https://img.shields.io/badge/Cohere-Rerank_v3.5-39594c?style=for-the-badge)](https://cohere.com)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

<br/>

**[🚀 Live Demo](https://YOUR_FRONTEND_URL.vercel.app)** &nbsp;·&nbsp; **[📖 Interactive API Docs](https://YOUR_BACKEND_URL.onrender.com/docs)** &nbsp;·&nbsp; **[📋 Deployment Guide](DEPLOYMENT.md)** &nbsp;·&nbsp; **[🐛 Report Bug](https://github.com/MohammedSaifAkkiwat/research-rag/issues)**

<br/>

</div>

---

## The Problem With Asking LLMs About Research Papers

Large language models hallucinate. Ask an LLM about a specific paper's methodology, and it will give you a confident, detailed, completely fabricated answer.

The naive fix — "just upload the PDF" — breaks for different reasons: most RAG demos use pure vector search, which silently fails on exact keyword queries like "F1 score on the NER benchmark" or "Table 3 results." The model then generates from wrong context, or no context at all.

**This project solves both problems.**

It combines BM25 keyword search with dense semantic vector search via an ensemble (Reciprocal Rank Fusion) retriever, re-ranks the fused candidates with Cohere's hosted Rerank API, and forces the LLM to answer only from verified retrieved context — with page-level citations attached to every claim.

---

## What It Actually Does

```
You upload:  "Attention Is All You Need" (Vaswani et al., 2017)

You ask:     "What optimizer and learning rate schedule did they use?"

You get:     "The authors used the Adam optimizer with β₁ = 0.9, β₂ = 0.98,
              and ε = 10⁻⁹. [Source 1, Page 7] The learning rate followed a
              custom schedule that increased linearly for the first warmup_steps
              training steps and then decreased proportionally to the inverse
              square root of the step number. [Source 2, Page 7]"
             
             ↳ Sources: Page 7 (relevance: 0.94), Page 8 (relevance: 0.87)
```

Every answer is grounded. Every claim is cited. No hallucinations.

You can also leave no paper selected in the chat and ask a question across **every** paper in your library at once — the API fans the query out to every indexed collection, merges the candidates, and reranks them together before generating an answer.

---

## Architecture

```
╔══════════════════════════════════════════════════════════════════╗
║                        UPLOAD PIPELINE                           ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  PDF File                                                        ║
║     │                                                            ║
║     ▼                                                            ║
║  PyPDF Loader          → Extracts text, preserves page metadata  ║
║     │                                                            ║
║     ▼                                                            ║
║  RecursiveCharacterTextSplitter                                  ║
║  (chunk_size=500, overlap=50)   → Character-aware boundary split ║
║     │                                                            ║
║     ▼                                                            ║
║  Google Generative AI Embeddings → text-embedding-004 (hosted)   ║
║  (langchain-google-genai)          no local model download       ║
║     │                                                            ║
║     ▼                                                            ║
║  ChromaDB                       → Per-paper isolated collection  ║
║  (HNSW index, cosine similarity)  named by paper_id              ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                        QUERY PIPELINE                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  User Question  (scoped to one paper, or all papers)             ║
║       │                                                          ║
║       ├─────────────────────────────────────┐                   ║
║       │                                     │                   ║
║       ▼                                     ▼                   ║
║  BM25 Retriever               Vector Retriever (ChromaDB)       ║
║  (exact keyword match)        (semantic similarity)             ║
║  per selected collection(s)   per selected collection(s)        ║
║       │                                     │                   ║
║       └──────────────┬──────────────────────┘                   ║
║                      │                                          ║
║                      ▼                                          ║
║         Ensemble Retriever (RRF)                                ║
║         Reciprocal Rank Fusion                                  ║
║         weights: [0.5 BM25, 0.5 Vector]                        ║
║                      │                                          ║
║                      ▼                                          ║
║              Fused Candidates                                   ║
║        (merged across papers if none was selected)              ║
║                      │                                          ║
║                      ▼                                          ║
║         Cohere Rerank API — rerank-v3.5 (hosted)                ║
║         (scores each query/document pair jointly)               ║
║                      │                                          ║
║                      ▼                                          ║
║              Top-k Final Chunks + Scores                        ║
║                      │                                          ║
║                      ▼                                          ║
║         Citation-Aware Prompt Constructor                       ║
║         [Source N — Page X] embedded in context                 ║
║                      │                                          ║
║                      ▼                                          ║
║         Google Gemini 2.5 Flash                                 ║
║         (temperature=0.1, context-only answer)                  ║
║                      │                                          ║
║                      ▼                                          ║
║         Answer + Page Citations + Relevance Scores              ║
║         + Processing time (ms)                                  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Why Hybrid RAG Beats Pure Vector Search

Most tutorials stop at vector search. Here's why that's not enough:

| Query Type | Pure Vector Search | This System |
|:---|:---:|:---:|
| `"What is the paper's main idea?"` | ✅ Semantic match works | ✅ |
| `"What is the F1 score on CoNLL-2003?"` | ❌ Misses — metric names don't embed near questions | ✅ BM25 catches exact terms |
| `"What does Table 3 show?"` | ❌ Numbers and table refs embed poorly | ✅ BM25 finds "Table 3" literally |
| `"Adam optimizer with β₁=0.9"` | ❌ Greek symbols confuse embeddings | ✅ BM25 handles symbols as tokens |
| Correct chunk retrieved, wrong rank returned | ❌ Cosine similarity ≠ relevance | ✅ Rerank API re-scores by true relevance |

**The core insight:** BM25 and dense retrieval fail in opposite directions. BM25 misses paraphrase. Dense retrieval misses exact terms. Combining them covers both failure modes. The reranker then eliminates the remaining false positives by scoring the query against each candidate chunk jointly, instead of relying on pre-computed vector similarity alone.

---

## Tech Stack

| Category | Technology | Why This Choice |
|:---|:---|:---|
| **API Framework** | FastAPI | Async-native, auto Swagger docs, Pydantic validation |
| **ASGI Server** | Uvicorn | Production-grade async server for FastAPI |
| **PDF Parsing** | PyPDF (`PyPDFLoader`) | Reliable text + page metadata extraction |
| **Chunking** | LangChain `RecursiveCharacterTextSplitter` | Respects natural text boundaries |
| **Embeddings** | Google `text-embedding-004` (hosted API) | No local model download — keeps the container lightweight enough for Render's free-tier RAM limit |
| **Vector Store** | ChromaDB | Local HNSW index, per-collection isolation, no separate server needed |
| **Keyword Search** | BM25 (`rank-bm25`) | Gold standard sparse retrieval, handles exact terms |
| **Fusion** | `EnsembleRetriever` (RRF) | Proven merging algorithm, no training required |
| **Reranker** | Cohere Rerank API (`rerank-v3.5`, hosted) | Cross-encoder-style joint scoring without hosting a local model |
| **LLM** | Google Gemini 2.5 Flash | Fast, accurate, generous free tier |
| **Validation** | Pydantic v2 | Schema-level request validation before code runs |
| **Frontend** | React 19 + Vite | Fast HMR dev experience, optimal production builds |
| **Frontend Styling** | Tailwind CSS + Framer Motion | Utility-first styling with animated UI |
| **Containerization** | Docker | Reproducible environment, identical local and prod |
| **Backend Hosting** | Render | Free tier, Docker support, auto-deploy from GitHub |
| **Frontend Hosting** | Vercel | Free tier, Vite-optimized, global CDN |

> **Note:** Earlier versions of this project used a locally-loaded HuggingFace embedding model (`all-MiniLM-L6-v2`) and a locally-loaded cross-encoder reranker (`BAAI/bge-reranker-base`). Both were replaced with hosted APIs (Google embeddings + Cohere rerank) because the local models pushed memory usage past Render's 512MB free-tier limit. Both `GOOGLE_API_KEY` and `COHERE_API_KEY` are required for the backend to run — both have generous free tiers (Cohere's trial key gives 1,000 API calls/month, which resets monthly and comfortably covers demo/portfolio traffic).

---

## API Reference

Base URL: `https://YOUR_BACKEND_URL.onrender.com`

Interactive docs (Swagger UI): `https://YOUR_BACKEND_URL.onrender.com/docs`

### `POST /upload`

Upload and index a PDF research paper.

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|:---|:---|:---:|:---|
| `file` | `File` | ✅ | PDF file, max 10MB by default |
| `paper_name` | `string` | ❌ | Display name (defaults to filename) |

**Response `200`:**
```json
{
  "paper_id": "a3f8b2c1",
  "filename": "attention_is_all_you_need.pdf",
  "num_pages": 15,
  "num_chunks": 87,
  "status": "indexed",
  "message": "Successfully indexed 87 chunks from 15 pages"
}
```

**Errors:**
| Code | Reason |
|:---|:---|
| `400` | Not a PDF, file too large, or file appears empty |
| `422` | PDF is empty or unreadable |
| `500` | Internal processing failure |

---

### `POST /query`

Ask a question about an uploaded paper — or across the whole library.

**Request body:** `application/json`

```json
{
  "question": "What optimizer and learning rate schedule did the authors use?",
  "paper_id": "a3f8b2c1",
  "top_k": 5
}
```

| Field | Type | Required | Constraints |
|:---|:---|:---:|:---|
| `question` | `string` | ✅ | 3–1000 characters |
| `paper_id` | `string \| null` | ❌ | If given, must exist in the paper registry. If omitted/null, searches **all** indexed papers. |
| `top_k` | `integer` | ❌ | 1–10, default 5 |

**Response `200`:**
```json
{
  "answer": "The authors used the Adam optimizer with β₁ = 0.9, β₂ = 0.98 [Source 1, Page 7]. The learning rate followed a warmup schedule for the first 4000 steps [Source 2, Page 7].",
  "sources": [
    {
      "paper": "attention_is_all_you_need.pdf",
      "page": 7,
      "content_preview": "We used the Adam optimizer with β1 = 0.9, β2 = 0.98 and ε = 10−9...",
      "relevance_score": 0.9423
    }
  ],
  "paper_id": "a3f8b2c1",
  "question": "What optimizer and learning rate schedule did the authors use?",
  "processing_time_ms": 2341.5
}
```

**Errors:**
| Code | Reason |
|:---|:---|
| `400` | No papers uploaded yet (only possible when `paper_id` is omitted) |
| `404` | The given `paper_id` doesn't exist |
| `500` | Retrieval or generation failure |

---

### `GET /papers`

List all uploaded and indexed papers.

**Response `200`:**
```json
[
  {
    "paper_id": "a3f8b2c1",
    "filename": "attention_is_all_you_need.pdf",
    "upload_time": "2026-07-08T15:25:00",
    "num_pages": 15,
    "num_chunks": 87
  }
]
```

---

### `DELETE /papers/{paper_id}`

Remove a paper and all its indexed data.

**Response `200`:**
```json
{
  "message": "Paper a3f8b2c1 deleted successfully",
  "paper_id": "a3f8b2c1"
}
```

---

### `GET /health`

Health check used by deployment platforms.

**Response `200`:**
```json
{
  "status": "healthy",
  "environment": "production",
  "papers_indexed": 3
}
```

---

## Project Structure

```
research-rag/
│
├── backend/                         # FastAPI application
│   ├── main.py                      # App entry point, all route handlers, CORS setup
│   ├── config.py                    # Pydantic settings, env var loading
│   ├── models.py                    # Request/response Pydantic schemas
│   ├── Dockerfile                   # Container definition (used by Render)
│   ├── requirements.txt             # Pinned Python dependencies
│   ├── .env.example                 # Environment variable template
│   ├── .gitignore                   # Excludes .env, chroma_db, venv
│   │
│   ├── rag/                         # Core RAG pipeline (single responsibility)
│   │   ├── __init__.py
│   │   ├── ingestion.py             # PDF → chunks → Google embeddings → ChromaDB
│   │   ├── retrieval.py             # BM25 + vector ensemble + Cohere rerank (single-paper & cross-library)
│   │   └── generation.py            # Prompt construction + Gemini generation
│   │
│   └── storage/
│       ├── __init__.py
│       └── paper_store.py           # JSON-backed paper metadata registry
│
├── frontend/                        # React + Vite application
│   ├── src/
│   │   ├── App.jsx                  # Root component (providers + layout)
│   │   ├── main.jsx                 # React entry point
│   │   ├── index.css                # Tailwind + global styles
│   │   ├── pages/
│   │   │   └── HomePage.jsx         # Composes all sections into one page
│   │   ├── components/              # Navbar, Hero, Upload, PaperLibrary, Chat, Citation, Stats, Toast, ...
│   │   ├── hooks/
│   │   │   ├── usePapers.js         # Paper list fetching, selection, upload state
│   │   │   ├── useChat.js           # Chat state, sends /query, animates pipeline stages
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── httpClient.js        # Fetch wrapper + API_BASE_URL (reads VITE_API_URL)
│   │   │   └── api.js               # getPapers / uploadPaper / queryPapers calls
│   │   └── utils/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example                 # VITE_API_URL template
│
├── DEPLOYMENT.md                    # Full step-by-step deploy + connect + test guide
└── README.md                        # This file
```

---

## Run Locally

### Prerequisites

- Python 3.11+
- Node.js 18+
- A free [Google AI Studio](https://aistudio.google.com/) API key (for both the LLM and the embeddings)
- A free [Cohere](https://dashboard.cohere.com/api-keys) API key (for reranking)

### 1. Clone the repository

```bash
git clone https://github.com/MohammedSaifAkkiwat/research-rag.git
cd research-rag
```

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
```

Open `.env` and add your keys:
```env
GOOGLE_API_KEY=your_google_api_key_here
COHERE_API_KEY=your_cohere_api_key_here
APP_ENV=development
MAX_FILE_SIZE_MB=10
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

```bash
# Start the backend
uvicorn main:app --reload --port 8000
```

✅ Backend running at `http://localhost:8000`
✅ Interactive API docs at `http://localhost:8000/docs`

### 3. Frontend setup

```bash
# New terminal
cd research-rag/frontend

npm install

cp .env.example .env.local
# .env.local should contain: VITE_API_URL=http://localhost:8000

npm run dev
```

✅ Frontend running at `http://localhost:5173`

### 4. Docker (alternative for backend)

```bash
cd backend
docker build -t research-rag-api .
docker run -p 8000:8000 --env-file .env research-rag-api
```

---

## Deploy Your Own (Free)

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the full, click-by-click walkthrough — pushing to GitHub, deploying the backend on Render, deploying the frontend on Vercel, connecting the two, and verifying everything works end-to-end.

---

## Key Engineering Decisions

### Why per-paper ChromaDB collections instead of one shared collection?

Each paper gets its own Chroma collection named by `paper_id`. The alternative — one collection with metadata filtering — has a subtle problem: metadata filters in ChromaDB apply post-embedding-retrieval, so you still spend time computing similarity against irrelevant papers. Isolated collections mean ANN search only ever touches the target paper's vectors. It also enables clean deletion without re-indexing, and makes cross-library search a simple fan-out over N small collections instead of one giant filtered one.

### Why hosted embedding and rerank APIs instead of local models?

The project originally loaded a local HuggingFace embedding model and a local cross-encoder reranker at startup. Both together comfortably exceeded Render's 512MB free-tier RAM limit, causing deploys to crash. Switching to Google's hosted embeddings API and Cohere's hosted Rerank API removed `torch`/`sentence-transformers` from the dependency tree entirely — trading a small amount of network latency per request for a container that reliably fits in free-tier memory.

### Why two retrieval stages instead of just using a better reranker everywhere?

A reranker that scores query-document pairs jointly is far more accurate than cosine similarity alone, but it's also much more expensive to run against an entire corpus. The solution: use fast approximate retrieval (BM25 + ANN vector search) to get a small set of high-recall candidates, then send only those candidates to the reranker. You get recall from the first stage and precision from the second, at a fraction of the cost of reranking everything.

### Why `async/await` throughout the API?

LLM inference via the Gemini API takes a few seconds of network I/O, and both the embedding and rerank calls are also network round-trips. A synchronous server blocks during these waits — no other requests can be processed. `async/await` releases control during I/O waits so other requests can proceed concurrently. For an API where most of the request time is spent waiting on external services, async is what keeps the server usable under concurrent load.

### Why does `/query` accept an optional `paper_id`?

The UI supports two modes: chatting with one selected paper, or leaving the filter cleared to search everything in the library at once. The retriever runs its BM25+vector hybrid stage per paper collection and merges the candidates before a single final rerank pass — so cross-library search isn't just "search the first paper," it genuinely considers every indexed paper.

---

## What I Learned

**RAG is a retrieval problem, not a generation problem.** In testing, the large majority of wrong answers traced back to retrieving the wrong chunks — not to the LLM generating incorrectly from good context. The LLM is surprisingly reliable when given the right text. The hard part is getting it the right text.

**The "lost in the middle" problem is real.** Larger context windows don't mean better answers. LLMs pay more attention to text at the beginning and end of their context. Sending a handful of highly-relevant chunks outperforms sending many mediocre ones.

**Free-tier memory limits shape architecture.** Loading local embedding and reranking models is the "textbook" RAG approach, but it isn't free to run. Moving both to hosted APIs was the difference between a service that crashes on deploy and one that runs reliably within a free hosting tier.

**A `null` where the API expects a `string` fails loudly for a reason.** Pydantic's strict validation on `/query` caught a real frontend bug (a chat request could fire before a paper was selected) instead of silently doing the wrong thing. The fix was to decide what "no paper selected" should actually mean — search everything — and make the API support that intentionally, rather than papering over the validation error.

---

## Roadmap

- [ ] Streaming responses for real-time answer generation
- [ ] SQLite for production-grade paper metadata storage
- [ ] Rate limiting per IP address
- [ ] HyDE (Hypothetical Document Embedding) for improved retrieval
- [ ] RAGAS-based automated evaluation dashboard
- [ ] User authentication with API keys

---

## License

MIT License — use this for anything, commercial or otherwise.

---

<div align="center">

Built by **[MOHAMMED SAIF AKKIWAT](https://github.com/MohammedSaifAkkiwat)**

If this helped you understand production RAG systems, a ⭐ goes a long way.

</div>
