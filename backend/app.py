"""
Claude-Fire Personal Discipline Dashboard — Flask Backend
User: Waqa | Fiji
"""

import os
import json
from datetime import datetime, date, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins="*")
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "dev-secret-change-in-prod")

# ─── Supabase client (lazy init so app starts without real creds) ────────────
_supabase = None

def get_supabase():
    global _supabase
    if _supabase is None:
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_ANON_KEY", "")
        if url and key and url != "your_supabase_url_here":
            from supabase import create_client
            _supabase = create_client(url, key)
    return _supabase


# ─── Mock data helpers ───────────────────────────────────────────────────────

def today_str():
    return date.today().isoformat()


MOCK_CATEGORIES = [
    {"id": "1", "name": "Sleep", "color": "#1e3a5f", "icon": "🌙", "goal_minutes_per_day": 420},
    {"id": "2", "name": "Prayer", "color": "#f59e0b", "icon": "🙏", "goal_minutes_per_day": 45},
    {"id": "3", "name": "Bible Study", "color": "#7c3aed", "icon": "📖", "goal_minutes_per_day": 30},
    {"id": "4", "name": "Family Devotion", "color": "#dc2626", "icon": "❤️", "goal_minutes_per_day": 30},
    {"id": "5", "name": "Church", "color": "#b91c1c", "icon": "⛪", "goal_minutes_per_day": 120},
    {"id": "6", "name": "Coding", "color": "#16a34a", "icon": "💻", "goal_minutes_per_day": 240},
    {"id": "7", "name": "Research", "color": "#0891b2", "icon": "🔬", "goal_minutes_per_day": 60},
    {"id": "8", "name": "Exercise", "color": "#ea580c", "icon": "💪", "goal_minutes_per_day": 60},
    {"id": "9", "name": "Eating", "color": "#92400e", "icon": "🍽️", "goal_minutes_per_day": 60},
    {"id": "10", "name": "Music Practice", "color": "#9333ea", "icon": "🎸", "goal_minutes_per_day": 60},
    {"id": "11", "name": "Family Time", "color": "#d97706", "icon": "👨‍👩‍👧", "goal_minutes_per_day": 60},
    {"id": "12", "name": "Evening Review", "color": "#0284c7", "icon": "📝", "goal_minutes_per_day": 30},
    {"id": "13", "name": "Free / Rest", "color": "#93c5fd", "icon": "☕", "goal_minutes_per_day": 60},
    {"id": "14", "name": "Untracked", "color": "#d1d5db", "icon": "❓", "goal_minutes_per_day": 0},
]

MOCK_TODAY_PIE = [
    {"category": "Sleep", "minutes": 390, "color": "#1e3a5f", "icon": "🌙"},
    {"category": "Prayer", "minutes": 50, "color": "#f59e0b", "icon": "🙏"},
    {"category": "Bible Study", "minutes": 35, "color": "#7c3aed", "icon": "📖"},
    {"category": "Family Devotion", "minutes": 30, "color": "#dc2626", "icon": "❤️"},
    {"category": "Coding", "minutes": 210, "color": "#16a34a", "icon": "💻"},
    {"category": "Research", "minutes": 65, "color": "#0891b2", "icon": "🔬"},
    {"category": "Exercise", "minutes": 45, "color": "#ea580c", "icon": "💪"},
    {"category": "Eating", "minutes": 55, "color": "#92400e", "icon": "🍽️"},
    {"category": "Music Practice", "minutes": 60, "color": "#9333ea", "icon": "🎸"},
    {"category": "Family Time", "minutes": 75, "color": "#d97706", "icon": "👨‍👩‍👧"},
    {"category": "Evening Review", "minutes": 30, "color": "#0284c7", "icon": "📝"},
    {"category": "Free / Rest", "minutes": 90, "color": "#93c5fd", "icon": "☕"},
    {"category": "Untracked", "minutes": 305, "color": "#d1d5db", "icon": "❓"},
]

