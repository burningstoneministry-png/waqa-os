-- ============================================================
-- WAQA PERSONAL DISCIPLINE DASHBOARD — SUPABASE SCHEMA
-- Fiji | Claude-Fire Project
-- ============================================================

-- ACTIVITIES CATEGORIES (reference table)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT,
  goal_minutes_per_day INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DAILY ACTIVITY LOGS (core table - tracks every 24hr slice)
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id),
  date DATE NOT NULL,
  planned_start TIME,
  planned_end TIME,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  duration_minutes INTEGER,
  status TEXT CHECK (status IN ('completed', 'partial', 'skipped', 'in_progress', 'pending')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRAYER LOGS
CREATE TABLE prayer_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  themes TEXT[], -- array of tags: healing, wisdom, family, nation, vision
  voice_transcript TEXT,
  ai_summary TEXT,
  type TEXT CHECK (type IN ('personal', 'family_devotion', 'church')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAMILY DEVOTION LOGS
CREATE TABLE family_devotion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  participants TEXT[],
  passage_studied TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MUSIC PRACTICE LOGS
CREATE TABLE music_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  instrument TEXT DEFAULT 'bass',
  what_practiced TEXT, -- scales, songs, technique, worship
  milestone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DIARY ENTRIES (OCR'd from photos)
CREATE TABLE diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  raw_text TEXT,
  ai_summary TEXT,
  tags TEXT[],
  image_url TEXT,
  ocr_confidence DECIMAL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASKS (from diary → Google Calendar)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_entry_id UUID REFERENCES diary_entries(id),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  planned_start TIME,
  planned_end TIME,
  category TEXT,
  google_calendar_event_id TEXT,
  google_calendar_synced BOOLEAN DEFAULT FALSE,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASK EXECUTIONS (actual vs planned)
CREATE TABLE task_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id),
  date DATE NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  planned_duration_minutes INTEGER,
  actual_duration_minutes INTEGER,
  status TEXT CHECK (status IN ('on_time', 'early', 'late', 'very_late', 'skipped', 'partial', 'completed')),
  delay_minutes INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  skip_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FINANCE TRANSACTIONS
CREATE TABLE finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  source TEXT CHECK (source IN ('mpaisa', 'westpac', 'cash', 'other')),
  type TEXT CHECK (type IN ('income', 'expense', 'transfer')),
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'FJD',
  description TEXT,
  merchant TEXT,
  category TEXT,
  raw_sms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HEALTH LOGS
CREATE TABLE health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  sleep_start TIMESTAMPTZ,
  sleep_end TIMESTAMPTZ,
  sleep_duration_minutes INTEGER,
  sleep_quality_score INTEGER, -- 0-100
  water_intake_ml INTEGER DEFAULT 0,
  weight_kg DECIMAL,
  steps INTEGER,
  calories_burned INTEGER,
  active_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEAL LOGS
CREATE TABLE meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  logged_at TIMESTAMPTZ,
  food_description TEXT,
  image_url TEXT,
  ai_detected_foods TEXT[],
  estimated_calories INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CODING SESSIONS (from WakaTime)
CREATE TABLE coding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  project TEXT,
  language TEXT,
  duration_minutes INTEGER,
  source TEXT DEFAULT 'wakatime',
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENING REVIEWS (9:30PM)
CREATE TABLE evening_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  execution_score INTEGER, -- 0-100
  went_well TEXT,
  improve_tomorrow TEXT,
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  diary_image_url TEXT,
  ai_insights TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS LOG
CREATE TABLE notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT, -- prayer_alert, task_reminder, water_reminder, etc
  channel TEXT CHECK (channel IN ('email', 'push', 'toast')),
  message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened BOOLEAN DEFAULT FALSE
);

-- VISION MISSION TRACKER
CREATE TABLE mission_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar TEXT CHECK (pillar IN ('antigravity', 'kingdom')),
  date DATE NOT NULL,
  activity TEXT,
  milestone TEXT,
  souls_reached INTEGER DEFAULT 0,
  research_hours DECIMAL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- XP GAMIFICATION SYSTEM (NEW)
-- ============================================================

-- XP LOGS (tracks XP earned daily)
CREATE TABLE xp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  daily_total INTEGER DEFAULT 0,
  prayer_xp INTEGER DEFAULT 0,
  bible_study_xp INTEGER DEFAULT 0,
  water_intake_xp INTEGER DEFAULT 0,
  training_xp INTEGER DEFAULT 0,
  research_xp INTEGER DEFAULT 0,
  coding_xp INTEGER DEFAULT 0,
  bass_practice_xp INTEGER DEFAULT 0,
  fasting_xp INTEGER DEFAULT 0,
  mentoring_xp INTEGER DEFAULT 0,
  consistency_bonus INTEGER DEFAULT 0, -- 7-day streak bonus
  all_habits_bonus INTEGER DEFAULT 0,  -- monthly all-habits-hit bonus
  custom_xp INTEGER DEFAULT 0,         -- manual adjustments
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SKILL LEVELS (tracks progression in each of 6 skill trees)
CREATE TABLE skill_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_tree TEXT NOT NULL CHECK (skill_tree IN ('prayer_spirit', 'antigravity', 'kingdom_influence', 'coding_automation', 'health_discipline', 'spiritual_engineering')),
  current_level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  total_xp_earned INTEGER DEFAULT 0,
  last_level_up_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REWARD TRACKER (logs when rewards are earned/claimed)
CREATE TABLE reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  tier INTEGER CHECK (tier BETWEEN 1 AND 4), -- 1=Weekly, 2=Monthly, 3=Phase, 4=Mastery
  reward_name TEXT,
  reward_description TEXT,
  budget_fj_dollars DECIMAL,
  status TEXT CHECK (status IN ('earned', 'claimed', 'skipped')), -- earned=eligible, claimed=completed, skipped=passed
  claimed_date DATE,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REWARD PHOTOS (family celebration photos)
CREATE TABLE reward_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_claim_id UUID REFERENCES reward_claims(id),
  date DATE NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  family_notes TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PHASE MILESTONES (tracks completion of phase-specific goals)
CREATE TABLE phase_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_number INTEGER CHECK (phase_number BETWEEN 1 AND 7),
  milestone_name TEXT NOT NULL,
  category TEXT, -- 'antigravity', 'kingdom', 'coding', 'health', 'spiritual_engineering'
  completed BOOLEAN DEFAULT FALSE,
  completion_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONSISTENCY TRACKER (daily habit tracking for heat map)
CREATE TABLE consistency_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  prayer BOOLEAN DEFAULT FALSE,
  bible_study BOOLEAN DEFAULT FALSE,
  water_intake BOOLEAN DEFAULT FALSE,
  training BOOLEAN DEFAULT FALSE,
  consistency_percentage INTEGER, -- 0-100
  streak_days INTEGER DEFAULT 0,
  all_habits_hit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DEFAULT CATEGORIES INSERT
INSERT INTO categories (name, color, icon, goal_minutes_per_day) VALUES
  ('Sleep', '#1e3a5f', '🌙', 420),
  ('Prayer', '#f59e0b', '🙏', 45),
  ('Bible Study', '#7c3aed', '📖', 30),
  ('Family Devotion', '#dc2626', '❤️', 30),
  ('Church', '#b91c1c', '⛪', 120),
  ('Coding', '#16a34a', '💻', 240),
  ('Research', '#0891b2', '🔬', 60),
  ('Exercise', '#ea580c', '💪', 60),
  ('Eating', '#92400e', '🍽️', 60),
  ('Music Practice', '#9333ea', '🎸', 60),
  ('Entertainment', '#ec4899', '📱', 120),
  ('Social Media', '#f43f5e', '📲', 30),
  ('Reading', '#4f46e5', '📚', 30),
  ('Family Time', '#d97706', '👨‍👩‍👧', 60),
  ('Travel', '#6b7280', '🚗', 30),
  ('Evening Review', '#0284c7', '📝', 30),
  ('Free / Rest', '#93c5fd', '☕', 60),
  ('Untracked', '#d1d5db', '❓', 0);
