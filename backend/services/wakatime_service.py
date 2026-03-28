"""
WakaTime Service — Coding stats sync
Claude-Fire | Waqa | Fiji
"""

import os
import requests
from datetime import datetime, date


WAKATIME_API_URL = "https://wakatime.com/api/v1"


def _get_headers():
    import base64
    api_key = os.getenv("WAKATIME_API_KEY", "")
    encoded = base64.b64encode(api_key.encode()).decode()
    return {"Authorization": f"Basic {encoded}"}


def _wakatime_configured() -> bool:
    api_key = os.getenv("WAKATIME_API_KEY", "")
    return bool(api_key) and api_key != "your_wakatime_api_key_here"


def get_today_stats() -> dict:
    """Get today's coding stats from WakaTime."""
    if not _wakatime_configured():
        return _mock_today_stats()

    try:
        resp = requests.get(
            f"{WAKATIME_API_URL}/users/current/summaries",
            headers=_get_headers(),
            params={"start": date.today().isoformat(), "end": date.today().isoformat()},
            timeout=10
        )
        if resp.status_code != 200:
            return _mock_today_stats()

        data = resp.json()
        summaries = data.get("data", [{}])
        if not summaries:
            return _mock_today_stats()

        summary = summaries[0]
        total_seconds = summary.get("grand_total", {}).get("total_seconds", 0)
        projects = [
            {"name": p["name"], "minutes": int(p["total_seconds"] / 60)}
            for p in summary.get("projects", [])[:5]
        ]
        languages = [
            {"name": l["name"], "minutes": int(l["total_seconds"] / 60)}
            for l in summary.get("languages", [])[:5]
        ]

        return {
            "today_minutes": int(total_seconds / 60),
            "today_hours": round(total_seconds / 3600, 2),
            "projects": projects,
            "languages": languages,
            "top_project": projects[0]["name"] if projects else "—",
            "source": "wakatime",
            "synced_at": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        print(f"[WakaTime] Error: {e}")
        return _mock_today_stats()


def get_weekly_stats() -> dict:
    """Get last 7 days coding stats from WakaTime."""
    if not _wakatime_configured():
        return _mock_weekly_stats()

    try:
        from datetime import timedelta
        end_date = date.today()
        start_date = end_date - timedelta(days=6)

        resp = requests.get(
            f"{WAKATIME_API_URL}/users/current/summaries",
            headers=_get_headers(),
            params={"start": start_date.isoformat(), "end": end_date.isoformat()},
            timeout=10
        )
        if resp.status_code != 200:
            return _mock_weekly_stats()

        data = resp.json()
        daily = []
        for day_data in data.get("data", []):
            daily.append({
                "date": day_data.get("range", {}).get("date", ""),
                "minutes": int(day_data.get("grand_total", {}).get("total_seconds", 0) / 60),
            })

        total_minutes = sum(d["minutes"] for d in daily)
        return {
            "daily": daily,
            "total_minutes": total_minutes,
            "average_daily_minutes": int(total_minutes / 7) if daily else 0,
            "source": "wakatime",
        }
    except Exception as e:
        print(f"[WakaTime] Weekly error: {e}")
        return _mock_weekly_stats()


def sync_to_supabase(supabase_client) -> int:
    """Sync today's WakaTime data to Supabase coding_sessions table."""
    stats = get_today_stats()
    if stats.get("source") == "mock":
        return 0

    saved = 0
    for project in stats.get("projects", []):
        try:
            record = {
                "date": date.today().isoformat(),
                "project": project["name"],
                "duration_minutes": project["minutes"],
                "source": "wakatime",
                "synced_at": datetime.utcnow().isoformat(),
            }
            supabase_client.table("coding_sessions").upsert(record, on_conflict="date,project").execute()
            saved += 1
        except Exception as e:
            print(f"[WakaTime] Supabase sync error: {e}")

    return saved


# ─── Mock fallbacks ──────────────────────────────────────────────────────────

def _mock_today_stats() -> dict:
    return {
        "today_minutes": 210,
        "today_hours": 3.5,
        "streak": 7,
        "projects": [
            {"name": "Claude-Fire", "minutes": 130},
            {"name": "AntigravityResearch", "minutes": 50},
            {"name": "ChurchWebsite", "minutes": 30},
        ],
        "languages": [
            {"name": "TypeScript", "minutes": 120},
            {"name": "Python", "minutes": 60},
            {"name": "SQL", "minutes": 30},
        ],
        "top_project": "Claude-Fire",
        "source": "mock",
        "synced_at": datetime.utcnow().isoformat(),
    }


def _mock_weekly_stats() -> dict:
    return {
        "daily": [
            {"date": "2026-03-21", "minutes": 240},
            {"date": "2026-03-22", "minutes": 195},
            {"date": "2026-03-23", "minutes": 180},
            {"date": "2026-03-24", "minutes": 90},
            {"date": "2026-03-25", "minutes": 220},
            {"date": "2026-03-26", "minutes": 210},
            {"date": "2026-03-27", "minutes": 210},
        ],
        "total_minutes": 1345,
        "average_daily_minutes": 192,
        "source": "mock",
    }
