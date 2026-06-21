"""Career guidance chatbot powered by Gemini."""

from __future__ import annotations

from typing import Any

from .utils import error_response, get_gemini_model


def _build_system_instruction(user_profile: dict[str, Any]) -> str:
    skills = user_profile.get("skills") or []
    education = user_profile.get("education") or "Not provided"
    experience = user_profile.get("experience") or "Not provided"

    if isinstance(skills, list):
        skills_text = ", ".join(str(skill) for skill in skills) or "Not provided"
    else:
        skills_text = str(skills)

    if isinstance(education, list):
        education = "; ".join(str(item) for item in education)

    if isinstance(experience, list):
        experience = "; ".join(str(item) for item in experience)

    return f"""
You are a career guidance counselor helping job seekers in The Gambia find work and improve their skills.
You are encouraging, practical, and knowledgeable about both local and international job markets.
When giving advice, be specific and actionable. Keep your responses clear, friendly, and to the point (3-5 sentences max).

The user's current profile:
- Skills: {skills_text}
- Education: {education}
- Experience: {experience}
Always reference this profile when relevant.
"""


def _normalize_history(conversation_history: list[dict[str, Any]] | None) -> list[dict[str, Any]]:
    if not conversation_history:
        return []

    normalized: list[dict[str, Any]] = []
    for turn in conversation_history:
        role = turn.get("role", "user")
        parts = turn.get("parts") or []
        if isinstance(parts, str):
            parts = [parts]
        normalized.append({"role": role, "parts": parts})
    return normalized


def get_chatbot_reply(
    conversation_history: list[dict[str, Any]] | None = None,
    user_message: str | None = None,
    user_profile: dict[str, Any] | None = None,
    **kwargs: Any,
) -> dict[str, Any]:
    """
    Generate a career guidance chatbot reply.

    Accepts spec-format args or backend-style `message`/`currentSkills`.
    """
    try:
        user_message = user_message or kwargs.get("message") or kwargs.get("user_message") or ""
        user_profile = user_profile or kwargs.get("user_profile") or {}
        conversation_history = conversation_history or kwargs.get("conversation_history") or []

        if not user_message.strip():
            return error_response("No message provided.")

        if kwargs.get("currentSkills"):
            user_profile = {**user_profile, "skills": kwargs.get("currentSkills")}

        system_instruction = _build_system_instruction(user_profile)
        model = get_gemini_model(system_instruction=system_instruction)
        history = _normalize_history(conversation_history)
        chat = model.start_chat(history=history)
        response = chat.send_message(user_message.strip())
        reply_text = (response.text or "").strip()

        return {
            "reply": reply_text,
            "response": reply_text,
            "message": reply_text,
        }

    except ValueError as exc:
        return error_response(str(exc))
    except Exception as exc:
        return error_response(f"Could not generate chatbot reply: {exc}")


def get_learning_roadmap(
    goal: str,
    current_skills: list[str] | None = None,
    user_profile: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Generate a structured learning roadmap for a career goal."""
    try:
        profile = user_profile or {}
        if current_skills:
            profile = {**profile, "skills": current_skills}

        prompt = f"""
Create a concise learning roadmap for someone in The Gambia who wants to become: {goal}

Their current skills: {', '.join(profile.get('skills') or current_skills or []) or 'Not specified'}

Return ONLY valid JSON with no markdown:
{{
  "goal": "{goal}",
  "summary": "2-3 sentence overview",
  "steps": [
    {{"step": 1, "title": "...", "skills_to_learn": ["..."], "duration": "...", "resources": ["..."]}}
  ],
  "estimated_timeline": "e.g. 3-6 months"
}}
"""
        model = get_gemini_model(system_instruction=_build_system_instruction(profile))
        response = model.generate_content(prompt)
        from .utils import parse_json_from_gemini_response

        roadmap = parse_json_from_gemini_response(response.text)
        return {"roadmap": roadmap, "response": roadmap.get("summary", "")}

    except ValueError as exc:
        return error_response(str(exc))
    except Exception as exc:
        return error_response(f"Could not generate learning roadmap: {exc}")
