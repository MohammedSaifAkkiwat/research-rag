# Deployment Guide

This is a complete, click-by-click walkthrough for taking this project from a folder on your computer to a live site: code on GitHub, backend live on Render, frontend live on Vercel, the two talking to each other, and a final checklist to confirm nothing is broken.

Follow the sections in order. Don't skip the "Get your API keys" section — both hosting steps need those keys.

---

## 0. Get your API keys (do this first)

You need two free API keys before deploying anything.

### Google API key (embeddings + LLM)

1. Go to **https://aistudio.google.com/apikey**
2. Sign in with a Google account.
3. Click **Create API key**.
4. Choose "Create API key in new project" if asked.
5. Copy the key that appears (starts with `AIza...`). Save it somewhere temporarily — you'll paste it into Render later.

This single key is used for both the embedding model (`text-embedding-004`) and the answer-generation model (`gemini-2.5-flash`). The free tier is generous and is what this project is built around.

### Cohere API key (reranking)

1. Go to **https://dashboard.cohere.com/api-keys**
2. Sign up / sign in (no credit card required).
3. A **Trial key** is created automatically — click the copy icon next to it.
4. Save it temporarily as well.

The trial key gives you 1,000 API calls per month, shared across Cohere's endpoints, and it resets every month — it doesn't expire or run out permanently. That's more than enough for a demo/portfolio project.

You should now have two strings saved somewhere:
```
GOOGLE_API_KEY = AIza...
COHERE_API_KEY = ...
```

---

## 1. Push the project to GitHub

You said you'll create a new repository named **`research-rag`** under your GitHub account. Here's how to push this folder into it.

### 1.1 Create the repository on GitHub

1. Go to **https://github.com/new**
2. Repository name: `research-rag`
3. Keep it **Public** (required for Render/Vercel free tiers to pull from it easily) or Private if you prefer — both work, Private just requires you to authorize Render/Vercel to access it during setup.
4. **Do NOT** check "Add a README", "Add .gitignore", or "Choose a license" — this project folder already has all three. Adding them on GitHub will cause a conflict when you push.
5. Click **Create repository**.
6. GitHub will show you a page with setup instructions and a URL like:
   ```
   https://github.com/YOUR_GITHUB_USERNAME/research-rag.git
   ```
   Copy that URL.

### 1.2 Push this folder to it

Open a terminal, `cd` into this project folder (the one containing `backend/`, `frontend/`, and this file), then run:

```bash
git init
git add .
git commit -m "Initial commit: hybrid RAG research paper assistant"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/research-rag.git
git push -u origin main
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username in the URL.

If you're asked to log in, use a GitHub Personal Access Token as the password (GitHub no longer accepts your account password over the command line):
1. Go to **https://github.com/settings/tokens** → **Generate new token (classic)**
2. Check the `repo` scope.
3. Generate, copy the token, and paste it as the password when git prompts you.

### 1.3 Verify

Refresh your GitHub repo page in the browser. You should see the `backend/` and `frontend/` folders, this `DEPLOYMENT.md`, and `README.md`. If you see them, the push worked.

**Important:** Check that `backend/.env` and `frontend/.env.local` are **NOT** in the repo (they shouldn't be — `.gitignore` excludes them). If you accidentally see a `.env` file with real API keys in it on GitHub, delete it from the repo immediately and rotate (regenerate) those keys, since they're now public.

---

## 2. Deploy the backend on Render

### 2.1 Create the Web Service

1. Go to **https://render.com** and sign up / log in (GitHub sign-in is easiest — it also grants repo access in one step).
2. Click **New** → **Web Service**.
3. Under "Build and deploy from a Git repository", find and select your `research-rag` repo. If it's not listed, click **Configure account** and grant Render access to it.
4. Click **Connect**.

### 2.2 Configure the service

Fill in these settings exactly:

| Field | Value |
|:---|:---|
| **Name** | `research-rag-api` (or anything you like — this becomes part of your URL) |
| **Region** | Whichever is closest to you |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Docker` |
| **Instance Type** | `Free` |

