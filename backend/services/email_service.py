"""
Email Service — SendGrid / smtplib fallback
Claude-Fire | Waqa | Fiji
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime


def send_email(to_email: str, subject: str, html_body: str, text_body: str = None) -> dict:
    """
    Send email via SendGrid (preferred) or Gmail SMTP fallback.
    """
    sendgrid_key = os.getenv("SENDGRID_API_KEY")
    if sendgrid_key and sendgrid_key != "your_sendgrid_api_key_here":
        return _send_via_sendgrid(to_email, subject, html_body, text_body, sendgrid_key)
    return _send_via_smtp(to_email, subject, html_body, text_body)


def _send_via_sendgrid(to_email, subject, html_body, text_body, api_key) -> dict:
    """Send via SendGrid API."""
    try:
        import sendgrid
        from sendgrid.helpers.mail import Mail, Email, To, Content

        sg = sendgrid.SendGridAPIClient(api_key=api_key)
        from_email = os.getenv("EMAIL_ADDRESS", "noreply@claude-fire.app")

        message = Mail(
            from_email=from_email,
            to_emails=to_email,
            subject=subject,
            html_content=html_body,
        )
        response = sg.send(message)
        return {"sent": True, "status_code": response.status_code, "provider": "sendgrid"}
    except Exception as e:
        return {"sent": False, "error": str(e), "provider": "sendgrid"}


def _send_via_smtp(to_email, subject, html_body, text_body) -> dict:
    """Send via Gmail SMTP."""
    email_address = os.getenv("EMAIL_ADDRESS", "")
    app_password = os.getenv("EMAIL_APP_PASSWORD", "")

    if not email_address or not app_password or app_password == "your_16_digit_app_password_here":
        print(f"[EMAIL] Mock send to {to_email}: {subject}")
        return {"sent": False, "message": "Email not configured (mock mode)", "provider": "smtp_mock"}

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = email_address
        msg["To"] = to_email

        if text_body:
            msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(email_address, app_password)
            server.sendmail(email_address, to_email, msg.as_string())

        return {"sent": True, "provider": "smtp"}
    except Exception as e:
        return {"sent": False, "error": str(e), "provider": "smtp"}


# ─── Email templates ─────────────────────────────────────────────────────────

def send_daily_summary(score: int, highlights: list, tomorrows_tasks: list) -> dict:
    """Send nightly summary email."""
    to_email = os.getenv("ALERT_EMAIL", os.getenv("EMAIL_ADDRESS", ""))
    subject = f"🔥 Claude-Fire Daily Report — Score: {score}/100"
    highlights_html = "".join(f"<li>{h}</li>" for h in highlights)
    tasks_html = "".join(f"<li>{t}</li>" for t in tomorrows_tasks)
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:24px;border-radius:12px;">
      <h1 style="color:#f59e0b;margin-bottom:4px;">Claude-Fire Dashboard</h1>
      <p style="color:#94a3b8;margin-bottom:24px;">{datetime.now().strftime('%A, %d %B %Y')} · Fiji</p>

      <div style="background:#1e293b;border-radius:8px;padding:20px;margin-bottom:16px;text-align:center;">
        <p style="margin:0;color:#94a3b8;">Today's Execution Score</p>
        <h2 style="font-size:48px;margin:8px 0;color:{'#22c55e' if score >= 80 else '#f59e0b' if score >= 60 else '#ef4444'};">{score}</h2>
        <p style="margin:0;color:#94a3b8;">out of 100</p>
      </div>

      <div style="background:#1e293b;border-radius:8px;padding:20px;margin-bottom:16px;">
        <h3 style="color:#22c55e;margin-top:0;">✅ Today's Highlights</h3>
        <ul style="color:#e2e8f0;margin:0;">{highlights_html}</ul>
      </div>

      <div style="background:#1e293b;border-radius:8px;padding:20px;">
        <h3 style="color:#60a5fa;margin-top:0;">📋 Tomorrow's Tasks</h3>
        <ul style="color:#e2e8f0;margin:0;">{tasks_html}</ul>
      </div>

      <p style="color:#475569;font-size:12px;margin-top:24px;text-align:center;">
        Claude-Fire Personal Discipline Dashboard · Waqa · Fiji
      </p>
    </div>
    """
    return send_email(to_email, subject, html)


def send_weekly_report(week_data: dict) -> dict:
    """Send Sunday weekly report email."""
    to_email = os.getenv("ALERT_EMAIL", os.getenv("EMAIL_ADDRESS", ""))
    subject = f"📊 Claude-Fire Weekly Report — Week Score: {week_data.get('weekly_score', 0)}/100"
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:24px;border-radius:12px;">
      <h1 style="color:#f59e0b;">Weekly Review</h1>
      <p style="color:#94a3b8;">{datetime.now().strftime('Week of %d %B %Y')}</p>

      <div style="background:#1e293b;border-radius:8px;padding:20px;margin-bottom:16px;text-align:center;">
        <h2 style="font-size:48px;color:#f59e0b;margin:0;">{week_data.get('weekly_score', 0)}</h2>
        <p style="color:#94a3b8;">Weekly Execution Score</p>
      </div>

      <div style="background:#1e293b;border-radius:8px;padding:20px;">
        <h3 style="color:#a78bfa;margin-top:0;">🤖 AI Analysis</h3>
        <p style="color:#e2e8f0;">{week_data.get('ai_analysis', 'No analysis available.')}</p>
      </div>

      <p style="color:#475569;font-size:12px;margin-top:24px;text-align:center;">
        Claude-Fire · Waqa · Fiji
      </p>
    </div>
    """
    return send_email(to_email, subject, html)


def send_prayer_reminder() -> dict:
    """Send prayer time reminder."""
    to_email = os.getenv("ALERT_EMAIL", os.getenv("EMAIL_ADDRESS", ""))
    subject = "🙏 Prayer Time — Claude-Fire"
    html = """
    <div style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:24px;border-radius:12px;text-align:center;">
      <h1 style="font-size:48px;margin:0;">🙏</h1>
      <h2 style="color:#f59e0b;">Time to Pray</h2>
      <p style="color:#94a3b8;">Your prayer session is scheduled. Be still and seek the Lord.</p>
      <p style="color:#64748b;font-size:12px;">Claude-Fire · Waqa</p>
    </div>
    """
    return send_email(to_email, subject, html)


def send_water_reminder(current_ml: int, goal_ml: int) -> dict:
    """Send water intake reminder."""
    to_email = os.getenv("ALERT_EMAIL", os.getenv("EMAIL_ADDRESS", ""))
    pct = int((current_ml / goal_ml) * 100)
    subject = f"💧 Water Reminder — {pct}% of goal reached"
    html = f"""
    <div style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:24px;border-radius:12px;text-align:center;">
      <h1 style="font-size:48px;margin:0;">💧</h1>
      <h2 style="color:#60a5fa;">Drink Water!</h2>
      <p style="color:#94a3b8;">You've had {current_ml}ml of {goal_ml}ml today ({pct}%)</p>
      <p style="color:#e2e8f0;">Grab a glass of water now. Stay hydrated in the Fiji heat!</p>
    </div>
    """
    return send_email(to_email, subject, html)
