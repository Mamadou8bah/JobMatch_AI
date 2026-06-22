# Deploy to Hugging Face Space (`mamadoubah/jobmatch`)

This folder is configured as a **Docker Space** for [mamadoubah/jobmatch](https://huggingface.co/spaces/mamadoubah/jobmatch).

## 1. Create the Space (one time)

1. Go to [huggingface.co/new-space](https://huggingface.co/new-space)
2. **Owner:** `mamadoubah`
3. **Space name:** `jobmatch`
4. **SDK:** Docker
5. **Visibility:** Public (or Private)
6. Create the Space

## 2. Add secrets on Hugging Face

Space → **Settings** → **Repository secrets**:

| Secret | Value |
|--------|--------|
| `GEMINI_API_KEY` | Your key from [Google AI Studio](https://aistudio.google.com) |
| `GEMINI_MODEL` | `gemini-2.5-flash` (optional) |

## 3. Push this folder to the Space

### Option A — Script (Windows)

From the repo root, with a [HF access token](https://huggingface.co/settings/tokens) (write):

```powershell
$env:HF_TOKEN = "hf_your_token_here"
.\Ai_Engine\scripts\push-hf-space.ps1
```

### Option B — Manual git push

```powershell
cd $env:TEMP
git clone https://huggingface.co/spaces/mamadoubah/jobmatch
cd jobmatch

robocopy "C:\path\to\JobMatch_AI\Ai_Engine" . /E /XD .venv __pycache__ .git scripts /XF .env

git add .
git commit -m "Deploy JobMatch AI Engine"
git push
```

When prompted for password, use your Hugging Face **access token** (not your account password).

## 4. Wait for the build

Space → **Logs**. First build can take **10–20 minutes** (downloads PyTorch + embedding model).

When ready, test:

- Health: `https://mamadoubah-jobmatch.hf.space/health`
- API docs: `https://mamadoubah-jobmatch.hf.space/docs`

## 5. Point Render backend to the Space

On Render, set:

```env
AI_ENGINE_URL=https://mamadoubah-jobmatch.hf.space
AI_ENGINE_TIMEOUT_MS=60000
```

Free Spaces **sleep** when idle; the first request after sleep may take 30–60 seconds.

## Files used by the Space

| File | Purpose |
|------|---------|
| `README.md` | HF Space metadata (YAML frontmatter) |
| `Dockerfile` | Docker build for the Space |
| `requirements-docker.txt` | Python deps (CPU PyTorch installed separately) |
| `.dockerignore` | Keeps image small |
