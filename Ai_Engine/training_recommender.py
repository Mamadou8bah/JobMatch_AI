"""Training recommendation engine — suggest courses to close skills gaps."""

from __future__ import annotations

import json
from typing import Any

from .utils import (
    error_response,
    get_gemini_model,
    load_skills_courses_map,
    normalize_skill,
    parse_json_from_gemini_response,
)

MAX_RECOMMENDATIONS = 5


def _lookup_static_course(skill: str, courses_map: dict[str, dict[str, str]]) -> dict[str, str] | None:
    normalized = normalize_skill(skill)

    for key, course in courses_map.items():
        if normalize_skill(key) == normalized:
            return {
                "skill": skill,
                "course_title": course["course_title"],
                "provider": course["provider"],
                "url": course["url"],
                "duration": course.get("duration", "Self-paced"),
                "level": course.get("level", "Beginner"),
            }

    return None


def _recommend_with_gemini(skill: str, job_title: str) -> dict[str, str]:
    prompt = f"""
Recommend one free online course for learning "{skill}" relevant to someone seeking a job as a "{job_title}".
Return ONLY a valid JSON object with no markdown, no code blocks, no extra text:
{{
  "skill": "{skill}",
  "course_title": "...",
  "provider": "...",
  "url": "...",
  "duration": "...",
  "level": "Beginner or Intermediate"
}}
"""
    model = get_gemini_model()
    response = model.generate_content(prompt)
    course = parse_json_from_gemini_response(response.text)
    return {
        "skill": str(course.get("skill") or skill),
        "course_title": str(course.get("course_title") or course.get("title") or "Recommended course"),
        "provider": str(course.get("provider") or "Online"),
        "url": str(course.get("url") or ""),
        "duration": str(course.get("duration") or "Self-paced"),
        "level": str(course.get("level") or "Beginner"),
    }


def get_recommendations(
    missing_skills: list[str] | None = None,
    job_title: str = "Professional",
    **kwargs: Any,
) -> dict[str, Any]:
    """
    Recommend training courses for missing skills.

    Uses the static skills map first, then Gemini fallback for unknown skills.
    Returns at most 5 recommendations.
    """
    try:
        missing_skills = (
            missing_skills
            or kwargs.get("missingSkills")
            or kwargs.get("missing_skills")
            or []
        )
        job_title = kwargs.get("job_title") or kwargs.get("jobTitle") or job_title

        if not missing_skills:
            return {"recommendations": []}

        courses_map = load_skills_courses_map()
        recommendations: list[dict[str, str]] = []
        seen_skills: set[str] = set()

        for skill in missing_skills:
            normalized = normalize_skill(skill)
            if normalized in seen_skills:
                continue
            seen_skills.add(normalized)

            static_course = _lookup_static_course(skill, courses_map)
            if static_course:
                recommendations.append(static_course)
            else:
                try:
                    recommendations.append(_recommend_with_gemini(skill, job_title))
                except (json.JSONDecodeError, ValueError, Exception):
                    recommendations.append(
                        {
                            "skill": skill,
                            "course_title": f"Learn {skill} — Free Resources",
                            "provider": "freeCodeCamp / YouTube",
                            "url": f"https://www.google.com/search?q=free+{skill.replace(' ', '+')}+course",
                            "duration": "Self-paced",
                            "level": "Beginner",
                        }
                    )

            if len(recommendations) >= MAX_RECOMMENDATIONS:
                break

        return {"recommendations": recommendations[:MAX_RECOMMENDATIONS]}

    except Exception as exc:
        return error_response(f"Could not generate training recommendations: {exc}")


def to_backend_recommendation_format(result: dict[str, Any]) -> dict[str, Any]:
    """Adapt recommendations to the NestJS backend's expected shape."""
    if result.get("error"):
        return result

    backend_items = []
    for item in result.get("recommendations") or []:
        backend_items.append(
            {
                "title": item.get("course_title") or item.get("title"),
                "provider": item.get("provider"),
                "url": item.get("url"),
                "skill": item.get("skill"),
                "description": f"{item.get('level', 'Beginner')} · {item.get('duration', 'Self-paced')}",
            }
        )

    return {"recommendations": backend_items}
