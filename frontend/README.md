# ResearchAI — Research Paper RAG Frontend

A production-quality, dark-mode-only frontend for a hybrid-retrieval (BM25 + vector + reranking)
research-paper chat application. Built with React, Vite, Tailwind CSS, Framer Motion, and
shadcn/ui-style primitives. This repo is **frontend only** — it talks to your existing FastAPI
backend and never assumes or modifies backend behavior.

---

## 1. Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

To build for production:

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

Requirements: Node.js 18+.

---

## 2. Connecting to your backend

The **only** configuration needed is the backend base URL, set via an environment variable.

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env`:
   ```
   VITE_API_URL=http://localhost:8000
   ```
   This should point at your running FastAPI server (no trailing slash).

That's it — every API call in the app is built from this one variable
(`src/services/httpClient.js`). Nothing else needs to change to point the frontend at a
different backend (local, staging, production).

### Expected backend contract

The app calls exactly these three endpoints and does not modify them:

| Method | Path       | Purpose                          |
|--------|-----------|-----------------------------------|
| GET    | `/papers`  | List all indexed papers           |
| POST   | `/upload`  | Upload + index a PDF (multipart)  |
| POST   | `/query`   | Ask a question, get an answer + sources |

**`GET /papers`** → array of paper objects. The UI defensively reads several possible field
names so it works with minor schema variations:
- name: `paper_name` / `name` / `title`
- id: `paper_id` / `id`
- pages: `num_pages` / `pages`
- chunks: `num_chunks` / `chunks`
- status: `status`
- date: `uploaded_at` / `created_at` / `date`

**`POST /upload`** (multipart form: `file`, `paper_name`) → `{ paper_id, num_pages, num_chunks, status }`

**`POST /query`** (JSON: `{ question, paper_id, top_k }`) → `{ answer, sources: [...], processing_time_ms }`.
Each item in `sources` is read defensively too:
- text: `content` / `text` / `chunk_text` / `chunk`
- page: `page` / `page_number` / `metadata.page`
- score: `score` / `relevance_score` / `similarity` / `rerank_score` (accepts either a
  0–1 fraction or a 0–100 value)
- paper name: `paper_name` / `source` / `metadata.paper_name`

If your backend's field names differ from all of the above, the single place to adjust is
`src/services/api.js` (the request/response shape) and the small "defensive read" lines in
`PaperCard.jsx`, `CitationCard.jsx`, and `ChatSection.jsx` — search each file for the
`||`-chained field lookups.

**No backend code was written or modified by this project.** If you ever need new fields
(e.g. real per-source page thumbnails, or a streaming `/query` endpoint), that requires a
backend change — this frontend is built to degrade gracefully without it, but will look even
better with it (see §6).

---

## 3. What's a placeholder vs. what's real

Almost nothing is hardcoded — nearly every number and label on the page comes from your
backend responses. The few cosmetic exceptions:

| Location | Placeholder | Replace with |
|---|---|---|
| `src/components/Navbar/Navbar.jsx`, `Footer.jsx` | `href="https://github.com/MohammedSaifAkkiwat/research-rag"` | Your actual repo URL |
| `Footer.jsx` | `#docs` anchor | A real documentation route/URL, or remove the link |
| `src/components/Stats/StatsSection.jsx` | `"Gemini"` badge text | Your actual generation model name (or read it from a backend field if you add one, e.g. `response.model`) |
| `index.html` | title/meta description | Your project name/description if different |
| `public/favicon.svg` | Generated gradient mark | Your own logo, if you have one |
| `src/components/Chat/MessageList.jsx` | `SUGGESTIONS` array (3 example questions) | Prompts relevant to your actual paper corpus |

There are **no fake/mock API responses** anywhere — the paper library, chat answers, citations,
and stats are 100% driven by what your backend returns. If the backend is offline, you'll see
real error states (toasts + retry buttons), not silently-fake data.

---

## 4. Project structure