MOCK_TASKS = [
    {
        "id": "t1", "title": "Morning Prayer & Bible Study",
        "planned_start": "05:30", "planned_end": "06:30",
        "category": "Prayer", "priority": "high",
        "status": "completed", "delay_minutes": 0, "completion_percentage": 100
    },
    {
        "id": "t2", "title": "Family Devotion with Kids",
        "planned_start": "06:30", "planned_end": "07:00",
        "category": "Family Devotion", "priority": "high",
        "status": "completed", "delay_minutes": 5, "completion_percentage": 100
    },
    {
        "id": "t3", "title": "Exercise / Workout",
        "planned_start": "07:00", "planned_end": "08:00",
        "category": "Exercise", "priority": "medium",
        "status": "partial", "delay_minutes": 15, "completion_percentage": 75
    },
    {
        "id": "t4", "title": "Deep Work — Claude-Fire Project",
        "planned_start": "09:00", "planned_end": "12:00",
        "category": "Coding", "priority": "high",
        "status": "in_progress", "delay_minutes": 0, "completion_percentage": 60
    },
    {
        "id": "t5", "title": "Antigravity Research Reading",
        "planned_start": "13:00", "planned_end": "14:00",
        "category": "Research", "priority": "medium",
        "status": "pending", "delay_minutes": 0, "completion_percentage": 0
    },
    {
        "id": "t6", "title": "Bass Guitar Practice",
        "planned_start": "16:00", "planned_end": "17:00",
        "category": "Music Practice", "priority": "medium",
        "status": "pending", "delay_minutes": 0, "completion_percentage": 0
    },
    {
        "id": "t7", "title": "Evening Review",
        "planned_start": "21:30", "planned_end": "22:00",
        "category": "Evening Review", "priority": "high",
        "status": "pending", "delay_minutes": 0, "completion_percentage": 0
    },
]


# ═══════════════════════════════════════════════════════════════════════════════
#  DASHBOARD
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/dashboard/today", methods=["GET"])
def dashboard_today():
    """Returns all today's data for the main dashboard."""
    return jsonify({
        "date": today_str(),
        "execution_score": 74,
        "tasks": MOCK_TASKS,
        "pie_chart": MOCK_TODAY_PIE,
        "prayer": {
            "streak": 12,
            "today_minutes": 50,
            "goal_minutes": 45,
            "completed": True,
            "themes": ["wisdom", "family", "nation"]
        },
        "health": {
            "sleep_hours": 6.5,
            "sleep_quality": 78,
            "water_ml": 1500,
            "water_goal_ml": 2500,
            "steps": 4200,
            "active_minutes": 45
        },
        "finance": {
            "westpac_balance": 3240.50,
            "mpaisa_balance": 85.00,
            "today_spending": 42.50,
            "monthly_savings_rate": 18
        },
        "coding": {
            "today_minutes": 210,
            "streak": 7,
            "top_project": "Claude-Fire",
            "languages": [
                {"name": "TypeScript", "minutes": 120},
                {"name": "Python", "minutes": 60},
                {"name": "SQL", "minutes": 30}
            ]
        },
        "mission": {
            "souls_reached_month": 23,
            "research_hours_week": 4.5,
            "antigravity_notes": 3,
            "kingdom_activities": 2
        },
        "ai_tip": "You're 12 minutes ahead of your prayer goal. Consider adding a gratitude journaling block after dinner to boost your evening review quality.",
    })


@app.route("/api/dashboard/weekly", methods=["GET"])
def dashboard_weekly():
    """Weekly summary for analytics page."""
    days = []
    for i in range(6, -1, -1):
        d = date.today() - timedelta(days=i)
        days.append({
            "date": d.isoformat(),
            "day": d.strftime("%a"),
            "execution_score": 70 + (i * 3 % 25),
            "prayer_minutes": 40 + (i * 5 % 20),
            "coding_minutes": 180 + (i * 20 % 120),
            "sleep_hours": 6.0 + (i * 0.3 % 2),
            "water_ml": 1800 + (i * 100 % 700),
        })
    return jsonify({
        "days": days,
        "weekly_score": 76,
        "best_day": "Monday",
        "worst_day": "Wednesday",
        "top_improvement": "Water intake consistency",
        "ai_analysis": "This week you maintained strong spiritual discipline (prayer streak: 12 days). Coding output was high Mon–Tue but dropped mid-week. Exercise was skipped 3 days. Focus next week: consistent exercise and better mid-week energy management.",
    })


# ═══════════════════════════════════════════════════════════════════════════════
#  PRAYER
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/prayer/log", methods=["POST"])
def prayer_log():
    data = request.get_json() or {}
    sb = get_supabase()
    record = {
        "date": today_str(),
        "started_at": datetime.utcnow().isoformat(),
        "themes": data.get("themes", []),
        "type": data.get("type", "personal"),
    }
    if sb:
        res = sb.table("prayer_logs").insert(record).execute()
        return jsonify({"id": res.data[0]["id"], "message": "Prayer started", "record": res.data[0]})
    return jsonify({"id": "mock-prayer-1", "message": "Prayer started (mock)", "record": record})


