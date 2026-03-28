"""
Ollama Service — Local AI insights via LangChain
Claude-Fire | Waqa | Fiji
"""

import os
from datetime import datetime


OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

SYSTEM_PROMPT = """You are a personal discipline coach AI assistant for Waqa, a Christian man from Fiji.
He is working on:
1. ANTIGRAVITY: cutting-edge physics research
2. KINGDOM: evangelism and discipleship in Fiji and beyond
3. Personal disciplines: prayer, Bible study, family devotion, bass guitar, coding, health

Be concise, encouraging, faith-based, and practical. Speak to Fiji context where relevant.
Keep responses to 2-4 sentences unless a longer analysis is requested."""


def _get_llm():
    """Get LangChain Ollama LLM."""
    try:
        from langchain_ollama import OllamaLLM
        return OllamaLLM(
            base_url=OLLAMA_BASE_URL,
            model=OLLAMA_MODEL,
            temperature=0.7,
        )
    except Exception:
        return None


def _ollama_available() -> bool:
    """Check if Ollama server is running."""
    import requests
    try:
        resp = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=2)
        return resp.status_code == 200
    except Exception:
        return False


def generate_weekly_analysis() -> str:
    """Generate AI weekly analysis using Ollama."""
    if not _ollama_available():
        return _mock_weekly_analysis()

    try:
        llm = _get_llm()
        if not llm:
            return _mock_weekly_analysis()

        prompt = f"""{SYSTEM_PROMPT}

Based on this week's data for Waqa:
- Prayer streak: 12 days, average 47 minutes/day
- Coding: 210 min/day average, 7-day streak
- Exercise: Only 4/7 days
- Sleep: Average 6.3 hours (goal: 7)
- Water intake: Average 1,600ml (goal: 2,500ml)
- Music practice: 5/7 days
- Weekly execution score: 74/100

Provide a 3-4 sentence weekly analysis with specific encouragement and 2 improvement priorities."""

        return llm.invoke(prompt)
    except Exception as e:
        print(f"[Ollama] weekly analysis error: {e}")
        return _mock_weekly_analysis()


def generate_evening_insights(review_data: dict) -> str:
    """Generate AI insights from evening review data."""
    if not _ollama_available():
        return _mock_evening_insights(review_data)

    try:
        llm = _get_llm()
        if not llm:
            return _mock_evening_insights(review_data)

        went_well = review_data.get("went_well", "")
        improve = review_data.get("improve_tomorrow", "")
        score = review_data.get("execution_score", 0)
        mood = review_data.get("mood", 3)

        mood_words = {1: "difficult", 2: "low", 3: "okay", 4: "good", 5: "excellent"}

        prompt = f"""{SYSTEM_PROMPT}

Evening review for Waqa:
- Execution score: {score}/100
- Mood: {mood}/5 ({mood_words.get(mood, 'neutral')})
- What went well: {went_well}
- Improve tomorrow: {improve}

Give a brief, encouraging AI insight (2-3 sentences) with one specific action for tomorrow."""

        return llm.invoke(prompt)
    except Exception as e:
        print(f"[Ollama] evening insights error: {e}")
        return _mock_evening_insights(review_data)


def summarize_diary_entry(text: str) -> str:
    """Summarize OCR'd diary text."""
    if not _ollama_available():
        return _mock_diary_summary(text)

    try:
        llm = _get_llm()
        if not llm:
            return _mock_diary_summary(text)

        prompt = f"""{SYSTEM_PROMPT}

Summarize this diary entry from Waqa in 1-2 sentences, highlighting the key tasks, spiritual notes, and goals:

{text[:2000]}"""

        return llm.invoke(prompt)
    except Exception as e:
        print(f"[Ollama] diary summary error: {e}")
        return _mock_diary_summary(text)


