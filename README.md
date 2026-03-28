# Claude-Fire Personal Discipline Dashboard

**User:** Waqa | **Location:** Fiji | **Currency:** FJD ($)

A comprehensive personal discipline and life-tracking application built to help Waqa stay disciplined across spiritual life, work, health, finance, music, and mission — all from a mobile-first dashboard.

---

## Overview

### Two Missions

1. **Antigravity Research** — cutting-edge physics research (tracked as research hours, notes, papers)
2. **Kingdom Expansion** — evangelism and discipleship in Fiji and beyond (souls counter, church activities, discipleship)

### Disciplines Tracked

| Area | What's Tracked |
|------|----------------|
| **Prayer** | Daily sessions, streak, themes, voice transcripts, AI summaries |
| **Family Devotion** | Participants, passage studied, streak |
| **Music** | Bass guitar practice, milestones, technique focus |
| **Diary / OCR** | Handwritten diary → OCR → AI summary → Tasks → Google Calendar |
| **Tasks** | Planned vs actual execution, delay tracking, score |
| **Health** | Sleep, water (2.5L goal), meals, steps, weight |
| **Finance** | Westpac + M-Paisa balances, spending in PGK |
| **Coding** | WakaTime integration, project/language breakdown |
| **Evening Review** | 9:30 PM daily reflection with AI insights |
| **Analytics** | Weekly/monthly charts (Recharts) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS + Recharts |
| Backend | Flask (Python) |
| Database | Supabase (PostgreSQL) |
| AI | Ollama + LangChain (local, offline-capable) |
| Email | Gmail SMTP / SendGrid |
| OCR | Google Cloud Vision API + Tesseract fallback |
| Calendar | Google Calendar API |
| Coding stats | WakaTime API |
| Scheduler | APScheduler (Python) |

---

## Project Structure

```
Claude-Fire/
├── README.md
├── frontend/                    # Next.js 15 app
│   ├── app/
│   │   ├── layout.tsx           # Dark sidebar layout
│   │   ├── page.tsx             # Main dashboard
│   │   ├── prayer/page.tsx
│   │   ├── music/page.tsx
│   │   ├── diary/page.tsx
│   │   ├── tasks/page.tsx
│   │   ├── health/page.tsx
│   │   ├── finance/page.tsx
│   │   ├── mission/page.tsx
│   │   ├── review/page.tsx
│   │   └── analytics/page.tsx
│   ├── components/
│   │   ├── dashboard/           # DailyPieChart, TodayPanel, panels...
│   │   ├── layout/              # Sidebar, TopBar
│   │   ├── prayer/              # PrayerTimer
│   │   ├── music/               # MusicLogger
│   │   ├── diary/               # DiaryCamera (OCR)
│   │   ├── tasks/               # TaskList, ExecutionScore
│   │   ├── health/              # WaterTracker
│   │   └── review/              # EveningReview
│   ├── lib/
│   │   ├── api.ts               # All API calls (axios)
│   │   └── types.ts             # TypeScript types
│   └── .env.local               # Frontend env vars
│
└── backend/                     # Flask app
    ├── app.py                   # Main Flask app + all routes
    ├── schema.sql               # Supabase PostgreSQL schema
    ├── scheduler.py             # APScheduler background jobs
    ├── requirements.txt
    ├── .env                     # Your real env vars (not committed)
    ├── .env.example             # Template with instructions
    └── services/
        ├── ocr_service.py       # Google Vision + Tesseract OCR
        ├── calendar_service.py  # Google Calendar API
        ├── email_service.py     # SendGrid / Gmail SMTP
        ├── ollama_service.py    # Local Ollama AI
        ├── wakatime_service.py  # WakaTime coding stats
        └── notification_service.py  # All notification checks
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Git
- Tesseract OCR (for local OCR fallback)

### Step 1: Clone / Open the Project

```bash
cd C:\Users\Waqa\Claude-Fire
```

### Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In your Supabase project, go to **SQL Editor**
3. Copy and paste the contents of `backend/schema.sql`
4. Click **Run** — this creates all tables and inserts default categories
5. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret!)

### Step 3: Configure Backend

```bash
cd backend
cp .env.example .env
# Edit .env and fill in your real values (see "API Keys" section below)
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

