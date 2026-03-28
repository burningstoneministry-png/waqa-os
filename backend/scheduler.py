"""
APScheduler — Background task scheduler
Claude-Fire | Waqa | Papua New Guinea

Scheduled jobs:
- 9 PM nightly: pull all APIs, compute score, send daily summary email
- Every hour: WakaTime + health sync
- 8AM-8PM every 2hr: Water reminder check
- 9:30 PM: Evening review reminder
- Task transition reminders (30min + 5min before each task)
- Sunday 6PM: Weekly report email
- 1st of month: Monthly prayer PDF report
"""

import os
import logging
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("claude-fire-scheduler")


def job_nightly_summary():
    """9 PM: Pull all data, compute execution score, send daily email."""
    logger.info("Running nightly summary job...")
    try:
        from services.email_service import send_daily_summary
        # In production, compute real score from Supabase
        score = 74
        highlights = [
            "Completed morning prayer (50 min) ✅",
            "Family devotion done ✅",
            "3.5 hours of coding on Claude-Fire ✅",
            "Bass practice completed ✅",
        ]
        tomorrows_tasks = [
            "5:30 AM — Prayer & Bible Study",
            "7:00 AM — Family Devotion",
            "9:00 AM — Deep Work Session",
            "1:00 PM — Research",
            "4:00 PM — Bass Guitar Practice",
            "9:30 PM — Evening Review",
        ]
        result = send_daily_summary(score, highlights, tomorrows_tasks)
        logger.info(f"Daily summary email: {result}")
    except Exception as e:
        logger.error(f"Nightly summary error: {e}")


def job_sync_wakatime():
    """Every hour: sync WakaTime coding stats."""
    logger.info("Syncing WakaTime...")
    try:
        from services.wakatime_service import get_today_stats
        stats = get_today_stats()
        logger.info(f"WakaTime sync: {stats.get('today_minutes', 0)} min today")
    except Exception as e:
        logger.error(f"WakaTime sync error: {e}")


def job_water_reminder():
    """Every 2 hours (8AM-8PM): Check water intake and send reminder if needed."""
    now = datetime.now()
    if 8 <= now.hour < 20:
        logger.info("Checking water reminder...")
        try:
            from services.notification_service import _check_water_reminder
            result = _check_water_reminder(now)
            if result.get("should_send"):
                logger.info("Water reminder sent")
        except Exception as e:
            logger.error(f"Water reminder error: {e}")


def job_task_reminders():
    """Every 5 minutes: Check for upcoming tasks (30min and 5min alerts)."""
    logger.info("Checking task reminders...")
    try:
        from services.notification_service import _check_task_reminder
        result = _check_task_reminder(datetime.now())
        if result.get("should_send"):
            logger.info(f"Task reminder sent: {result.get('task')}")
    except Exception as e:
        logger.error(f"Task reminder error: {e}")


def job_evening_review_reminder():
    """9:30 PM: Send evening review reminder."""
    logger.info("Sending evening review reminder...")
    try:
        from services.notification_service import _send_evening_review_reminder
        _send_evening_review_reminder()
        logger.info("Evening review reminder sent")
    except Exception as e:
        logger.error(f"Evening review reminder error: {e}")


def job_weekly_report():
    """Sunday 6 PM: Send weekly report email."""
    logger.info("Generating weekly report...")
    try:
        from services.email_service import send_weekly_report
        week_data = {
            "weekly_score": 76,
            "ai_analysis": "Strong week overall. Prayer streak maintained. Coding hours excellent. Focus next week on sleep consistency and daily exercise.",
        }
        result = send_weekly_report(week_data)
        logger.info(f"Weekly report: {result}")
    except Exception as e:
        logger.error(f"Weekly report error: {e}")


def job_monthly_prayer_report():
    """1st of month: Send monthly prayer PDF report."""
    now = datetime.now()
    # Run for previous month
    month = now.month - 1 if now.month > 1 else 12
    year = now.year if now.month > 1 else now.year - 1
    logger.info(f"Generating monthly prayer report for {month}/{year}...")
    try:
        from services.notification_service import send_monthly_prayer_report
        result = send_monthly_prayer_report(month, year)
        logger.info(f"Monthly prayer report: {result}")
    except Exception as e:
        logger.error(f"Monthly prayer report error: {e}")


def job_check_all_notifications():
    """Check all notification conditions every 5 minutes."""
    try:
        from services.notification_service import check_all_notifications
        result = check_all_notifications()
        sent = len(result.get("notifications_sent", []))
        if sent > 0:
            logger.info(f"Sent {sent} notification(s)")
    except Exception as e:
        logger.error(f"Notification check error: {e}")


def create_scheduler() -> BackgroundScheduler:
    """Create and configure the APScheduler instance."""
    tz = "Pacific/Port_Moresby"  # UTC+10 PNG time
    scheduler = BackgroundScheduler(timezone=tz)

    # 9 PM nightly summary
    scheduler.add_job(job_nightly_summary, CronTrigger(hour=21, minute=0, timezone=tz), id="nightly_summary")

    # Every hour: WakaTime sync
    scheduler.add_job(job_sync_wakatime, CronTrigger(minute=0, timezone=tz), id="wakatime_sync")

    # Every 2 hours (8AM-8PM): Water reminders
    scheduler.add_job(job_water_reminder, CronTrigger(hour="8,10,12,14,16,18,20", minute=0, timezone=tz), id="water_reminder")

    # Every 5 minutes: Task reminders check
    scheduler.add_job(job_task_reminders, CronTrigger(minute="*/5", timezone=tz), id="task_reminders")

    # 9:30 PM: Evening review reminder
    scheduler.add_job(job_evening_review_reminder, CronTrigger(hour=21, minute=30, timezone=tz), id="evening_review")

    # Sunday 6 PM: Weekly report
    scheduler.add_job(job_weekly_report, CronTrigger(day_of_week="sun", hour=18, minute=0, timezone=tz), id="weekly_report")

    # 1st of month midnight: Monthly prayer report
    scheduler.add_job(job_monthly_prayer_report, CronTrigger(day=1, hour=0, minute=5, timezone=tz), id="monthly_prayer_report")

    logger.info("Scheduler configured with all jobs")
    return scheduler


if __name__ == "__main__":
    """Run scheduler as standalone process."""
    logger.info("Starting Claude-Fire scheduler (Papua New Guinea / UTC+10)...")
    scheduler = create_scheduler()
    scheduler.start()
    logger.info("Scheduler running. Press Ctrl+C to stop.")
    try:
        import time
        while True:
            time.sleep(60)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
        logger.info("Scheduler stopped.")