@app.route("/api/prayer/end/<prayer_id>", methods=["PUT"])
def prayer_end(prayer_id):
    data = request.get_json() or {}
    ended_at = datetime.utcnow().isoformat()
    sb = get_supabase()
    update = {
        "ended_at": ended_at,
        "duration_minutes": data.get("duration_minutes", 0),
        "voice_transcript": data.get("voice_transcript"),
        "ai_summary": data.get("ai_summary"),
    }
    if sb:
        res = sb.table("prayer_logs").update(update).eq("id", prayer_id).execute()
        return jsonify({"message": "Prayer session ended", "record": res.data[0]})
    return jsonify({"message": "Prayer session ended (mock)", "record": update})


@app.route("/api/prayer/stats", methods=["GET"])
def prayer_stats():
    return jsonify({
        "streak": 12,
        "longest_streak": 21,
        "this_month": {"days": 24, "total_minutes": 1080, "average_minutes": 45},
        "theme_breakdown": [
            {"theme": "wisdom", "count": 18},
            {"theme": "family", "count": 15},
            {"theme": "nation", "count": 12},
            {"theme": "healing", "count": 8},
            {"theme": "vision", "count": 20},
        ],
        "weekly_consistency": [True, True, True, False, True, True, True],
        "ai_insight": "Your prayer consistency is in the top percentile. Vision-themed prayers have been most frequent this month — consider journaling your vision revelations.",
    })


# ═══════════════════════════════════════════════════════════════════════════════
#  FAMILY DEVOTION
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/family-devotion/log", methods=["POST"])
def family_devotion_log():
    data = request.get_json() or {}
    sb = get_supabase()
    record = {
        "date": today_str(),
        "started_at": datetime.utcnow().isoformat(),
        "participants": data.get("participants", []),
        "passage_studied": data.get("passage_studied", ""),
        "notes": data.get("notes", ""),
    }
    if sb:
        res = sb.table("family_devotion_logs").insert(record).execute()
        return jsonify({"id": res.data[0]["id"], "message": "Devotion logged"})
    return jsonify({"id": "mock-dev-1", "message": "Devotion logged (mock)"})


# ═══════════════════════════════════════════════════════════════════════════════
#  MUSIC
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/music/log", methods=["POST"])
def music_log():
    data = request.get_json() or {}
    sb = get_supabase()
    record = {
        "date": today_str(),
        "started_at": datetime.utcnow().isoformat(),
        "instrument": data.get("instrument", "bass"),
        "what_practiced": data.get("what_practiced", ""),
        "milestone": data.get("milestone"),
        "notes": data.get("notes"),
    }
    if sb:
        res = sb.table("music_logs").insert(record).execute()
        return jsonify({"id": res.data[0]["id"], "message": "Practice started"})
    return jsonify({"id": "mock-music-1", "message": "Practice started (mock)"})


@app.route("/api/music/stats", methods=["GET"])
def music_stats():
    return jsonify({
        "streak": 8,
        "this_week_minutes": 320,
        "this_month_minutes": 1240,
        "average_session_minutes": 55,
        "top_focus": "worship songs",
        "milestones": [
            {"date": "2026-03-20", "milestone": "Learned 'Oceans' intro riff"},
            {"date": "2026-03-15", "milestone": "Completed C major scale exercise"},
            {"date": "2026-03-10", "milestone": "First full worship song played"},
        ],
        "weekly_minutes": [45, 60, 50, 0, 55, 60, 50],
    })


# ═══════════════════════════════════════════════════════════════════════════════
#  DIARY / OCR
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/diary/upload", methods=["POST"])
def diary_upload():
    from services.ocr_service import process_image
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400
    image_file = request.files["image"]
    result = process_image(image_file)
    sb = get_supabase()
    record = {
        "date": today_str(),
        "raw_text": result["raw_text"],
        "ai_summary": result.get("ai_summary"),
        "tags": result.get("tags", []),
        "ocr_confidence": result.get("confidence", 0),
        "processed_at": datetime.utcnow().isoformat(),
    }
    if sb:
        res = sb.table("diary_entries").insert(record).execute()
        return jsonify({"id": res.data[0]["id"], **result})
    return jsonify({"id": "mock-diary-1", **result})


# ═══════════════════════════════════════════════════════════════════════════════
#  TASKS
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/tasks/today", methods=["GET"])
def tasks_today():
    return jsonify({"date": today_str(), "tasks": MOCK_TASKS})


@app.route("/api/tasks/sync-calendar", methods=["POST"])
def tasks_sync_calendar():
    from services.calendar_service import sync_tasks_to_calendar
    data = request.get_json() or {}
    task_ids = data.get("task_ids", [])
    result = sync_tasks_to_calendar(task_ids)
    return jsonify(result)


