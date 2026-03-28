"""
YouTube Analytics Service for Waqa-OS
Fetches live channel stats using YouTube Data API v3
Channel: "Burning Stone Ministry" (@BurningStoneMinistry)
  - Playlist 1: Worship Music (existing, 62 subs)
  - Playlist 2: Spiritual Engineering (NEW - teaching content)

SETUP: Set YOUTUBE_API_KEY in Render environment variables
       Set YOUTUBE_CHANNEL_ID = UCzgfn33xOj_Dly244wV1Atg in Render
"""

import os
import requests
from datetime import datetime, timedelta

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
YOUTUBE_CHANNEL_ID = os.getenv("YOUTUBE_CHANNEL_ID", "")
YOUTUBE_BASE = "https://www.googleapis.com/youtube/v3"


def _api_available() -> bool:
    """Check if YouTube API key is configured."""
    return bool(YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID)


def get_channel_stats() -> dict:
    """
    Fetch live channel statistics from YouTube API.
    Returns subscriber count, total views, video count.
    """
    if not _api_available():
        return _mock_channel_stats()

    try:
        url = f"{YOUTUBE_BASE}/channels"
        params = {
            "part": "statistics,snippet",
            "id": YOUTUBE_CHANNEL_ID,
            "key": YOUTUBE_API_KEY,
        }
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        if not data.get("items"):
            return _mock_channel_stats()

        item = data["items"][0]
        stats = item["statistics"]
        snippet = item["snippet"]

        return {
            "channel_name": snippet.get("title", "Waqa's Channel"),
            "description": snippet.get("description", ""),
            "subscribers": int(stats.get("subscriberCount", 0)),
            "total_views": int(stats.get("viewCount", 0)),
            "total_videos": int(stats.get("videoCount", 0)),
            "joined_date": snippet.get("publishedAt", ""),
            "live": True,
        }
    except Exception as e:
        print(f"[YouTube] channel stats error: {e}")
        return _mock_channel_stats()


def get_recent_videos(max_results: int = 10) -> list:
    """
    Fetch most recent videos with stats (views, likes, comments).
    """
    if not _api_available():
        return _mock_recent_videos()

    try:
        # Step 1: Get video IDs from channel uploads
        search_url = f"{YOUTUBE_BASE}/search"
        search_params = {
            "part": "snippet",
            "channelId": YOUTUBE_CHANNEL_ID,
            "maxResults": max_results,
            "order": "date",
            "type": "video",
            "key": YOUTUBE_API_KEY,
        }
        search_resp = requests.get(search_url, params=search_params, timeout=10)
        search_resp.raise_for_status()
        search_data = search_resp.json()

        video_ids = [item["id"]["videoId"] for item in search_data.get("items", [])]
        if not video_ids:
            return _mock_recent_videos()

        # Step 2: Get stats for each video
        videos_url = f"{YOUTUBE_BASE}/videos"
        videos_params = {
            "part": "statistics,snippet,contentDetails",
            "id": ",".join(video_ids),
            "key": YOUTUBE_API_KEY,
        }
        videos_resp = requests.get(videos_url, params=videos_params, timeout=10)
        videos_resp.raise_for_status()
        videos_data = videos_resp.json()

        videos = []
        for item in videos_data.get("items", []):
            snippet = item["snippet"]
            stats = item.get("statistics", {})
            videos.append({
                "id": item["id"],
                "title": snippet.get("title", ""),
                "published_at": snippet.get("publishedAt", ""),
                "thumbnail": snippet.get("thumbnails", {}).get("medium", {}).get("url", ""),
                "views": int(stats.get("viewCount", 0)),
                "likes": int(stats.get("likeCount", 0)),
                "comments": int(stats.get("commentCount", 0)),
                "playlist": _detect_playlist(snippet.get("title", "")),
                "url": f"https://youtube.com/watch?v={item['id']}",
            })

        return videos
    except Exception as e:
        print(f"[YouTube] recent videos error: {e}")
        return _mock_recent_videos()


