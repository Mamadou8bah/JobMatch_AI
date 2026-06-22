"""FastAPI HTTP server — exposes AI Engine endpoints for the NestJS backend."""

from __future__ import annotations

import base64
import os
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .chatbot import get_chatbot_reply, get_learning_roadmap
from .matching_engine import compute_match_score
from .resume_parser import parse_resume, parse_resume_text, to_backend_resume_format
from .skills_gap import analyze_gap
from .training_recommender import get_recommendations, to_backend_recommendation_format
from .utils import GEMINI_API_KEY, GEMINI_MODEL

app = FastAPI(
    title="JobMatch AI Engine",
    description="Resume parsing, matching, skills gap, training recommendations, and career chatbot.",
    version="1.0.0",
)


class ResumeParseRequest(BaseModel):
    text: str | None = None
    skills: list[str] | None = None
    education: list[str] | None = None
    experience: list[str] | None = None


class ResumeParseFileRequest(BaseModel):
    fileName: str
    mimeType: str
    contentBase64: str


class CandidatePayload(BaseModel):
    id: str | None = None
    skills: list[str] = Field(default_factory=list)
    cvText: str | None = None
    education: list[str] | str | None = None
    experience: list[str] | str | None = None


class JobPayload(BaseModel):
    id: str
    title: str
    description: str
    requiredSkills: list[str] = Field(default_factory=list)
    experienceLevel: str | None = None


class MatchRequest(BaseModel):
    candidate: CandidatePayload
    job: JobPayload


class SkillsGapRequest(BaseModel):
    candidateSkills: list[str] = Field(default_factory=list)
    requiredSkills: list[str] = Field(default_factory=list)


class TrainingRequest(BaseModel):
    missingSkills: list[str] = Field(default_factory=list)
    jobTitle: str | None = None


class ChatRequest(BaseModel):
    message: str
    userId: str | None = None
    conversation_history: list[dict[str, Any]] | None = None
    user_profile: dict[str, Any] | None = None


class RoadmapRequest(BaseModel):
    goal: str
    currentSkills: list[str] = Field(default_factory=list)
    userId: str | None = None


def _raise_if_error(result: dict[str, Any]) -> None:
    if result.get("error"):
        raise HTTPException(status_code=422, detail=result.get("message", "AI engine error"))


@app.get("/health")
def health_check() -> dict[str, str | bool]:
    return {
        "status": "ok",
        "service": "jobmatch-ai-engine",
        "geminiModel": GEMINI_MODEL,
        "geminiConfigured": bool(GEMINI_API_KEY),
    }


@app.post("/resume/parse")
def resume_parse(body: ResumeParseRequest) -> dict[str, Any]:
    if body.text:
        result = parse_resume_text(body.text)
    elif body.skills or body.education or body.experience:
        synthetic_text = "\n".join(
            [
                f"Skills: {', '.join(body.skills or [])}",
                f"Education: {', '.join(body.education or [])}",
                f"Experience: {', '.join(body.experience or [])}",
            ]
        )
        result = parse_resume_text(synthetic_text)
    else:
        raise HTTPException(status_code=400, detail="Provide CV text or profile fields.")

    _raise_if_error(result)
    return to_backend_resume_format(result)


@app.post("/resume/parse-file")
def resume_parse_file(body: ResumeParseFileRequest) -> dict[str, Any]:
    try:
        file_bytes = base64.b64decode(body.contentBase64)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid base64 content: {exc}") from exc

    result = parse_resume(file_bytes, filename=body.fileName)
    _raise_if_error(result)
    return to_backend_resume_format(result)


@app.post("/matching/job")
def matching_job(body: MatchRequest) -> dict[str, Any]:
    candidate = body.candidate.model_dump()
    job = body.job.model_dump()
    result = compute_match_score(candidate, job)
    _raise_if_error(result)
    return result


@app.post("/skills/gap")
def skills_gap(body: SkillsGapRequest) -> dict[str, Any]:
    result = analyze_gap(body.candidateSkills, body.requiredSkills)
    _raise_if_error(result)
    return result


@app.post("/training/recommendations")
def training_recommendations(body: TrainingRequest) -> dict[str, Any]:
    result = get_recommendations(body.missingSkills, job_title=body.jobTitle or "Professional")
    _raise_if_error(result)
    return to_backend_recommendation_format(result)


@app.post("/chat/career")
def chat_career(body: ChatRequest) -> dict[str, Any]:
    result = get_chatbot_reply(
        conversation_history=body.conversation_history,
        user_message=body.message,
        user_profile=body.user_profile,
    )
    _raise_if_error(result)
    return result


@app.post("/chat/roadmap")
def chat_roadmap(body: RoadmapRequest) -> dict[str, Any]:
    result = get_learning_roadmap(body.goal, current_skills=body.currentSkills)
    _raise_if_error(result)
    return result


def main() -> None:
    import uvicorn

    host = os.getenv("AI_ENGINE_HOST", "0.0.0.0")
    port = int(os.getenv("AI_ENGINE_PORT", "8000"))
    uvicorn.run("Ai_Engine.server:app", host=host, port=port, reload=False)


if __name__ == "__main__":
    main()
