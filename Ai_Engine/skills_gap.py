"""Skills gap analyzer — compare candidate skills against job requirements."""

from __future__ import annotations

from typing import Any

from .utils import error_response, find_matching_skill, normalize_skill


def _gap_label(gap_percentage: float) -> str:
    if gap_percentage == 0:
        return "No Gap"
    if gap_percentage <= 25:
        return "Minor Gap"
    if gap_percentage <= 50:
        return "Moderate Gap"
    if gap_percentage <= 75:
        return "Significant Gap"
    return "Major Gap"


def analyze_gap(
    candidate_skills: list[str] | None = None,
    required_skills: list[str] | None = None,
    **kwargs: Any,
) -> dict[str, Any]:
    """
    Compare candidate skills to required skills and identify gaps.

    Accepts keyword args `candidate_skills`/`required_skills` or
    backend-style `candidateSkills`/`requiredSkills`.
    """
    try:
        candidate_skills = (
            candidate_skills
            or kwargs.get("candidateSkills")
            or kwargs.get("candidate_skills")
            or []
        )
        required_skills = (
            required_skills
            or kwargs.get("requiredSkills")
            or kwargs.get("required_skills")
            or []
        )

        matched_skills: list[str] = []
        missing_skills: list[str] = []

        for required in required_skills:
            match = find_matching_skill(required, candidate_skills)
            if match:
                matched_skills.append(match)
            else:
                missing_skills.append(required)

        total_required = len(required_skills)
        if total_required == 0:
            gap_percentage = 0.0
        else:
            gap_percentage = round((len(missing_skills) / total_required) * 100, 1)

        return {
            "matched_skills": matched_skills,
            "matchedSkills": matched_skills,
            "missing_skills": missing_skills,
            "missingSkills": missing_skills,
            "gap_percentage": gap_percentage,
            "gapPercentage": gap_percentage,
            "gap_label": _gap_label(gap_percentage),
            "gapLabel": _gap_label(gap_percentage),
            "gap_count": len(missing_skills),
            "gapCount": len(missing_skills),
        }

    except Exception as exc:
        return error_response(f"Could not analyze skills gap: {exc}")


def candidate_has_skill(candidate_skills: list[str], target_skill: str) -> bool:
    """Check whether a candidate possesses a skill (with synonym support)."""
    target = normalize_skill(target_skill)
    return any(normalize_skill(skill) == target for skill in candidate_skills)