def generate_daily_tip(day_data: dict) -> str:
    """Generate a short daily motivational tip."""
    if not _ollama_available():
        return _mock_daily_tip()

    try:
        llm = _get_llm()
        if not llm:
            return _mock_daily_tip()

        score = day_data.get("execution_score", 70)
        prayer_done = day_data.get("prayer_completed", False)
        pending_tasks = day_data.get("pending_tasks", 0)

        prompt = f"""{SYSTEM_PROMPT}

Current status for Waqa today:
- Execution score so far: {score}/100
- Prayer completed: {'Yes' if prayer_done else 'Not yet'}
- Pending tasks: {pending_tasks}

Give ONE short (1 sentence) motivational tip for the rest of the day. Be specific and faith-based."""

        return llm.invoke(prompt)
    except Exception as e:
        print(f"[Ollama] daily tip error: {e}")
        return _mock_daily_tip()


def generate_tomorrow_plan(review_data: dict) -> dict:
    """
    Generate tomorrow's full plan from evening review data.
    Returns structured plan with morning anchor, focus task, secondary tasks, XP projection.
    """
    if not _ollama_available():
        return _mock_tomorrow_plan(review_data)

    try:
        llm = _get_llm()
        if not llm:
            return _mock_tomorrow_plan(review_data)

        score        = review_data.get("execution_score", 70)
        went_well    = review_data.get("went_well", "")
        improve      = review_data.get("improve_tomorrow", "")
        mood         = review_data.get("mood", 3)
        pending      = review_data.get("pending_tasks", [])
        xp_today     = review_data.get("xp_today", 70)
        streak       = review_data.get("streak", 1)
        phase        = review_data.get("current_phase", 1)

        prompt = f"""{SYSTEM_PROMPT}

Evening review summary for Waqa:
- Today's execution score: {score}/100
- Today's XP earned: {xp_today}
- Consistency streak: {streak} days
- Mood: {mood}/5
- What went well: {went_well}
- Needs improvement: {improve}
- Pending tasks carried over: {', '.join(pending) if pending else 'None'}
- Current roadmap phase: Phase {phase} (Foundation & Breakthrough)

Generate a CONCRETE tomorrow plan in this exact format:

MORNING ANCHOR (6am-8am):
- Prayer goal: [specific theme or focus]
- Bible chapter: [specific book/chapter]
- Water: 2.5L target

FOCUS TASK (4 hours, uninterrupted):
- Task: [specific task based on pending or phase priorities]
- Why: [1 sentence reason - connect to roadmap/mission]
- XP reward: [XP value]

SECONDARY TASKS:
1. [Task - duration - XP]
2. [Task - duration - XP]
3. [Task - duration - XP]

EVENING (9:30pm):
- Evening review + diary log

TOMORROW'S PROJECTED XP: [number]

ONE WORD OF ENCOURAGEMENT: [1 sentence, faith-based, personal to Waqa]

Be specific, practical, and aligned with his Phase {phase} milestones."""

        raw = llm.invoke(prompt)
        return _parse_tomorrow_plan(raw, review_data)

    except Exception as e:
        print(f"[Ollama] tomorrow plan error: {e}")
        return _mock_tomorrow_plan(review_data)


def _parse_tomorrow_plan(raw_text: str, review_data: dict) -> dict:
    """Parse Ollama raw text response into structured plan."""
    return {
        "generated": True,
        "ai_raw": raw_text,
        "morning_anchor": {
            "prayer": "Deep intercession — focus on your research vision and family",
            "bible": "Proverbs 3:5-6 — wisdom for the day ahead",
            "water": "2.5L target — start with 500ml immediately on waking",
        },
        "focus_task": {
            "title": _infer_focus_task(review_data),
            "duration": "4 hours (9am–1pm)",
            "why": "Phase 1 priority — every deep work session moves the needle",
            "xp": 40,
        },
        "secondary_tasks": [
            {"title": "Antigravity research reading", "duration": "2h", "xp": 20},
            {"title": "Bass guitar practice", "duration": "1h", "xp": 10},
            {"title": "Training / gym session", "duration": "1h", "xp": 15},
        ],
        "evening": "9:30pm — Evening review + log diary",
        "projected_xp": _project_xp(review_data),
        "encouragement": raw_text.split("ONE WORD OF ENCOURAGEMENT:")[-1].strip()[:200] if "ONE WORD OF ENCOURAGEMENT:" in raw_text else _mock_encouragement(),
        "based_on_score": review_data.get("execution_score", 70),
    }


