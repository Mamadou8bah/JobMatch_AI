# JobMatch AI Engine

Python AI module for **JobMatch AI** — resume parsing, embedding-based job matching, skills-gap analysis, training recommendations, and a career guidance chatbot for Gambian job seekers.

## Modules

| Module | File | Description |
|--------|------|-------------|
| Resume Parser | `resume_parser.py` | Extract structured data from PDF/DOCX CVs (Gemini) |
| Matching Engine | `matching_engine.py` | Sentence-BERT embeddings + skills overlap scoring |
| Skills Gap | `skills_gap.py` | Compare candidate vs required skills (local) |
| Training Recommender | `training_recommender.py` | Static course map + Gemini fallback |
| Career Chatbot | `chatbot.py` | Gemini-powered career guidance |

## Setup

```bash
cd Ai_Engine
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Create `Ai_Engine/.env` (never commit this file):

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Get a free key at [Google AI Studio](https://aistudio.google.com).

## Direct Import (for backend integration)

From the repository root (`JobMatch_AI/`):

```python
from Ai_Engine.resume_parser import parse_resume
from Ai_Engine.matching_engine import compute_match_score
from Ai_Engine.skills_gap import analyze_gap
from Ai_Engine.training_recommender import get_recommendations
from Ai_Engine.chatbot import get_chatbot_reply

# Parse a CV file
result = parse_resume("path/to/cv.pdf")

# Compute match score
match = compute_match_score(
    candidate_skills=["Python", "Django", "SQL"],
    candidate_experience="2 years backend developer",
    candidate_education="BSc Computer Science",
    job_title="Backend Developer",
    job_description="Django and PostgreSQL experience required...",
    job_required_skills=["Python", "Django", "PostgreSQL", "Git"],
)

# Analyze skills gap
gap = analyze_gap(["Python", "Django"], ["Python", "Django", "Docker", "Git"])

# Get training recommendations
courses = get_recommendations(["Docker", "Git"], job_title="Backend Developer")

# Chatbot
reply = get_chatbot_reply(
    user_message="What skills should I learn next?",
    user_profile={"skills": ["Python"], "education": "BSc CS", "experience": "1 year"},
)
```

## HTTP Server (NestJS backend)

The NestJS backend calls the AI engine over HTTP at `http://localhost:8000` by default.

```bash
# From repository root
python -m Ai_Engine
```

Or:

```bash
uvicorn Ai_Engine.server:app --host 0.0.0.0 --port 8000
```

Set in the backend `.env`:

```env
AI_ENGINE_URL=http://localhost:8000
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/resume/parse` | Parse CV text |
| POST | `/resume/parse-file` | Parse base64-encoded CV file |
| POST | `/matching/job` | Compute candidate–job match score |
| POST | `/skills/gap` | Analyze skills gap |
| POST | `/training/recommendations` | Recommend training courses |
| POST | `/chat/career` | Career guidance chatbot |
| POST | `/chat/roadmap` | Learning roadmap generator |

## Error Handling

All functions return JSON-serializable dicts. On failure:

```json
{
  "error": true,
  "message": "Description of what went wrong"
}
```

## Performance Notes

- **Matching engine** runs locally with `all-MiniLM-L6-v2` — first call loads the model (~90MB).
- Target: matching completes in **under 2 seconds** after model warm-up.
- Gemini modules require `GEMINI_API_KEY` in `.env` and use **Gemini 2.5 Flash** by default (`GEMINI_MODEL=gemini-2.5-flash`).

## Static Training Data

`skills_courses_map.json` contains 80+ curated free courses mapped to common skills. Unknown skills fall back to Gemini.