**For Tesseract OCR (Windows):**
1. Download installer from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install to `C:\Program Files\Tesseract-OCR\`
3. Add to PATH or set in code: `pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'`

### Step 4: Configure Frontend

```bash
cd frontend
# Edit .env.local with your Supabase URL and anon key
```

Install Node dependencies (if not already done):

```bash
npm install
```

### Step 5: Install and Start Ollama (local AI)

1. Download from [ollama.ai](https://ollama.ai)
2. Install and run:
```bash
ollama pull llama3.2
ollama serve
```

---

## Running the App

### Run Frontend (Next.js)

```bash
cd C:\Users\Waqa\Claude-Fire\frontend
npm run dev
```

App will be available at: **http://localhost:3000**

### Run Backend (Flask)

```bash
cd C:\Users\Waqa\Claude-Fire\backend
python app.py
```

API will be available at: **http://localhost:5000**

### Run Scheduler (background jobs)

```bash
cd C:\Users\Waqa\Claude-Fire\backend
python scheduler.py
```

This runs:
- 9 PM nightly: Daily summary email
- Every hour: WakaTime sync
- Every 2 hours (8AM–8PM): Water reminders
- Every 5 minutes: Task transition reminders
- 9:30 PM: Evening review reminder
- Sunday 6 PM: Weekly report email
- 1st of month: Monthly prayer report

---

## API Keys — Where to Get Them

### Supabase
- URL: [supabase.com](https://supabase.com) → Your Project → Settings → API → Project URL
- Keys: Same page → Project API keys

### Google APIs (Calendar + Vision)
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project: "Claude-Fire"
3. Enable these APIs:
   - Google Calendar API
   - Cloud Vision API (for OCR)
4. Go to **Credentials → Create OAuth 2.0 Client ID** (Desktop app)
5. Download credentials, copy client ID and secret

### Gmail App Password (for email alerts)
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Security → 2-Step Verification (must be ON)
3. Scroll to bottom → App passwords
4. Generate password for "Mail" → Copy the 16-character password

### WakaTime
1. Go to [wakatime.com/settings/account](https://wakatime.com/settings/account)
2. Copy your API Key
3. Install WakaTime plugin in VS Code, IntelliJ, etc.

### SendGrid (optional, alternative to Gmail)
1. Go to [app.sendgrid.com](https://app.sendgrid.com)
2. Settings → API Keys → Create API Key (Full Access)

---

## Features in Detail

### 24-Hour Pie Chart
The dashboard center shows how all 24 hours of the day are distributed across categories. Switch between pie view and bar view. Colors match the categories table. Hover for exact minutes and percentage.

### Execution Score
Each task is scored: on-time = full points, partial = half, skipped = 0, late = reduced. The daily score (0–100) shows how well the planned schedule was followed. Sunday evening reports go out automatically.

### Prayer Timer
Start/stop timer for prayer sessions. Select themes (wisdom, family, nation, healing, vision). Optional voice recording. Streak tracked automatically.

### Diary OCR → Calendar
Photograph a handwritten diary page. Google Vision API (or Tesseract fallback) extracts text. Ollama AI summarizes and detects task items. One tap to push tasks to Google Calendar.

### Water Tracker
Visual water bottle fills as you log. 2.5L daily goal. Reminders sent every 2 hours between 8AM and 8PM if goal not reached.

### Finance (FJD)
Tracks Westpac bank balance, M-Paisa mobile wallet, and cash spending in Fiji Dollars ($). Monthly savings rate calculated automatically.

---

## Timezone

All times are in **UTC+12 (Pacific/Fiji)** — Fiji Standard Time. No daylight saving time in Fiji.

---

## Development Notes

- All API routes return **mock data** when Supabase/WakaTime are not configured — the full UI renders immediately
- Ollama is optional — if not running, the app uses pre-written mock AI insights
- Camera OCR requires HTTPS in production (for mobile camera access)
- Mobile-first design — primary device is a phone

---

## Support

Built by Claude for Waqa, Fiji.
"Seek first His kingdom, and all these things shall be added to you." — Matthew 6:33