```
src/
  components/
    AnimatedBackground/  fixed ambient grid + aurora + noise background
    FloatingCubes/         signature hero visual (3D CSS cubes)
    Navbar/                sticky glass nav
    Hero/                  headline, CTAs, floating cubes
    Upload/                dropzone, indexing-step visualization
    PaperLibrary/          grid of indexed papers + loading/empty/error states
    PaperCard/             a single paper card
    Chat/                  message list, bubbles, markdown, input box
    Citation/              expandable citation cards + panel
    RetrievalStatus/       animated hybrid-retrieval pipeline indicator
    Stats/                 animated stat cards
    Footer/
    Toast/                 toast notification system (replaces alert())
    Loading/               spinner primitive
    ui/                    shadcn-style primitives: Button, Card, Badge, Progress, Skeleton
  hooks/
    usePapers.js           paper list + upload state
    useChat.js              chat message state + simulated retrieval-stage pipeline
    useToast.jsx            toast context/provider
    useCountUp.js           animated number counters
    useInView.js            scroll-reveal trigger
    useMouseParallax.js    hero pointer parallax
  services/
    httpClient.js          fetch wrapper, error normalization, VITE_API_URL
    api.js                 the 3 backend calls (getPapers, uploadPaper, queryPapers)
  pages/
    HomePage.jsx           composes all sections in order
  utils/
    cn.js                   Tailwind class merge helper
    format.js               date/byte/latency/score formatting
```

Nothing lives in one giant file — `App.jsx` is ~12 lines, `HomePage.jsx` just wires hooks to
sections.

---

## 5. Design system

- **Dark mode only.** Background is a near-black `#08080D`, never pure black.
- **Accent pair:** violet (`#8B5CF6`) → cyan (`#22D3EE`), used throughout to represent the
  "hybrid" (lexical + vector) nature of the retrieval system.
- **Typography:** Space Grotesk (headings), Inter (body), JetBrains Mono (stats/scores/badges).
- **Glassmorphism:** `.glass` / `.glass-strong` utility classes in `src/index.css`.
- All colors, radii, shadows, and animation timings are defined once in `tailwind.config.js` —
  change the palette there and it propagates everywhere.

### Simulated pipeline visualization

The backend's `/query` endpoint responds in a single round trip (no streaming), so the
"Searching BM25 → Searching vector DB → Hybrid retrieval → Reranking → Generating" indicator
(`RetrievalStatus.jsx`) advances on a timer while the request is in flight, and always resolves
correctly against the real response when it arrives — it never fakes a wrong answer or wrong
timing, it just visualizes a pipeline that's genuinely running server-side. If you later add
Server-Sent Events or WebSocket streaming to `/query` for real stage-by-stage progress, swap
the timer in `src/hooks/useChat.js` for real events from the stream — the UI component
(`RetrievalStatus`) doesn't need to change.

---

## 6. Optional backend enhancements (not required)

The app works fully against the endpoints exactly as specified. If you're open to touching the
backend later, these would upgrade the experience further — **explained here, not assumed
anywhere in the code**:

1. **Streaming `/query`** (SSE or WebSocket) so retrieval stages and token-by-token generation
   are real rather than simulated.
2. **`model` field** in `/query`'s response so the Stats section can show your actual LLM name
   instead of the static "Gemini" label.
3. **`uploaded_at`** timestamp in `/upload`'s response and `/papers` list items, if not already
   present, so the "Date uploaded" on each card is always accurate.

None of these are required to run the app today.

---

## 7. Deployment

**Frontend → Vercel**
1. Push this repo to GitHub.
2. Import it in Vercel, framework preset "Vite".
3. Set an environment variable `VITE_API_URL` to your deployed backend's URL (e.g. your Render
   service URL).
4. Deploy. Build command `npm run build`, output directory `dist`.

**Backend → Render** (unchanged, already exists per the brief)
- Just make sure CORS on the FastAPI app allows your Vercel domain.

No other config changes are needed between environments — only `VITE_API_URL`.

---

## 8. Accessibility & performance notes

- All interactive elements have visible focus rings (`:focus-visible`) and `aria-*` labels.
- Respects `prefers-reduced-motion` (animations are disabled/shortened).
- Mouse-parallax background effect is skipped on touch devices.
- Sections use `viewport={{ once: true }}` scroll reveals so animations don't replay and cost
  CPU on every scroll.
- Toast notifications, retrieval status, and indexing steps replace all `alert()`/`confirm()`
  usage with non-blocking, accessible (`aria-live`) UI.

---

## 9. Tech stack

React 19 · Vite · Tailwind CSS 3 (+ `@tailwindcss/typography`) · Framer Motion · Lucide React ·
react-dropzone · react-markdown + remark-gfm + rehype-highlight
