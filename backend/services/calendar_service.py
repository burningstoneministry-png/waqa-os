"""
Google Calendar Service
Claude-Fire | Waqa | Fiji
"""

import os
import json
from datetime import datetime, date


def _get_calendar_service():
    """Build authenticated Google Calendar service."""
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build

    SCOPES = ["https://www.googleapis.com/auth/calendar"]
    creds = None

    # Load saved credentials
    token_path = os.path.join(os.path.dirname(__file__), "..", "token.json")
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)

    if not creds or not creds.valid:
        from google.auth.transport.requests import Request
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            client_config = {
                "installed": {
                    "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                    "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                    "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"],
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            }
            flow = InstalledAppFlow.from_client_config(client_config, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(token_path, "w") as token:
            token.write(creds.to_json())

    return build("calendar", "v3", credentials=creds)


def sync_tasks_to_calendar(task_ids: list) -> dict:
    """Push tasks to Google Calendar. Returns sync results."""
    calendar_id = os.getenv("GOOGLE_CALENDAR_ID", "primary")

    # Check if Google is configured
    if not os.getenv("GOOGLE_CLIENT_ID") or os.getenv("GOOGLE_CLIENT_ID") == "your_google_client_id_here":
        return {
            "synced": 0,
            "failed": len(task_ids),
            "message": "Google Calendar not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env",
            "mock": True,
        }

    try:
        service = _get_calendar_service()
    except Exception as e:
        return {"synced": 0, "failed": len(task_ids), "error": str(e)}

    synced = []
    failed = []
    today = date.today().isoformat()

    for task_id in task_ids:
        try:
            # In real implementation, fetch task from Supabase
            # For now use placeholder
            event = {
                "summary": f"Task {task_id}",
                "description": "Synced from Claude-Fire dashboard",
                "start": {"dateTime": f"{today}T09:00:00+12:00", "timeZone": "Pacific/Fiji"},
                "end": {"dateTime": f"{today}T10:00:00+12:00", "timeZone": "Pacific/Fiji"},
                "reminders": {
                    "useDefault": False,
                    "overrides": [
                        {"method": "popup", "minutes": 30},
                        {"method": "popup", "minutes": 5},
                    ],
                },
            }
            result = service.events().insert(calendarId=calendar_id, body=event).execute()
            synced.append({"task_id": task_id, "event_id": result["id"]})
        except Exception as e:
            failed.append({"task_id": task_id, "error": str(e)})

    return {
        "synced": len(synced),
        "failed": len(failed),
        "synced_events": synced,
        "failed_events": failed,
    }


def create_event(title: str, date_str: str, start_time: str, end_time: str,
                 description: str = "", timezone: str = "Pacific/Fiji") -> dict:
    """Create a single calendar event."""
    if not os.getenv("GOOGLE_CLIENT_ID") or os.getenv("GOOGLE_CLIENT_ID") == "your_google_client_id_here":
        return {"event_id": "mock-event-id", "message": "Mock event created (Google Calendar not configured)"}

    try:
        service = _get_calendar_service()
        calendar_id = os.getenv("GOOGLE_CALENDAR_ID", "primary")
        event = {
            "summary": title,
            "description": description,
            "start": {"dateTime": f"{date_str}T{start_time}:00", "timeZone": timezone},
            "end": {"dateTime": f"{date_str}T{end_time}:00", "timeZone": timezone},
        }
        result = service.events().insert(calendarId=calendar_id, body=event).execute()
        return {"event_id": result["id"], "html_link": result.get("htmlLink")}
    except Exception as e:
        return {"error": str(e)}
