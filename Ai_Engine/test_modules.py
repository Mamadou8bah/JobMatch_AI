"""Quick smoke tests for local AI Engine modules (no Gemini API required)."""

import sys
from pathlib import Path

# Allow running as: python Ai_Engine/test_modules.py from the repo root.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from Ai_Engine.matching_engine import compute_match_score
from Ai_Engine.skills_gap import analyze_gap
from Ai_Engine.training_recommender import get_recommendations


def test_skills_gap() -> None:
    result = analyze_gap(
        ["Python", "Django", "SQL"],
        ["Python", "Django", "PostgreSQL", "Docker", "REST APIs", "Git"],
    )
    assert result["matched_skills"] == ["Python", "Django"]
    assert "PostgreSQL" in result["missing_skills"]
    assert result["gap_label"] == "Significant Gap"
    print("skills_gap: OK", result)


def test_training_static_lookup() -> None:
    result = get_recommendations(["Docker", "Git"], job_title="Backend Developer")
    assert len(result["recommendations"]) == 2
    assert result["recommendations"][0]["skill"] == "Docker"
    print("training_recommender: OK", result)


def test_matching_engine() -> None:
    result = compute_match_score(
        candidate_skills=["Python", "Django", "REST APIs", "PostgreSQL"],
        candidate_experience="2 years as backend developer at TechGambia",
        candidate_education="BSc Computer Science",
        job_title="Backend Developer",
        job_description="We are looking for a backend developer with Django and PostgreSQL experience.",
        job_required_skills=["Python", "Django", "PostgreSQL", "REST APIs", "Git"],
    )
    assert "match_score" in result
    assert result["match_score"] > 0
    assert "Git" in result["missing_skills"]
    print("matching_engine: OK", result)


if __name__ == "__main__":
    test_skills_gap()
    test_training_static_lookup()
    test_matching_engine()
    print("\nAll smoke tests passed.")