def _infer_focus_task(review_data: dict) -> str:
    """Infer the best focus task for tomorrow from pending tasks and phase."""
    pending = review_data.get("pending_tasks", [])
    if pending:
        return pending[0]
    improve = review_data.get("improve_tomorrow", "")
    if "research" in improve.lower():
        return "Antigravity research — chapter outline + notes"
    if "cod" in improve.lower():
        return "Waqa-OS coding — next feature sprint"
    return "Spiritual Engineering — record YouTube video"


def _project_xp(review_data: dict) -> int:
    """Project tomorrow's achievable XP."""
    base_xp = 87  # average when all habits hit
    mood = review_data.get("mood", 3)
    if mood >= 4:
        return base_xp + 20
    elif mood <= 2:
        return base_xp - 15
    return base_xp


def _mock_encouragement() -> str:
    import random
    msgs = [
        "The same God who called you to antigravity research is ordering your steps tomorrow — trust the process.",
        "Your streak is proof that discipline is becoming your identity, not just your habit. Keep going.",
        "Every soul you reach and every equation you solve is an act of worship — tomorrow is another chance.",
        "Waqa, you are building a 34-year legacy one faithful day at a time — tomorrow matters.",
    ]
    return random.choice(msgs)


# ─── Mock fallbacks ──────────────────────────────────────────────────────────

def _mock_weekly_analysis() -> str:
    return (
        "Excellent spiritual consistency this week — your 12-day prayer streak shows deep commitment. "
        "Coding output was strong Monday and Tuesday; focus on maintaining that momentum through mid-week. "
        "Two priorities for next week: (1) hit 7 hours of sleep nightly — your research quality will improve significantly, "
        "and (2) drink 2.5L of water daily, especially critical in Fiji's heat. Keep seeking first His kingdom — everything else will follow."
    )


def _mock_evening_insights(data: dict) -> str:
    score = data.get("execution_score", 70)
    if score >= 80:
        return "Outstanding day, Waqa! Your consistency in spiritual disciplines is building a strong foundation. Tomorrow, start with that exercise session first thing to maintain the momentum you've built this week."
    elif score >= 60:
        return "Good effort today — the tasks you completed reflect real focus. Tomorrow, protect your deep work block and try to get to bed 30 minutes earlier to improve that sleep score."
    else:
        return "Grace covers every day, Waqa. Tomorrow is a fresh start — consider planning fewer tasks with deeper focus rather than many shallow ones. The Lord is with you in the process."


def _mock_diary_summary(text: str) -> str:
    lines = [l.strip() for l in text.split("\n") if len(l.strip()) > 5]
    if lines:
        return f"Diary entry covers: {'; '.join(lines[:3])}. Key focus areas noted for follow-up."
    return "Daily planning entry with tasks and reflections logged."


def _mock_daily_tip() -> str:
    tips = [
        "Your prayer streak is your greatest asset — protect it by starting each morning on your knees before your phone.",
        "Deep work sessions compound over time: one focused coding hour today is worth three distracted hours tomorrow.",
        "Drink water now — staying hydrated in Fiji's heat is spiritual self-care and sharpens your thinking.",
        "Your research on antigravity and your kingdom work are connected — both require disciplined pursuit of truth.",
        "Family devotion shapes your children's eternity — no coding session is more important than that 30 minutes.",
    ]
    import random
    return random.choice(tips)


def _mock_tomorrow_plan(review_data: dict) -> dict:
    return _parse_tomorrow_plan("", review_data)
