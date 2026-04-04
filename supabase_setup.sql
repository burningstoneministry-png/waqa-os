-- ============================================================
--  Diary Tracker – Supabase Database Setup
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Create the diary_entries table
CREATE TABLE IF NOT EXISTS diary_entries (
    id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    date       TEXT        NOT NULL UNIQUE,          -- YYYY-MM-DD
    activities JSONB       NOT NULL DEFAULT '[]',
    review     TEXT        DEFAULT '',
    saved_at   TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index for fast date lookups
CREATE INDEX IF NOT EXISTS idx_diary_entries_date ON diary_entries (date);

-- 3. Enable Row Level Security
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

-- 4. Allow full public access (anon key) – tighten later when you add auth
CREATE POLICY "Public read"   ON diary_entries FOR SELECT USING (true);
CREATE POLICY "Public insert" ON diary_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON diary_entries FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON diary_entries FOR DELETE USING (true);