@app.route("/api/tasks/execution", methods=["POST"])
def task_execution():
    data = request.get_json() or {}
    sb = get_supabase()
    record = {
        "task_id": data.get("task_id"),
        "date": today_str(),
        "actual_start": data.get("actual_start"),
        "actual_end": data.get("actual_end"),
        "planned_duration_minutes": data.get("planned_duration_minutes", 0),
        "actual_duration_minutes": data.get("actual_duration_minutes", 0),
        "status": data.get("status", "completed"),
        "delay_minutes": data.get("delay_minutes", 0),
        "completion_percentage": data.get("completion_percentage", 100),
        "skip_reason": data.get("skip_reason"),
        "notes": data.get("notes"),
    }
    if sb:
        res = sb.table("task_executions").insert(record).execute()
        return jsonify({"id": res.data[0]["id"], "message": "Execution logged"})
    return jsonify({"id": "mock-exec-1", "message": "Execution logged (mock)"})


# ═══════════════════════════════════════════════════════════════════════════════
#  EXECUTION SCORE
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/execution/score", methods=["GET"])
def execution_score():
    return jsonify({
        "date": today_str(),
        "score": 74,
        "grade": "B",
        "breakdown": {
            "on_time_tasks": 3,
            "partial_tasks": 1,
            "skipped_tasks": 0,
            "pending_tasks": 3,
            "total_tasks": 7,
        },
        "category_scores": [
            {"category": "Spiritual", "score": 95, "color": "#f59e0b"},
            {"category": "Coding", "score": 70, "color": "#16a34a"},
            {"category": "Health", "score": 65, "color": "#ea580c"},
            {"category": "Music", "score": 80, "color": "#9333ea"},
            {"category": "Research", "score": 55, "color": "#0891b2"},
        ]
    })


@app.route("/api/execution/weekly-analysis", methods=["GET"])
def weekly_analysis():
    from services.ollama_service import generate_weekly_analysis
    analysis = generate_weekly_analysis()
    return jsonify({"analysis": analysis, "generated_at": datetime.utcnow().isoformat()})


# ═══════════════════════════════════════════════════════════════════════════════
#  EVENING REVIEW
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/evening-review", methods=["POST"])
def evening_review():
    data = request.get_json() or {}
    from services.ollama_service import generate_evening_insights
    ai_insights = generate_evening_insights(data)
    sb = get_supabase()
    record = {
        "date": today_str(),
        "execution_score": data.get("execution_score", 0),
        "went_well": data.get("went_well", ""),
        "improve_tomorrow": data.get("improve_tomorrow", ""),
        "mood": data.get("mood", 3),
        "diary_image_url": data.get("diary_image_url"),
        "ai_insights": ai_insights,
    }
    if sb:
        res = sb.table("evening_reviews").insert(record).execute()
        return jsonify({"id": res.data[0]["id"], "ai_insights": ai_insights, "message": "Review saved"})
    return jsonify({"id": "mock-review-1", "ai_insights": ai_insights, "message": "Review saved (mock)"})


# ═══════════════════════════════════════════════════════════════════════════════
#  HEALTH
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/health/today", methods=["GET"])
def health_today():
    return jsonify({
        "date": today_str(),
        "sleep": {
            "start": "22:30",
            "end": "05:00",
            "duration_hours": 6.5,
            "quality_score": 78,
        },
        "water": {
            "intake_ml": 1500,
            "goal_ml": 2500,
            "percentage": 60,
            "logs": [
                {"time": "06:00", "amount_ml": 250},
                {"time": "08:30", "amount_ml": 500},
                {"time": "12:00", "amount_ml": 500},
                {"time": "15:00", "amount_ml": 250},
            ]
        },
        "meals": [
            {"meal_type": "breakfast", "time": "07:00", "description": "Sago with vegetables", "calories": 380},
            {"meal_type": "lunch", "time": "12:30", "description": "Rice with chicken", "calories": 620},
        ],
        "activity": {"steps": 4200, "active_minutes": 45, "calories_burned": 320},
        "weight_kg": 78.5,
    })


@app.route("/api/health/water", methods=["POST"])
def health_water():
    data = request.get_json() or {}
    amount_ml = data.get("amount_ml", 250)
    sb = get_supabase()
    if sb:
        today_log = sb.table("health_logs").select("*").eq("date", today_str()).execute()
        if today_log.data:
            current = today_log.data[0].get("water_intake_ml", 0)
            sb.table("health_logs").update({"water_intake_ml": current + amount_ml}).eq("date", today_str()).execute()
        else:
            sb.table("health_logs").insert({"date": today_str(), "water_intake_ml": amount_ml}).execute()
    return jsonify({"message": f"Added {amount_ml}ml", "total_ml": 1500 + amount_ml})


