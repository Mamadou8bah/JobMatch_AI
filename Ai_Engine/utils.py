"""Shared helpers for the JobMatch AI Engine."""

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

_ENGINE_DIR = Path(__file__).resolve().parent
load_dotenv(_ENGINE_DIR / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

_CLIENT = None

# Canonical skill aliases (lowercase key -> canonical form used in comparisons).
SKILL_SYNONYMS: dict[str, str] = {
    "postgres": "postgresql",
    "postgresql": "postgresql",
    "postgre sql": "postgresql",
    "js": "javascript",
    "javascript": "javascript",
    "ts": "typescript",
    "typescript": "typescript",
    "py": "python",
    "python": "python",
    "ml": "machine learning",
    "machine learning": "machine learning",
    "ai": "artificial intelligence",
    "artificial intelligence": "artificial intelligence",
    "rest": "rest apis",
    "rest api": "rest apis",
    "rest apis": "rest apis",
    "api": "rest apis",
    "apis": "rest apis",
    "node": "node.js",
    "nodejs": "node.js",
    "node.js": "node.js",
    "reactjs": "react",
    "react.js": "react",
    "react": "react",
    "vuejs": "vue.js",
    "vue.js": "vue.js",
    "angularjs": "angular",
    "angular": "angular",
    "k8s": "kubernetes",
    "kubernetes": "kubernetes",
    "aws": "amazon web services",
    "amazon web services": "amazon web services",
    "gcp": "google cloud",
    "google cloud platform": "google cloud",
    "google cloud": "google cloud",
    "ms excel": "excel",
    "excel": "excel",
    "ms office": "microsoft office",
    "microsoft office": "microsoft office",
    "communication skills": "communication",
    "communication": "communication",
    "problem solving": "problem solving",
    "problem-solving": "problem solving",
    "team work": "teamwork",
    "teamwork": "teamwork",
    "git version control": "git",
    "github": "git",
    "git": "git",
    "sql server": "sql",
    "mysql": "sql",
    "sqlite": "sql",
    "sql": "sql",
    "html5": "html",
    "html": "html",
    "css3": "css",
    "css": "css",
    "c sharp": "c#",
    "c#": "c#",
    "dotnet": ".net",
    ".net": ".net",
    "power bi": "power bi",
    "powerbi": "power bi",
    "data analysis": "data analysis",
    "data analytics": "data analysis",
    "ui/ux": "ui/ux design",
    "ui ux": "ui/ux design",
    "ui/ux design": "ui/ux design",
}


def error_response(message: str) -> dict[str, Any]:
    """Return a standardized error dict."""
    return {"error": True, "message": message}


def clean_text(text: str) -> str:
    """Normalize whitespace in extracted CV text."""
    text = text.replace("\x00", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def normalize_skill(skill: str) -> str:
    """Normalize a skill string for comparison."""
    normalized = skill.strip().lower()
    normalized = re.sub(r"\s+", " ", normalized)
    return SKILL_SYNONYMS.get(normalized, normalized)


def skills_match(candidate_skill: str, required_skill: str) -> bool:
    """Case-insensitive skill match with synonym support."""
    return normalize_skill(candidate_skill) == normalize_skill(required_skill)


def find_matching_skill(required_skill: str, candidate_skills: list[str]) -> str | None:
    """Return the candidate skill that matches the required skill, if any."""
    for candidate_skill in candidate_skills:
        if skills_match(candidate_skill, required_skill):
            return candidate_skill
    return None


def parse_json_from_gemini_response(text: str) -> dict[str, Any]:
    """Parse JSON from a Gemini response, stripping markdown fences if present."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)


def _get_client():
    global _CLIENT
    if _CLIENT is None:
        from google import genai

        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set. Add it to Ai_Engine/.env")
        _CLIENT = genai.Client(api_key=GEMINI_API_KEY)
    return _CLIENT


def generate_gemini_text(
    prompt: str,
    *,
    system_instruction: str | None = None,
) -> str:
    """Generate text with Gemini 2.5."""
    from google.genai import types

    client = _get_client()
    config = (
        types.GenerateContentConfig(system_instruction=system_instruction)
        if system_instruction
        else None
    )
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=config,
    )
    return (response.text or "").strip()


def generate_gemini_chat(
    user_message: str,
    *,
    conversation_history: list[dict[str, Any]] | None = None,
    system_instruction: str | None = None,
) -> str:
    """Generate a multi-turn chat reply with Gemini 2.5."""
    from google.genai import types

    contents: list[types.Content] = []
    for turn in conversation_history or []:
        role = str(turn.get("role") or "user").lower()
        if role in {"assistant", "model"}:
            role = "model"
        elif role != "user":
            continue

        content = turn.get("content")
        parts = turn.get("parts")
        if isinstance(content, str) and content.strip():
            message_text = content.strip()
        elif isinstance(parts, str) and parts.strip():
            message_text = parts.strip()
        elif isinstance(parts, list):
            message_text = " ".join(str(part).strip() for part in parts if str(part).strip())
        else:
            continue

        contents.append(
            types.Content(role=role, parts=[types.Part.from_text(text=message_text)])
        )

    contents.append(
        types.Content(role="user", parts=[types.Part.from_text(text=user_message.strip())])
    )

    client = _get_client()
    config = (
        types.GenerateContentConfig(system_instruction=system_instruction)
        if system_instruction
        else None
    )
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=contents,
        config=config,
    )
    return (response.text or "").strip()


def get_gemini_model(system_instruction: str | None = None):
    """Backward-compatible wrapper for single-turn generation."""
    return _LegacyGeminiModel(system_instruction=system_instruction)


class _LegacyGeminiModel:
    """Minimal adapter so existing call sites can keep using generate_content()."""

    def __init__(self, system_instruction: str | None = None) -> None:
        self.system_instruction = system_instruction

    def generate_content(self, prompt: str):
        text = generate_gemini_text(prompt, system_instruction=self.system_instruction)
        return _LegacyGeminiResponse(text)

    def start_chat(self, history: list[dict[str, Any]] | None = None):
        return _LegacyGeminiChat(self.system_instruction, history or [])


class _LegacyGeminiChat:
    def __init__(self, system_instruction: str | None, history: list[dict[str, Any]]) -> None:
        self.system_instruction = system_instruction
        self.history = history

    def send_message(self, user_message: str):
        text = generate_gemini_chat(
            user_message,
            conversation_history=self.history,
            system_instruction=self.system_instruction,
        )
        return _LegacyGeminiResponse(text)


class _LegacyGeminiResponse:
    def __init__(self, text: str) -> None:
        self.text = text


def load_skills_courses_map() -> dict[str, dict[str, str]]:
    """Load the static skills-to-courses mapping."""
    map_path = _ENGINE_DIR / "skills_courses_map.json"
    with map_path.open(encoding="utf-8") as handle:
        return json.load(handle)
