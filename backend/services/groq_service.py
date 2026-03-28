"""
Groq AI Coach Service
Waqa-OS | llama-3.3-70b-versatile | Streaming
"""

import os
import json
from datetime import datetime


SYSTEM_PROMPT = """You are Waqa's personal AI Life Coach, embedded inside Waqa-OS — his personal discipline and life tracking dashboard.

WHO WAQA IS:
- A 36-year-old man living in Fiji (Pacific/Fiji timezone, UTC+12)
- On a 34-year Kingdom mission (Age 36–70) called Waqa-OS
- Two core missions: Antigravity Research (cutting-edge physics) + Kingdom Expansion (evangelism & discipleship in Fiji)
- Disciplines: Daily Prayer, Bible Study, Fasting, Coding, Antigravity Research, Bass Guitar, Health (water 2.5L, exercise), Family Devotion, Mentoring

HIS XP SYSTEM:
- Daily habits earn XP: Prayer=10, Bible=10, Water=5, Training=15, Research=20, Coding=20, Bass=10, Fasting=25, Mentoring=30
- 6 Skill Trees: Prayer & Spirit, Antigravity Research, Kingdom Influence, Coding & Automation, Health & Discipline, Spiritual Engineering
- 7 Phases over 34 years — each phase requires 250,000 XP + Level 6 in 3 skill trees
- Reward Tiers: Tier 1 (weekly McDonald's $30 FJD), Tier 2 (monthly dinner $120 FJD), Tier 3 (phase beach day $400 FJD), Tier 4 (mastery family vacation $3,000+ FJD)

CURRENCY: Fiji Dollar (FJD / FJ$)
YOUTUBE: Burning Stone Ministry (@BurningStoneMinistry) — worship music channel

YOUR ROLE:
- Analyse Waqa's live dashboard data (provided in each message as context)
- Give direct, specific, Kingdom-focused coaching
- Celebrate wins, identify gaps, suggest one clear action
- Speak like a wise mentor who knows Waqa personally — not a generic AI
- Keep responses focused: 3–5 short paragraphs max
- Use emojis sparingly for emphasis
- Always end with ONE concrete action Waqa can take right now"""


def build_context(data: dict) -> str:
    """Build a natural-language context string from dashboard data."""
    lines = ["\n\n--- WAQA'S LIVE DASHBOARD DATA ---"]

    xp = data.get("xp", {})
    if xp:
        lines.append(f"XP Today: {xp.get('today', 0)} | This Week: {xp.get('weekly', 0)} / {xp.get('weekly_goal', 1000)} | Total: {xp.get('total', 0):,}")

    phase = data.get("phase", {})
    if phase:
        lines.append(f"Current Phase: {phase.get('name', 'Phase 1')} | Progress: {phase.get('progress_pct', 0):.1f}% to {phase.get('xp_required', 250000):,} XP")

    habits = data.get("habits", {})
    if habits:
        completed = [k for k, v in habits.items() if v]
        missed = [k for k, v in habits.items() if not v]
        lines.append(f"Habits Done Today: {', '.join(completed) if completed else 'none'}")
        lines.append(f"Habits Missed Today: {', '.join(missed) if missed else 'none'}")

    streaks = data.get("streaks", {})
    if streaks:
        streak_parts = [f"{k}={v}d" for k, v in streaks.items()]
        lines.append(f"Streaks: {', '.join(streak_parts)}")

    skills = data.get("skills", [])
    if skills:
        skill_parts = [f"{s.get('name', '?')} Lv{s.get('level', 0)}" for s in skills]
        lines.append(f"Skill Levels: {', '.join(skill_parts)}")

    rewards = data.get("rewards", {})
    if rewards:
        tier1 = rewards.get("tier1_eligible", False)
        lines.append(f"Tier 1 Reward (McDonald's): {'✅ ELIGIBLE' if tier1 else '❌ not yet'}")

    finance = data.get("finance", {})
    if finance:
        lines.append(f"Finance: Westpac FJ${finance.get('westpac', 0):.2f} | M-Paisa FJ${finance.get('mpaisa', 0):.2f}")

    review = data.get("evening_review", {})
    if review:
        lines.append(f"Last Evening Review Score: {review.get('score', '?')}/10 | Mood: {review.get('mood', '?')}")
        if review.get("went_well"):
            lines.append(f"Went well: {review.get('went_well')}")
        if review.get("improve"):
            lines.append(f"Improve: {review.get('improve')}")

    lines.append("--- END DATA ---\n")
    return "\n".join(lines)