@app.route("/api/health/meal", methods=["POST"])
def health_meal():
    data = request.get_json() or {}
    sb = get_supabase()
    record = {
        "date": today_str(),
        "meal_type": data.get("meal_type", "snack"),
        "logged_at": datetime.utcnow().isoformat(),
        "food_description": data.get("food_description", ""),
        "estimated_calories": data.get("calories", 0),
    }
    if sb:
        res = sb.table("meal_logs").insert(record).execute()
        return jsonify({"id": res.data[0]["id"], "message": "Meal logged"})
    return jsonify({"id": "mock-meal-1", "message": "Meal logged (mock)"})


# ═══════════════════════════════════════════════════════════════════════════════
#  FINANCE
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/finance/summary", methods=["GET"])
def finance_summary():
    return jsonify({
        "westpac_balance": 3240.50,
        "mpaisa_balance": 85.00,
        "total_balance": 3325.50,
        "currency": "FJD",
        "this_month": {
            "income": 4800.00,
            "expenses": 3920.00,
            "savings": 880.00,
            "savings_rate": 18.3,
        },
        "today": {
            "spending": 42.50,
            "transactions": 3,
        },
        "top_categories": [
            {"category": "Food & Groceries", "amount": 1200.00, "color": "#92400e"},
            {"category": "Transport", "amount": 620.00, "color": "#6b7280"},
            {"category": "Church / Tithe", "amount": 480.00, "color": "#b91c1c"},
            {"category": "Bills / Utilities", "amount": 850.00, "color": "#0891b2"},
            {"category": "Entertainment", "amount": 370.00, "color": "#ec4899"},
        ]
    })


@app.route("/api/finance/transactions", methods=["GET"])
def finance_transactions():
    return jsonify({
        "transactions": [
            {"id": "1", "date": today_str(), "source": "mpaisa", "type": "expense", "amount": 25.00, "description": "BSP transfer", "merchant": "BSP", "category": "Transfer", "currency": "FJD"},
            {"id": "2", "date": today_str(), "source": "cash", "type": "expense", "amount": 12.50, "description": "Betelnut & snacks", "merchant": "Market", "category": "Food", "currency": "FJD"},
            {"id": "3", "date": today_str(), "source": "westpac", "type": "expense", "amount": 5.00, "description": "Coffee", "merchant": "CP Coffee", "category": "Food", "currency": "FJD"},
            {"id": "4", "date": (date.today() - timedelta(days=1)).isoformat(), "source": "westpac", "type": "income", "amount": 1200.00, "description": "Freelance payment", "merchant": "Client", "category": "Income", "currency": "FJD"},
        ]
    })


# ═══════════════════════════════════════════════════════════════════════════════
#  CODING / WAKATIME
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/coding/stats", methods=["GET"])
def coding_stats():
    from services.wakatime_service import get_today_stats
    stats = get_today_stats()
    return jsonify(stats)


# ═══════════════════════════════════════════════════════════════════════════════
#  MISSION
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/mission/log", methods=["POST"])
def mission_log():
    data = request.get_json() or {}
    sb = get_supabase()
    record = {
        "date": today_str(),
        "pillar": data.get("pillar", "kingdom"),
        "activity": data.get("activity", ""),
        "milestone": data.get("milestone"),
        "souls_reached": data.get("souls_reached", 0),
        "research_hours": data.get("research_hours", 0),
        "notes": data.get("notes"),
    }
    if sb:
        res = sb.table("mission_logs").insert(record).execute()
        return jsonify({"id": res.data[0]["id"], "message": "Mission activity logged"})
    return jsonify({"id": "mock-mission-1", "message": "Mission activity logged (mock)"})


@app.route("/api/mission/stats", methods=["GET"])
def mission_stats():
    return jsonify({
        "antigravity": {
            "total_research_hours": 48.5,
            "this_week_hours": 4.5,
            "notes_count": 23,
            "papers_reviewed": 8,
            "milestones": [
                {"date": "2026-03-15", "milestone": "Completed literature review chapter 1"},
                {"date": "2026-03-01", "milestone": "First experimental hypothesis formed"},
            ]
        },
        "kingdom": {
            "souls_reached_total": 156,
            "souls_reached_this_month": 23,
            "church_activities": 8,
            "evangelism_events": 3,
            "discipleship_sessions": 5,
            "milestones": [
                {"date": "2026-03-20", "milestone": "Led youth service, 8 committed"},
                {"date": "2026-03-08", "milestone": "Community outreach in Boroko"},
            ]
        }
    })


