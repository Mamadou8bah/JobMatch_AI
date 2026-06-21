"""JobMatch AI Engine — resume parsing, matching, skills gap, training, chatbot."""

from importlib import import_module
from typing import Any

__version__ = "1.0.0"

__all__ = [
    "parse_resume",
    "compute_match_score",
    "analyze_gap",
    "get_recommendations",
    "get_chatbot_reply",
]

_LAZY_EXPORTS = {
    "parse_resume": ("Ai_Engine.resume_parser", "parse_resume"),
    "compute_match_score": ("Ai_Engine.matching_engine", "compute_match_score"),
    "analyze_gap": ("Ai_Engine.skills_gap", "analyze_gap"),
    "get_recommendations": ("Ai_Engine.training_recommender", "get_recommendations"),
    "get_chatbot_reply": ("Ai_Engine.chatbot", "get_chatbot_reply"),
}


def __getattr__(name: str) -> Any:
    if name in _LAZY_EXPORTS:
        module_name, attr_name = _LAZY_EXPORTS[name]
        module = import_module(module_name)
        return getattr(module, attr_name)
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