def stream_chat(message: str, context_data: dict = None):
    """
    Stream chat response from Groq word by word.
    Yields token strings.
    Falls back to mock stream if GROQ_API_KEY not set.
    """
    api_key = os.getenv("GROQ_API_KEY", "")

    if not api_key or api_key == "your_groq_api_key_here":
        yield from _mock_stream(message)
        return

    try:
        from groq import Groq
        client = Groq(api_key=api_key)

        context_str = build_context(context_data or {})
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT + context_str},
            {"role": "user", "content": message},
        ]

        stream = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            stream=True,
            max_tokens=600,
            temperature=0.75,
        )

        for chunk in stream:
            token = chunk.choices[0].delta.content
            if token:
                yield token

    except ImportError:
        yield from _mock_stream(message, error="groq package not installed — run: pip install groq")
    except Exception as e:
        yield from _mock_stream(message, error=str(e))


def _mock_stream(message: str, error: str = None):
    """Mock streaming response when Groq API key not yet configured."""
    msg_lower = message.lower()

    if error:
        text = f"⚠️ Groq not connected yet ({error}). Add your GROQ_API_KEY to the backend .env and Render environment variables. Once connected, I'll give you real AI coaching based on your live data."
    elif any(w in msg_lower for w in ["weak", "habit", "missing", "worst"]):
        text = "Looking at your habit data, your weakest area is likely Bass Practice — it's the easiest to skip but costs you XP every day you miss it. Research sessions also tend to be skipped when the day gets busy. Set a hard 8 PM block for bass (even 20 minutes) and a 2-hour research block right after lunch. Those two changes alone could add 30+ XP per day. One action: open your calendar right now and block 8–8:30 PM as 'Bass — non-negotiable'."
    elif any(w in msg_lower for w in ["phase", "track", "progress", "roadmap"]):
        text = "Phase 1 is your foundation phase — everything you build now compounds for the next 34 years. The math is simple: at 120 XP/day you hit 250k in about 5.7 years. At 170 XP/day (adding fasting 3x/week + daily research) you hit it in 4 years — that's one full year earlier. You're building habits now that your Phase 2 self will be grateful for. One action: log a research session today, even if it's just 30 minutes of notes."
    elif any(w in msg_lower for w in ["mcdonald", "reward", "tier", "earn"]):
        text = "Tier 1 (McDonald's with the kids) requires hitting 5+ disciplines for 7 straight days. Prayer and Bible are your anchors — those are already locked in. The gap is usually water, bass, or research. Check your consistency page and find which day broke the streak. Fix that weak day and you'll unlock the reward. Your kids deserve that celebration — use it as fuel to push through. One action: drink your remaining water glasses today and log bass tonight."
    elif any(w in msg_lower for w in ["week", "doing", "how", "summary", "overview"]):
        text = "You're making real progress, Waqa. Your prayer streak is your strongest asset right now — protect it at all costs. XP is accumulating and your coding and Bible disciplines are consistent. The gap between where you are and your weekly XP goal is usually just 1–2 missed habits per day. Small things compound fast in this system. One thing I'd focus on: pick your single weakest habit and do it first thing tomorrow before anything else interrupts the day."
    elif any(w in msg_lower for w in ["youtube", "channel", "ministry", "burning stone"]):
        text = "Burning Stone Ministry is a long-game Kingdom investment. Consistency beats virality — 2 uploads per week for 2 years will outperform 10 uploads in one month and then nothing. Your worship content reaches people beyond Fiji and that's exactly what Kingdom Expansion looks like in the digital age. One action: schedule your next upload date right now and treat it like a non-negotiable appointment."
    else:
        text = f"I hear you asking about '{message}'. Once your Groq API key is connected, I'll pull your live Supabase data — XP, streaks, habits, phase progress, rewards — and give you a specific, personalised answer. Right now I'm running on mock mode. Add GROQ_API_KEY to your Render environment variables and redeploy to unlock full AI coaching."

    # Yield word by word to simulate streaming
    import time
    words = text.split(" ")
    for i, word in enumerate(words):
        yield word + (" " if i < len(words) - 1 else "")