# ═══════════════════════════════════════════════════════════════════════════════
#  NOTIFICATIONS
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/notifications/check", methods=["GET"])
def notifications_check():
    from services.notification_service import check_all_notifications
    results = check_all_notifications()
    return jsonify(results)


# ═══════════════════════════════════════════════════════════════════════════════
#  PIE CHART DATA
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/pie-chart/today", methods=["GET"])
def pie_chart_today():
    total_minutes = sum(item["minutes"] for item in MOCK_TODAY_PIE)
    data_with_pct = []
    for item in MOCK_TODAY_PIE:
        data_with_pct.append({
            **item,
            "percentage": round((item["minutes"] / 1440) * 100, 1),
        })
    return jsonify({
        "date": today_str(),
        "total_tracked_minutes": total_minutes,
        "total_minutes_in_day": 1440,
        "data": data_with_pct
    })


# ═══════════════════════════════════════════════════════════════════════════════
#  XP GAMIFICATION SYSTEM
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/xp/today", methods=["GET"])
def xp_today():
    """Returns today's XP breakdown and total"""
    from services.xp_service import XPCalculator
    calc = XPCalculator(get_supabase())

    # Mock data for now (will connect to actual logs)
    today_activities = {
        "prayer_minutes": 50,
        "bible_study_minutes": 35,
        "water_ml": 1500,
        "training_minutes": 90,
        "research_minutes": 120,
        "coding_minutes": 210,
        "bass_practice_minutes": 60,
        "fasting_weekly": False,
        "mentoring_minutes": 0,
    }

    total_xp, breakdown = calc.calculate_daily_xp(today_activities)

    return jsonify({
        "date": today_str(),
        "daily_xp": total_xp,
        "breakdown": breakdown,
        "progress_to_next_level": {
            "current": 67,
            "needed": 100,
            "percentage": 67
        }
    })


@app.route("/api/xp/weekly", methods=["GET"])
def xp_weekly():
    """Returns weekly XP summary"""
    return jsonify({
        "week_start": (date.today() - timedelta(days=date.today().weekday())).isoformat(),
        "week_end": (date.today() + timedelta(days=6 - date.today().weekday())).isoformat(),
        "total_xp": 487,
        "daily_breakdown": [
            {"day": "Monday", "xp": 85},
            {"day": "Tuesday", "xp": 92},
            {"day": "Wednesday", "xp": 71},
            {"day": "Thursday", "xp": 88},
            {"day": "Friday", "xp": 79},
            {"day": "Saturday", "xp": 97},
            {"day": "Sunday", "xp": 75},
        ],
        "consistency": 87,
        "streak": 12
    })


@app.route("/api/xp/monthly", methods=["GET"])
def xp_monthly():
    """Returns monthly XP summary"""
    from datetime import date
    today = date.today()
    month_start = date(today.year, today.month, 1)
    month_end = date(today.year, today.month + 1, 1) - timedelta(days=1) if today.month < 12 else date(today.year + 1, 1, 1) - timedelta(days=1)

    return jsonify({
        "month": today.strftime("%B %Y"),
        "total_xp": 1850,
        "days_active": 25,
        "avg_daily": 74,
        "best_day": 120,
        "worst_day": 35,
        "bonuses_earned": 150,
        "trend": "↑ 12% from last month"
    })


# ─── SKILL TREES ─────────────────────────────────────────────────────────────

@app.route("/api/skills/levels", methods=["GET"])
def skills_levels():
    """Returns all 6 skill tree current levels and XP"""
    from services.xp_service import SKILL_TREES

    return jsonify({
        "skills": [
            {
                "id": "prayer_spirit",
                "name": SKILL_TREES["prayer_spirit"]["name"],
                "icon": SKILL_TREES["prayer_spirit"]["icon"],
                "level": 5,
                "current_xp": 850,
                "xp_to_next": 150,
                "total_earned": 2350,
                "status": "ACTIVE"
            },
            {
                "id": "antigravity",
                "name": SKILL_TREES["antigravity"]["name"],
                "icon": SKILL_TREES["antigravity"]["icon"],
                "level": 4,
                "current_xp": 650,
                "xp_to_next": 350,
                "total_earned": 2150,
                "status": "ACTIVE"
            },
            {
                "id": "kingdom_influence",
                "name": SKILL_TREES["kingdom_influence"]["name"],
                "icon": SKILL_TREES["kingdom_influence"]["icon"],
                "level": 5,
                "current_xp": 920,
                "xp_to_next": 80,
                "total_earned": 2420,
                "status": "ACTIVE"
            },
            {
                "id": "coding_automation",
                "name": SKILL_TREES["coding_automation"]["name"],
                "icon": SKILL_TREES["coding_automation"]["icon"],
                "level": 4,
                "current_xp": 700,
                "xp_to_next": 300,
                "total_earned": 2200,
                "status": "ACTIVE"
            },
            {
                "id": "health_discipline",
                "name": SKILL_TREES["health_discipline"]["name"],
                "icon": SKILL_TREES["health_discipline"]["icon"],
                "level": 5,
                "current_xp": 880,
                "xp_to_next": 120,
                "total_earned": 2380,
                "status": "ACTIVE"
            },
            {
                "id": "spiritual_engineering",
                "name": SKILL_TREES["spiritual_engineering"]["name"],
                "icon": SKILL_TREES["spiritual_engineering"]["icon"],
                "level": 3,
                "current_xp": 380,
                "xp_to_next": 620,
                "total_earned": 880,
                "status": "NEW"
            },
        ]
    })


