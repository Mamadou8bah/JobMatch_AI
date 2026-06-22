"""Embedding-based job matching engine using Sentence-BERT."""

from __future__ import annotations

from typing import Any

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from .skills_gap import analyze_gap
from .utils import error_response

_MODEL = None


def _get_model():
    global _MODEL
    if _MODEL is None:
        from sentence_transformers import SentenceTransformer

        _MODEL = SentenceTransformer("all-MiniLM-L6-v2")
    return _MODEL


def warmup_matching_model() -> None:
    """Load the Sentence-BERT model (used on server startup)."""
    _get_model()


def _match_label(score: float) -> str:
    if score >= 85:
        return "Strong Match"
    if score >= 65:
        return "Good Match"
    if score >= 40:
        return "Partial Match"
    return "Low Match"


def _build_candidate_text(data: dict[str, Any]) -> str:
    skills = data.get("candidate_skills") or data.get("skills") or []
    experience = data.get("candidate_experience") or data.get("experience") or ""
    education = data.get("candidate_education") or data.get("education") or ""
    cv_text = data.get("cvText") or data.get("cv_text") or ""

    if isinstance(experience, list):
        experience = "; ".join(str(item) for item in experience)
    if isinstance(education, list):
        education = "; ".join(str(item) for item in education)

    parts = [
        f"Skills: {', '.join(skills)}" if skills else "",
        f"Experience: {experience}" if experience else "",
        f"Education: {education}" if education else "",
        cv_text.strip() if cv_text else "",
    ]
    return ". ".join(part for part in parts if part)


def _build_job_text(data: dict[str, Any]) -> str:
    title = data.get("job_title") or data.get("title") or ""
    description = data.get("job_description") or data.get("description") or ""
    required_skills = data.get("job_required_skills") or data.get("requiredSkills") or data.get("required_skills") or []
    experience_level = data.get("experienceLevel") or data.get("experience_level") or ""

    parts = [
        f"Job title: {title}" if title else "",
        f"Required skills: {', '.join(required_skills)}" if required_skills else "",
        f"Experience level: {experience_level}" if experience_level else "",
        description.strip() if description else "",
    ]
    return ". ".join(part for part in parts if part)


def compute_match_score(
    candidate: dict[str, Any] | None = None,
    job: dict[str, Any] | None = None,
    **kwargs: Any,
) -> dict[str, Any]:
    """
    Compute a match score between a candidate profile and a job posting.

    Accepts either a flat dict (spec format) or separate candidate/job dicts
    (backend HTTP format).
    """
    try:
        if candidate is not None and job is not None:
            merged = {
                "candidate_skills": candidate.get("skills") or [],
                "candidate_experience": candidate.get("experience") or candidate.get("cvText") or "",
                "candidate_education": candidate.get("education") or "",
                "cvText": candidate.get("cvText"),
                "job_title": job.get("title"),
                "job_description": job.get("description"),
                "job_required_skills": job.get("requiredSkills") or job.get("required_skills") or [],
                "experienceLevel": job.get("experienceLevel"),
            }
        else:
            merged = {**kwargs, **(candidate or {})}

        candidate_text = _build_candidate_text(merged)
        job_text = _build_job_text(merged)

        required_skills = merged.get("job_required_skills") or merged.get("requiredSkills") or []
        candidate_skills = merged.get("candidate_skills") or merged.get("skills") or []
        gap_result = analyze_gap(candidate_skills, required_skills)

        matched_skills = gap_result.get("matched_skills") or []
        missing_skills = gap_result.get("missing_skills") or []

        if not job_text:
            return error_response("Missing job data for matching.")

        if not candidate_text:
            if required_skills:
                skills_overlap = len(matched_skills) / len(required_skills)
            else:
                skills_overlap = 0.0
            match_score = round(skills_overlap * 100, 1)
            return {
                "match_score": match_score,
                "matchScore": match_score,
                "score": int(round(match_score)),
                "match_label": _match_label(match_score),
                "matched_skills": matched_skills,
                "matchedSkills": matched_skills,
                "missing_skills": missing_skills,
                "missingSkills": missing_skills,
            }

        model = _get_model()
        embeddings = model.encode([candidate_text, job_text])
        embedding_similarity = float(cosine_similarity([embeddings[0]], [embeddings[1]])[0][0])
        embedding_similarity = max(0.0, min(1.0, embedding_similarity))

        if required_skills:
            skills_overlap = len(matched_skills) / len(required_skills)
        else:
            skills_overlap = 0.0

        blended = (0.6 * embedding_similarity) + (0.4 * skills_overlap)
        match_score = round(blended * 100, 1)

        return {
            "match_score": match_score,
            "matchScore": match_score,
            "score": int(round(match_score)),
            "match_label": _match_label(match_score),
            "matched_skills": matched_skills,
            "matchedSkills": matched_skills,
            "missing_skills": missing_skills,
            "missingSkills": missing_skills,
        }

    except Exception as exc:
        return error_response(f"Could not compute match score: {exc}")