Render will detect the `Dockerfile` inside `backend/` automatically once you set the Root Directory — you don't need to set a build or start command manually.

### 2.3 Add environment variables

Still on the same setup page (or under the **Environment** tab if you've already created the service), add these:

| Key | Value |
|:---|:---|
| `GOOGLE_API_KEY` | *(the key you saved in Step 0)* |
| `COHERE_API_KEY` | *(the key you saved in Step 0)* |
| `APP_ENV` | `production` |
| `MAX_FILE_SIZE_MB` | `10` |
| `ALLOWED_ORIGINS` | `http://localhost:5173` *(temporary — you'll update this in Step 4 once you have a real Vercel URL)* |

### 2.4 Deploy

Click **Create Web Service** (or **Deploy** if you were already on the service page). Render will build the Docker image and start the container. This takes 3–6 minutes the first time.

Watch the **Logs** tab. You're looking for:
```
🚀 Starting RAG API...
✅ RAG API ready
```

If you see that, the backend is live. Render will show your live URL at the top of the page, something like:
```
https://research-rag-api.onrender.com
```

**Copy this URL** — you'll need it for the frontend in Step 3.

### 2.5 Verify the backend directly

Visit `https://YOUR_BACKEND_URL.onrender.com/health` in your browser. You should see:
```json
{"status":"healthy","environment":"production","papers_indexed":0}
```

Also visit `https://YOUR_BACKEND_URL.onrender.com/docs` — this is FastAPI's auto-generated Swagger UI. You should see all the endpoints (`/upload`, `/query`, `/papers`, etc.) listed and be able to expand them. If both pages load, the backend deployment is fully working.

> **Free tier behavior:** Render's free instances "sleep" after 15 minutes of no traffic. The next request after sleeping takes 30–50 seconds to respond while the container cold-starts. This is expected — not a bug. Your first test after any period of inactivity will feel slow; subsequent requests will be fast again.

---

## 3. Deploy the frontend on Vercel

### 3.1 Import the project

1. Go to **https://vercel.com** and sign up / log in (GitHub sign-in recommended).
2. Click **Add New** → **Project**.
3. Find your `research-rag` repo in the list and click **Import**. If it's not listed, click **Adjust GitHub App Permissions** and grant access.

### 3.2 Configure the project

Vercel will show a configuration screen:

| Field | Value |
|:---|:---|
| **Framework Preset** | `Vite` *(should auto-detect)* |
| **Root Directory** | Click **Edit** next to it → select `frontend` |
| **Build Command** | `npm run build` *(should auto-fill)* |
| **Output Directory** | `dist` *(should auto-fill)* |
| **Install Command** | `npm install` *(should auto-fill)* |

### 3.3 Add the environment variable

Expand **Environment Variables** and add:

| Key | Value |
|:---|:---|
| `VITE_API_URL` | `https://YOUR_BACKEND_URL.onrender.com` *(the Render URL from Step 2.4 — no trailing slash)* |

### 3.4 Deploy

Click **Deploy**. This takes 1–2 minutes. When it finishes, Vercel shows a preview and a live URL like:
```
https://research-rag-yourname.vercel.app
```

**Copy this URL** — you need it for Step 4.

---

## 4. Connect them: update CORS on the backend

Right now the backend only trusts `http://localhost:5173` as an allowed origin. Your live Vercel frontend is a different origin, so browser requests from it will currently be **blocked by CORS** even though both services are individually running fine. This is the single most common "it works locally but not when deployed" issue — fix it now:

1. Go back to your Render dashboard → your `research-rag-api` service → **Environment** tab.
2. Edit the `ALLOWED_ORIGINS` variable to include your real Vercel URL(s), comma-separated, no spaces:
   ```
   http://localhost:5173,https://research-rag-yourname.vercel.app
   ```
   > Tip: Vercel also creates preview URLs for every git push (like `research-rag-abc123-yourname.vercel.app`). If you want those to work too, add them here as well. Your main production URL is the one that matters most.
3. Click **Save Changes**. Render will automatically redeploy the backend with the new setting (takes ~1 minute).
4. Wait for the deploy to finish (check the **Logs** tab for `✅ RAG API ready` again).

---

## 5. End-to-end test

Now confirm the whole pipeline actually works, in this order:

### 5.1 Open the live site

Visit your Vercel URL: `https://research-rag-yourname.vercel.app`

The page should load with no visible errors. Open your browser's DevTools console (F12) — there should be no red CORS or network errors on page load.

### 5.2 Upload a paper

1. Scroll to (or click a button that takes you to) the upload section.
2. Upload any PDF research paper (a few pages, under 10MB).
3. Wait for the "Indexed successfully" confirmation with page/chunk counts.

If this fails with a network error, double-check `VITE_API_URL` in Vercel matches your Render URL exactly (Step 3.3), and that the Render service is awake (visit `/health` directly first to wake it up if it's been idle).

### 5.3 Ask a question

1. Go to the chat section. The paper you just uploaded should already be selected (shown as a chip near the top of the chat).
2. Ask something specific from the paper, e.g. "What is this paper about?" or "What dataset did they use?"
3. You should get an answer within a few seconds, with source citations (page numbers and relevance scores) shown below it.

### 5.4 Test cross-library search

1. Click the **✕** on the selected-paper chip to clear the filter (or upload a second paper and don't select either).
2. Ask a question again. It should still return an answer — this confirms the "search across all papers" path works, not just the single-paper path.

### 5.5 Confirm via the API docs directly (optional but useful)

Visit `https://YOUR_BACKEND_URL.onrender.com/docs`, expand `GET /papers`, click **Try it out** → **Execute**. You should see the paper(s) you uploaded from the live site listed in the response — this confirms the frontend and backend are genuinely talking to the same backend instance and the same data.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|:---|:---|:---|
| Frontend loads but upload/chat requests fail with a network error / CORS error in the console | `ALLOWED_ORIGINS` on Render doesn't include your exact Vercel URL, or `VITE_API_URL` on Vercel is wrong/missing | Re-check Steps 3.3 and 4. Redeploy after any env var change (Vercel: redeploy from the dashboard; Render: saves trigger auto-redeploy). |
| First request after a while takes ~30-50 seconds then works | Render free tier cold start | Expected behavior, not a bug. Visit `/health` first to "wake" it before demoing. |
| `POST /upload` returns `400 Only PDF files are accepted` | You uploaded a non-PDF file | Use a `.pdf` file. |
| `POST /query` returns `400 No papers have been uploaded yet` | The library is empty | Upload a paper first. |
| Render build fails | Usually a typo in Root Directory (must be exactly `backend`) or Runtime not set to `Docker` | Re-check Step 2.2 settings. |
| Vercel build fails | Root Directory not set to `frontend`, or a missing env var causing a build-time crash | Re-check Step 3.2/3.3. Check the Vercel build logs for the exact error. |
| Backend deploys but `/health` shows an error / service crashes on start | Missing or invalid `GOOGLE_API_KEY` / `COHERE_API_KEY` | Re-check Step 2.3 — both keys are required, with no extra quotes or spaces. |

---

## After deployment: keep both services warm (optional)

If you're sharing this project (e.g. in a portfolio or with recruiters) and don't want the first visitor to hit a 30-50s cold start, you can use a free uptime-monitoring service (e.g. UptimeRobot, cron-job.org) to ping `https://YOUR_BACKEND_URL.onrender.com/health` every 10-14 minutes, keeping the Render free instance awake. This is optional and not required for the app to function correctly.