# ─── REWARDS ─────────────────────────────────────────────────────────────────

@app.route("/api/rewards/status", methods=["GET"])
def rewards_status():
    """Get current reward tier eligibility"""
    from services.xp_service import RewardTracker
    tracker = RewardTracker(get_supabase())

    tracker_data = {
        "weekly_consistency": 71,
        "monthly_consistency": 74,
        "skill_levelups_this_month": 1,
        "phase_milestones_done": 18,
        "phase_total_milestones": 25,
        "phase_progress_percent": 72,
        "highest_skill_level": 5,
    }

    status = tracker.get_reward_status(tracker_data)

    return jsonify({
        "current_status": status,
        "monthly_budget": {
            "total": 300,
            "spent": 180,
            "remaining": 120
        }
    })


@app.route("/api/rewards/history", methods=["GET"])
def rewards_history():
    """Get reward claim history"""
    sb = get_supabase()

    if sb:
        try:
            response = sb.table("reward_claims").select("*").order("date", desc=True).limit(20).execute()
            return jsonify({"rewards": response.data})
        except:
            pass

    # Mock data
    return jsonify({
        "rewards": [
            {
                "date": "2026-03-22",
                "tier": 1,
                "reward_name": "McDonald's with kids",
                "status": "claimed",
                "photo_url": "..."
            },
            {
                "date": "2026-03-15",
                "tier": 1,
                "reward_name": "Ice cream outing",
                "status": "claimed",
                "photo_url": "..."
            },
            {
                "date": "2026-03-08",
                "tier": 1,
                "reward_name": "Restaurant night",
                "status": "claimed",
                "photo_url": "..."
            },
            {
                "date": "2026-02-28",
                "tier": 2,
                "reward_name": "Upscale dinner",
                "status": "claimed",
                "photo_url": "..."
            },
        ]
    })


@app.route("/api/rewards/claim", methods=["POST"])
def rewards_claim():
    """Log a reward claim"""
    data = request.get_json() or {}
    sb = get_supabase()

    record = {
        "date": today_str(),
        "tier": data.get("tier", 1),
        "reward_name": data.get("reward_name", ""),
        "reward_description": data.get("description", ""),
        "budget_fj_dollars": data.get("budget", 0),
        "status": "claimed",
        "claimed_date": today_str(),
        "notes": data.get("notes", ""),
        "photo_url": data.get("photo_url"),
    }

    if sb:
        try:
            res = sb.table("reward_claims").insert(record).execute()
            return jsonify({"id": res.data[0]["id"], "message": "Reward claimed!", "reward": res.data[0]})
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    return jsonify({"id": "mock-reward-1", "message": "Reward claimed (mock)!"})


# ─── CONSISTENCY & PHASES ────────────────────────────────────────────────────

@app.route("/api/phases/current", methods=["GET"])
def current_phase():
    """Get current phase and unlock requirements"""
    return jsonify({
        "current_phase": 1,
        "phase_name": "FOUNDATION & BREAKTHROUGH",
        "age_range": "36-40",
        "progress_percentage": 67,
        "milestones_completed": 8,
        "milestones_total": 10,
        "xp_required": 250000,
        "xp_earned": 180000,
        "xp_percentage": 72,
        "skill_levels_6plus": 3,  # Have 3 skills at level 6+
        "skill_levels_required": 3,
        "on_track": True,
        "estimated_completion": "December 2030"
    })


