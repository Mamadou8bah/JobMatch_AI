"""Resume parser — extract structured data from PDF/DOCX CVs using Gemini."""

from __future__ import annotations

import io
import json
import os
import tempfile
from pathlib import Path
from typing import Any, BinaryIO, Union

import pdfplumber
from docx import Document

from .utils import (
    clean_text,
    error_response,
    get_gemini_model,
    parse_json_from_gemini_response,
)

FileInput = Union[str, Path, bytes, BinaryIO]

CV_JSON_SCHEMA = """
{
  "name": "...",
  "email": "...",
  "phone": "...",
  "education": [{"degree": "...", "institution": "...", "year": "..."}],
  "experience": [{"title": "...", "company": "...", "duration": "..."}],
  "skills": ["skill1", "skill2"]
}
"""


def _extract_text_from_pdf(file_path: Path) -> str:
    text_parts: list[str] = []
    with pdfplumber.open(str(file_path)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            if page_text.strip():
                text_parts.append(page_text)

    if not text_parts:
        import fitz

        doc = fitz.open(str(file_path))
        for page in doc:
            page_text = page.get_text() or ""
            if page_text.strip():
                text_parts.append(page_text)

    return clean_text("\n".join(text_parts))


def _extract_text_from_docx(file_path: Path) -> str:
    document = Document(str(file_path))
    paragraphs = [paragraph.text for paragraph in document.paragraphs if paragraph.text.strip()]
    return clean_text("\n".join(paragraphs))


def _is_scanned_pdf(text: str, file_path: Path) -> bool:
    """Heuristic: very little extractable text likely means a scanned image PDF."""
    if len(text.strip()) >= 80:
        return False

    import fitz

    doc = fitz.open(str(file_path))
    if len(doc) == 0:
        return True

    sample_page = doc[0]
    text_from_fitz = sample_page.get_text() or ""
    images = sample_page.get_images()
    return len(text_from_fitz.strip()) < 30 and len(images) > 0


def extract_cv_text(file_input: FileInput, filename: str | None = None) -> tuple[str, str | None]:
    """
    Extract raw text from a CV file.

    Returns (text, error_message). error_message is set when extraction fails.
    """
    suffix = ""
    temp_path: Path | None = None

    try:
        if isinstance(file_input, (str, Path)):
            path = Path(file_input)
            suffix = path.suffix.lower()
            source_path = path
        else:
            if filename:
                suffix = Path(filename).suffix.lower()
            elif hasattr(file_input, "name") and file_input.name:
                suffix = Path(file_input.name).suffix.lower()
            else:
                suffix = ".pdf"

            if isinstance(file_input, bytes):
                data = file_input
            else:
                data = file_input.read()

            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
            temp_file.write(data)
            temp_file.close()
            temp_path = Path(temp_file.name)
            source_path = temp_path

        if suffix == ".pdf":
            text = _extract_text_from_pdf(source_path)
            if _is_scanned_pdf(text, source_path):
                return "", (
                    "Could not parse CV: this appears to be a scanned PDF. "
                    "Please upload a text-based CV (PDF or DOCX with selectable text)."
                )
            if not text:
                return "", "Could not parse CV: no readable text found in the PDF."
            return text, None

        if suffix in {".docx", ".doc"}:
            if suffix == ".doc":
                return "", "Could not parse CV: .doc format is not supported. Please upload PDF or DOCX."
            text = _extract_text_from_docx(source_path)
            if not text:
                return "", "Could not parse CV: no readable text found in the DOCX file."
            return text, None

        return "", f"Could not parse CV: unsupported file format '{suffix or 'unknown'}'."

    finally:
        if temp_path and temp_path.exists():
            os.unlink(temp_path)


def _structure_cv_with_gemini(cv_text: str) -> dict[str, Any]:
    prompt = f"""
Extract structured information from the following CV text and return ONLY a valid JSON object with no markdown, no code blocks, no extra text.

JSON format:
{CV_JSON_SCHEMA}

Use null for any field that is not present in the CV.
Skills must be a flat list of strings.

CV Text:
{cv_text}
"""
    model = get_gemini_model()
    response = model.generate_content(prompt)
    parsed = parse_json_from_gemini_response(response.text)
    return _normalize_parsed_cv(parsed)


def _normalize_parsed_cv(parsed: dict[str, Any]) -> dict[str, Any]:
    education = parsed.get("education") or []
    experience = parsed.get("experience") or []
    skills = parsed.get("skills") or []

    if not isinstance(education, list):
        education = [education] if education else []
    if not isinstance(experience, list):
        experience = [experience] if experience else []
    if not isinstance(skills, list):
        skills = [str(skills)] if skills else []

    return {
        "name": parsed.get("name"),
        "email": parsed.get("email"),
        "phone": parsed.get("phone"),
        "education": education,
        "experience": experience,
        "skills": [str(skill) for skill in skills if skill],
    }


def _format_education_strings(education: list[Any]) -> list[str]:
    formatted: list[str] = []
    for item in education:
        if isinstance(item, str):
            formatted.append(item)
        elif isinstance(item, dict):
            parts = [
                str(item.get("degree") or ""),
                str(item.get("institution") or ""),
                str(item.get("year") or ""),
            ]
            text = " — ".join(part for part in parts if part)
            if text:
                formatted.append(text)
    return formatted


def _format_experience_strings(experience: list[Any]) -> list[str]:
    formatted: list[str] = []
    for item in experience:
        if isinstance(item, str):
            formatted.append(item)
        elif isinstance(item, dict):
            parts = [
                str(item.get("title") or ""),
                str(item.get("company") or ""),
                str(item.get("duration") or ""),
            ]
            text = " — ".join(part for part in parts if part)
            if text:
                formatted.append(text)
    return formatted


def parse_resume(file_input: FileInput, filename: str | None = None) -> dict[str, Any]:
    """
    Parse a CV file and return structured JSON.

    Accepts a file path, bytes, or file-like object.
    """
    try:
        cv_text, extraction_error = extract_cv_text(file_input, filename=filename)
        if extraction_error:
            return error_response(extraction_error)

        structured = _structure_cv_with_gemini(cv_text)
        structured["rawText"] = cv_text
        return structured

    except json.JSONDecodeError:
        return error_response("Could not parse CV: AI returned invalid JSON.")
    except ValueError as exc:
        return error_response(str(exc))
    except Exception as exc:
        return error_response(f"Could not parse CV: {exc}")


def parse_resume_text(text: str) -> dict[str, Any]:
    """Parse already-extracted CV text (used when backend sends raw text)."""
    try:
        cleaned = clean_text(text)
        if not cleaned:
            return error_response("Could not parse CV: no text provided.")

        structured = _structure_cv_with_gemini(cleaned)
        structured["rawText"] = cleaned
        return structured

    except json.JSONDecodeError:
        return error_response("Could not parse CV: AI returned invalid JSON.")
    except ValueError as exc:
        return error_response(str(exc))
    except Exception as exc:
        return error_response(f"Could not parse CV: {exc}")


def to_backend_resume_format(parsed: dict[str, Any]) -> dict[str, Any]:
    """Adapt parsed CV to the NestJS backend's expected shape."""
    if parsed.get("error"):
        return parsed

    return {
        "name": parsed.get("name"),
        "email": parsed.get("email"),
        "skills": parsed.get("skills") or [],
        "education": _format_education_strings(parsed.get("education") or []),
        "experience": _format_experience_strings(parsed.get("experience") or []),
        "rawText": parsed.get("rawText"),
    }