def get_playlist_stats(playlist_id: str) -> dict:
    """
    Fetch stats for a specific playlist.
    """
    if not _api_available():
        return {}

    try:
        url = f"{YOUTUBE_BASE}/playlists"
        params = {
            "part": "snippet,contentDetails",
            "id": playlist_id,
            "key": YOUTUBE_API_KEY,
        }
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        if not data.get("items"):
            return {}

        item = data["items"][0]
        return {
            "name": item["snippet"]["title"],
            "video_count": item["contentDetails"]["itemCount"],
            "description": item["snippet"]["description"],
        }
    except Exception as e:
        print(f"[YouTube] playlist stats error: {e}")
        return {}


def get_growth_data() -> dict:
    """
    Returns subscriber growth trend data.
    Note: YouTube API requires Analytics scope for historical data.
    This uses estimated growth based on current stats.
    """
    if not _api_available():
        return _mock_growth_data()

    channel = get_channel_stats()
    subs = channel.get("subscribers", 62)

    # Estimate weekly growth (approx 15% week-over-week for growing channels)
    return {
        "current_subscribers": subs,
        "estimated_weekly_growth": max(1, int(subs * 0.05)),
        "milestones": _get_subscriber_milestones(subs),
        "live": True,
    }


def _detect_playlist(title: str) -> str:
    """Detect which playlist a video belongs to based on title keywords."""
    spiritual_keywords = ["spiritual engineering", "prayer", "algorithm", "discipline", "code", "faith", "coding", "antigravity"]
    for kw in spiritual_keywords:
        if kw.lower() in title.lower():
            return "Spiritual Engineering"
    return "Worship Music"


def _get_subscriber_milestones(current: int) -> list:
    milestones = [100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000]
    result = []
    for m in milestones:
        result.append({
            "target": m,
            "reached": current >= m,
            "remaining": max(0, m - current),
            "label": f"{m:,} subs",
        })
    return result


# ─── Mock fallbacks (used when API key not set) ───────────────────────────────

def _mock_channel_stats() -> dict:
    return {
        "channel_name": "Burning Stone Ministry",
        "handle": "@BurningStoneMinistry",
        "subscribers": 62,
        "total_views": 3241,
        "total_videos": 15,
        "joined_date": "2023-01-01",
        "live": False,
        "note": "Set YOUTUBE_API_KEY + YOUTUBE_CHANNEL_ID in Render env vars for live data",
    }


def _mock_recent_videos() -> list:
    return [
        {
            "id": "mock1",
            "title": "Prayer as Algorithm — Spiritual Engineering Ep.1",
            "published_at": "2026-03-20",
            "views": 4200,
            "likes": 187,
            "comments": 43,
            "playlist": "Spiritual Engineering",
            "url": "https://youtube.com",
        },
        {
            "id": "mock2",
            "title": "Discipline = Code Execution | How to Build Habits",
            "published_at": "2026-03-13",
            "views": 3100,
            "likes": 142,
            "comments": 31,
            "playlist": "Spiritual Engineering",
            "url": "https://youtube.com",
        },
        {
            "id": "mock3",
            "title": "Faith-Driven Automation — Building Systems That Work",
            "published_at": "2026-03-06",
            "views": 2800,
            "likes": 119,
            "comments": 27,
            "playlist": "Spiritual Engineering",
            "url": "https://youtube.com",
        },
        {
            "id": "mock4",
            "title": "Worship Cover — Oceans (Hillsong)",
            "published_at": "2026-02-28",
            "views": 980,
            "likes": 67,
            "comments": 12,
            "playlist": "Worship Music",
            "url": "https://youtube.com",
        },
    ]


def _mock_growth_data() -> dict:
    return {
        "current_subscribers": 62,
        "estimated_weekly_growth": 5,
        "weekly_history": [
            {"week": "Week 1 Mar", "subs": 55},
            {"week": "Week 2 Mar", "subs": 58},
            {"week": "Week 3 Mar", "subs": 60},
            {"week": "Week 4 Mar", "subs": 62},
        ],
        "milestones": _get_subscriber_milestones(62),
        "live": False,
    }
