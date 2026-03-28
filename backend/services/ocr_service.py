"""
OCR Service — Google Vision API with Tesseract fallback
Claude-Fire | Waqa | Fiji
"""

import os
import io
import base64
from datetime import datetime


def process_image(image_file) -> dict:
    """
    Process an image file through OCR.
    Tries Google Vision API first, falls back to Tesseract.
    Returns structured result with raw_text, ai_summary, tags, confidence.
    """
    image_bytes = image_file.read()

    # Try Google Vision API first
    google_key = os.getenv("GOOGLE_VISION_API_KEY") or os.getenv("GOOGLE_CLIENT_ID")
    if google_key and google_key != "your_google_client_id_here":
        try:
            result = _google_vision_ocr(image_bytes)
            if result["raw_text"]:
                result["source"] = "google_vision"
                result["ai_summary"] = _extract_ai_summary(result["raw_text"])
                result["tags"] = _extract_tags(result["raw_text"])
                result["tasks"] = _extract_tasks(result["raw_text"])
                return result
        except Exception as e:
            print(f"[OCR] Google Vision failed: {e}, falling back to Tesseract")

    # Tesseract fallback
    try:
        result = _tesseract_ocr(image_bytes)
        result["source"] = "tesseract"
        result["ai_summary"] = _extract_ai_summary(result["raw_text"])
        result["tags"] = _extract_tags(result["raw_text"])
        result["tasks"] = _extract_tasks(result["raw_text"])
        return result
    except Exception as e:
        print(f"[OCR] Tesseract failed: {e}")

    # Mock fallback for dev/demo
    return _mock_ocr_result()


def _google_vision_ocr(image_bytes: bytes) -> dict:
    """Use Google Cloud Vision API for OCR."""
    from google.cloud import vision

    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=image_bytes)
    response = client.text_detection(image=image)

    if response.error.message:
        raise Exception(response.error.message)

    texts = response.text_annotations
    if not texts:
        return {"raw_text": "", "confidence": 0}

    raw_text = texts[0].description
    # Compute average confidence from individual word detections
    word_confidences = []
    for page in response.full_text_annotation.pages:
        for block in page.blocks:
            for paragraph in block.paragraphs:
                for word in paragraph.words:
                    word_confidences.append(word.confidence)

    avg_confidence = (
        round(sum(word_confidences) / len(word_confidences) * 100, 1)
        if word_confidences else 85.0
    )

    return {"raw_text": raw_text.strip(), "confidence": avg_confidence}


def _tesseract_ocr(image_bytes: bytes) -> dict:
    """Use Tesseract for OCR fallback."""
    import pytesseract
    from PIL import Image

    image = Image.open(io.BytesIO(image_bytes))
    # Improve quality for handwritten text
    image = image.convert("L")  # Grayscale

    # Get text with confidence data
    data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
    raw_text = pytesseract.image_to_string(image, lang="eng")

    # Compute confidence
    confidences = [int(c) for c in data["conf"] if int(c) > 0]
    avg_confidence = round(sum(confidences) / len(confidences), 1) if confidences else 60.0

    return {"raw_text": raw_text.strip(), "confidence": avg_confidence}


def _extract_ai_summary(text: str) -> str:
    """Use Ollama to summarize diary text."""
    try:
        from services.ollama_service import summarize_diary_entry
        return summarize_diary_entry(text)
    except Exception:
        # Simple fallback: first 200 chars
        lines = text.strip().split("\n")
        meaningful = [l.strip() for l in lines if len(l.strip()) > 10]
        return " | ".join(meaningful[:3]) if meaningful else text[:200]


def _extract_tags(text: str) -> list:
    """Extract relevant tags from diary text."""
    keywords = {
        "prayer": ["pray", "prayer", "lord", "god", "jesus", "spirit", "worship"],
        "goals": ["goal", "plan", "achieve", "target", "vision", "mission"],
        "coding": ["code", "coding", "programming", "project", "build", "develop"],
        "health": ["sleep", "exercise", "water", "eat", "food", "run", "walk"],
        "family": ["family", "kids", "children", "wife", "devotion"],
        "finance": ["money", "kina", "pgk", "budget", "spend", "save"],
        "music": ["music", "bass", "guitar", "practice", "song"],
        "research": ["research", "study", "paper", "experiment", "antigravity"],
    }
    text_lower = text.lower()
    found_tags = []
    for tag, words in keywords.items():
        if any(word in text_lower for word in words):
            found_tags.append(tag)
    return found_tags


def _extract_tasks(text: str) -> list:
    """Extract task-like lines from diary text."""
    tasks = []
    lines = text.strip().split("\n")
    task_indicators = ["todo", "to do", "task:", "- ", "* ", "[ ]", "☐", "must", "need to", "will"]
    for line in lines:
        line_lower = line.lower().strip()
        if any(ind in line_lower for ind in task_indicators) and len(line.strip()) > 5:
            # Try to extract time if present (e.g. "9am - code")
            task = {"title": line.strip(), "planned_start": None, "planned_end": None, "priority": "medium"}
            import re
            time_pattern = r"\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b"
            times = re.findall(time_pattern, line_lower)
            if times:
                task["planned_start"] = times[0]
                if len(times) > 1:
                    task["planned_end"] = times[1]
            tasks.append(task)
    return tasks[:10]  # Limit to 10 tasks per diary entry


def _mock_ocr_result() -> dict:
    """Return mock OCR result for development/demo."""
    return {
        "raw_text": (
            "Thursday 27 March 2026\n"
            "- 5:30am pray and Bible study (Psalm 91)\n"
            "- 7am Family devotion with kids\n"
            "- 9am Deep work on Claude-Fire project\n"
            "- 1pm Research antigravity papers\n"
            "- 4pm Bass guitar practice - work on worship songs\n"
            "- 9:30pm Evening review\n\n"
            "Goals this week:\n"
            "- Finish Claude-Fire backend\n"
            "- Stay consistent with prayer streak\n"
            "- Exercise every day\n\n"
            "God is faithful. Keep building."
        ),
        "ai_summary": "Daily schedule with spiritual focus (5:30am prayer), coding work on Claude-Fire, antigravity research, and bass practice. Goals: finish backend, maintain prayer streak, daily exercise.",
        "tags": ["prayer", "coding", "research", "music", "goals"],
        "tasks": [
            {"title": "pray and Bible study (Psalm 91)", "planned_start": "5:30am", "priority": "high"},
            {"title": "Family devotion with kids", "planned_start": "7am", "priority": "high"},
            {"title": "Deep work on Claude-Fire project", "planned_start": "9am", "priority": "high"},
            {"title": "Research antigravity papers", "planned_start": "1pm", "priority": "medium"},
            {"title": "Bass guitar practice", "planned_start": "4pm", "priority": "medium"},
            {"title": "Evening review", "planned_start": "9:30pm", "priority": "high"},
        ],
        "confidence": 0,
        "source": "mock",
    }
