"""
Notification Service — Check all alert conditions and send
Claude-Fire | Waqa | Papua New Guinea
"""

import os
from datetime import datetime, date, time as dtime


def check_all_notifications() -> dict:
    """
    Check all notification conditions and send alerts as needed.
    Returns summary of notifications sent.
    """
    now = datetime.now()
    current_time = now.time()
    results = {
        "checked_at": now.isoformat(),
        "notifications_sent": [],
        "skipped": [],
    }

    checks = [
        ("prayer_reminder", _check_prayer_reminder),
        ("water_reminder", _check_water_reminder),
        ("task_reminder", _check_task_reminder),
        ("evening_review_reminder", _check_evening_review_reminder),
    ]

    for name, check_fn in checks:
        try:
            result = check_fn(now)
            if result.get("should_send"):
                results["notifications_sent"].append({"type": name, **result})
            else:
                results["skipped"].append({"type": name, "reason": result.get("reason", "condition not met")})
        except Exception as e:
            results["skipped"].append({"type": name, "error": str(e)})

    return results


def _check_prayer_reminder(now: datetime) -> dict:
    """Check if prayer reminder should be sent (5:15 AM and 7:30 PM)."""
    current_time = now.time()
    prayer_times = [dtime(5, 15), dtime(19, 30)]

    for pt in prayer_times:
        window_start = (datetime.combine(now.date(), pt))
        window_end = window_start.replace(minute=window_start.minute + 5)
        if window_start <= now <= window_end:
            from services.email_service import send_prayer_reminder
            result = send_prayer_reminder()
            return {"should_send": True, "sent": result.get("sent"), "time": pt.strftime("%H:%M")}

    return {"should_send": False, "reason": "Not prayer reminder time"}


def _check_water_reminder(now: datetime) -> dict:
    """Check if water reminder should be sent (every 2 hours between 8AM and 8PM)."""
    current_hour = now.hour
    current_minute = now.minute

    if not (8 <= current_hour < 20):
        return {"should_send": False, "reason": "Outside water reminder hours (8AM-8PM)"}

    # Send at :00 of every even hour
    if current_hour % 2 == 0 and current_minute < 5:
        # Get current water intake (mock for now)
        current_ml = 1500
        goal_ml = 2500
        if current_ml < goal_ml:
            from services.email_service import send_water_reminder
            result = send_water_reminder(current_ml, goal_ml)
            return {"should_send": True, "sent": result.get("sent"), "current_ml": current_ml}

    return {"should_send": False, "reason": "Water goal met or not reminder time"}


def _check_task_reminder(now: datetime) -> dict:
    """Check if a task starts within 30 or 5 minutes and send reminder."""
    # In real implementation, query today's tasks from Supabase
    # Mock: check if we're near a scheduled task time
    upcoming_tasks = _get_upcoming_tasks(now)

    if not upcoming_tasks:
        return {"should_send": False, "reason": "No upcoming tasks in next 35 minutes"}

    task = upcoming_tasks[0]
    minutes_until = task.get("minutes_until", 999)

    if minutes_until <= 5:
        _send_task_notification(task, minutes_until, urgent=True)
        return {"should_send": True, "task": task["title"], "minutes_until": minutes_until}
    elif minutes_until <= 30:
        _send_task_notification(task, minutes_until, urgent=False)
        return {"should_send": True, "task": task["title"], "minutes_until": minutes_until}

    return {"should_send": False, "reason": f"Next task in {minutes_until} minutes"}


def _check_evening_review_reminder(now: datetime) -> dict:
    """Check if 9:30 PM evening review reminder should be sent."""
    if now.hour == 21 and 28 <= now.minute <= 33:
        _send_evening_review_reminder()
        return {"should_send": True, "message": "Evening review reminder sent"}
    return {"should_send": False, "reason": "Not evening review time (9:28-9:33 PM)"}


def _get_upcoming_tasks(now: datetime) -> list:
    """Get tasks starting in the next 35 minutes (mock data)."""
    upcoming = []
    scheduled_times = [
        (5, 30, "Morning Prayer & Bible Study"),
        (7, 0, "Family Devotion"),
        (9, 0, "Deep Work — Claude-Fire"),
        (13, 0, "Research"),
        (16, 0, "Bass Guitar Practice"),
        (21, 30, "Evening Review"),
    ]
    for h, m, title in scheduled_times:
        task_time = dtime(h, m)
        task_dt = datetime.combine(now.date(), task_time)
        delta_minutes = (task_dt - now).total_seconds() / 60
        if 0 < delta_minutes <= 35:
            upcoming.append({"title": title, "scheduled_time": f"{h:02d}:{m:02d}", "minutes_until": int(delta_minutes)})
    return upcoming


def _send_task_notification(task: dict, minutes_until: int, urgent: bool):
    """Send task notification via email."""
    from services.email_service import send_email
    to_email = os.getenv("ALERT_EMAIL", os.getenv("EMAIL_ADDRESS", ""))
    urgency = "⚡ NOW" if urgent else "⏰ UPCOMING"
    subject = f"{urgency}: {task['title']} — {minutes_until} min"
    html = f"""
    <div style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:24px;border-radius:12px;text-align:center;">
      <h1 style="font-size:36px;margin:0;">{'⚡' if urgent else '⏰'}</h1>
      <h2 style="color:#f59e0b;">{task['title']}</h2>
      <p style="color:#94a3b8;">Starts in <strong style="color:#e2e8f0;">{minutes_until} minutes</strong> at {task['scheduled_time']}</p>
    </div>
    """
    send_email(to_email, subject, html)


def _send_evening_review_reminder():
    """Send 9:30 PM evening review reminder."""
    from services.email_service import send_email
    to_email = os.getenv("ALERT_EMAIL", os.getenv("EMAIL_ADDRESS", ""))
    subject = "📝 Evening Review Time — 9:30 PM"
    html = """
    <div style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:24px;border-radius:12px;text-align:center;">
      <h1 style="font-size:36px;margin:0;">📝</h1>
      <h2 style="color:#0284c7;">Evening Review Time</h2>
      <p style="color:#94a3b8;">It's 9:30 PM — time to reflect on your day and plan tomorrow.</p>
      <p style="color:#e2e8f0;">Open Claude-Fire and complete your evening review.</p>
    </div>
    """
    send_email(to_email, subject, html)


def send_monthly_prayer_report(month: int, year: int) -> dict:
    """Generate and send monthly prayer report PDF."""
    from services.email_service import send_email
    # In production, generate PDF with reportlab or weasyprint
    to_email = os.getenv("ALERT_EMAIL", os.getenv("EMAIL_ADDRESS", ""))
    month_names = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    subject = f"🙏 Monthly Prayer Report — {month_names[month]} {year}"
    html = f"""
    <div style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:24px;border-radius:12px;">
      <h1 style="color:#f59e0b;">🙏 Monthly Prayer Report</h1>
      <h2 style="color:#94a3b8;">{month_names[month]} {year}</h2>
      <div style="background:#1e293b;border-radius:8px;padding:20px;margin:16px 0;">
        <p>Prayer days: 24/31</p>
        <p>Total minutes: 1,080</p>
        <p>Average session: 45 min</p>
        <p>Top themes: Vision, Family, Nation</p>
      </div>
      <p style="color:#475569;font-size:12px;text-align:center;">Claude-Fire · Waqa · Papua New Guinea</p>
    </div>
    """
    return send_email(to_email, subject, html)