@app.route("/api/consistency/heatmap", methods=["GET"])
def consistency_heatmap():
    """Get 52-week consistency heatmap data"""
    return jsonify({
        "week_data": [
            # Week 1-4 of current month
            [100, 85, 75, 90, 95, 100, 80],  # Week 1
            [95, 90, 85, 75, 95, 100, 85],   # Week 2
            [90, 85, 95, 100, 90, 85, 90],   # Week 3
            [100, 95, 90, 100, 95, 100, 100], # Week 4
            # More weeks (mock data)
            [85, 80, 75, 80, 85, 90, 80],
            [90, 95, 100, 95, 90, 85, 90],
        ],
        "month_averages": {
            "January": 92,
            "February": 88,
            "March": 87
        },
        "current_streak": 47,
        "best_streak": 78,
        "target_consistency": 90
    })


# ═══════════════════════════════════════════════════════════════════════════════
#  TOMORROW PLAN (AI-Generated from Evening Review)
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/tomorrow-plan/generate", methods=["POST"])
def tomorrow_plan_generate():
    """Generate AI tomorrow plan from evening review data using Ollama."""
    from services.ollama_service import generate_tomorrow_plan
    data = request.get_json() or {}

    # Enrich with today's XP and streak from DB if available
    sb = get_supabase()
    if sb:
        try:
            xp_row = sb.table("xp_logs").select("daily_total").eq("date", today_str()).execute()
            if xp_row.data:
                data["xp_today"] = xp_row.data[0]["daily_total"]
        except Exception:
            pass

    plan = generate_tomorrow_plan(data)

    # Save plan to evening_reviews table if review data provided
    if data.get("execution_score") and sb:
        try:
            sb.table("evening_reviews").upsert({
                "date": today_str(),
                "execution_score": data.get("execution_score", 0),
                "went_well": data.get("went_well", ""),
                "improve_tomorrow": data.get("improve_tomorrow", ""),
                "mood": data.get("mood", 3),
                "ai_insights": plan.get("encouragement", ""),
            }).execute()
        except Exception:
            pass

    return jsonify({
        "plan": plan,
        "generated_at": datetime.utcnow().isoformat(),
        "for_date": (date.today() + timedelta(days=1)).isoformat(),
    })


@app.route("/api/tomorrow-plan/latest", methods=["GET"])
def tomorrow_plan_latest():
    """Get the most recently generated tomorrow plan."""
    sb = get_supabase()
    if sb:
        try:
            row = sb.table("evening_reviews").select("*").order("date", desc=True).limit(1).execute()
            if row.data:
                return jsonify({"plan": row.data[0], "source": "database"})
        except Exception:
            pass

    # Return a default starter plan
    from services.ollama_service import generate_tomorrow_plan
    plan = generate_tomorrow_plan({
        "execution_score": 74,
        "went_well": "Prayer and coding sessions",
        "improve_tomorrow": "Water intake and training",
        "mood": 4,
        "streak": 12,
    })
    return jsonify({
        "plan": plan,
        "generated_at": datetime.utcnow().isoformat(),
        "for_date": (date.today() + timedelta(days=1)).isoformat(),
    })


# ═══════════════════════════════════════════════════════════════════════════════
#  YOUTUBE ANALYTICS
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/youtube/stats", methods=["GET"])
def youtube_stats():
    """Fetch live YouTube channel statistics."""
    from services.youtube_service import get_channel_stats, get_growth_data
    channel = get_channel_stats()
    growth  = get_growth_data()
    return jsonify({
        "channel": channel,
        "growth": growth,
        "playlists": {
            "worship_music": {
                "name": "Worship Music",
                "videos": 15,
                "status": "Maintenance mode (1-2/month)",
            },
            "spiritual_engineering": {
                "name": "Spiritual Engineering",
                "videos": 8,
                "target": 20,
                "status": "Active (1/week)",
            }
        }
    })


@app.route("/api/youtube/videos", methods=["GET"])
def youtube_videos():
    """Fetch recent YouTube videos with stats."""
    from services.youtube_service import get_recent_videos
    videos = get_recent_videos(max_results=10)
    return jsonify({"videos": videos, "total": len(videos)})


@app.route("/api/youtube/milestones", methods=["GET"])
def youtube_milestones():
    """Return subscriber milestone progress."""
    from services.youtube_service import get_growth_data
    growth = get_growth_data()
    return jsonify({
        "current": growth.get("current_subscribers", 62),
        "milestones": growth.get("milestones", []),
        "phase_targets": {
            "phase_1": 10000,
            "phase_2": 100000,
            "phase_3": 500000,
            "phase_4": 1000000,
        }
    })


# ═══════════════════════════════════════════════════════════════════════════════
#  HEALTH CHECK
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "user": "Waqa",
        "location": "Fiji"
    })


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV", "development") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)
