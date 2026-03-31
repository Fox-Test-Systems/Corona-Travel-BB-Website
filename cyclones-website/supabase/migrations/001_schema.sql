-- =====================================================
-- Cyclones U9 Baseball — Supabase Database Schema
-- Run this in the Supabase SQL Editor (supabase.com)
-- Project: cyclones-website
-- =====================================================

-- ─────────────────────────────────────────
-- 1. PLAYERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS players (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  position      TEXT NOT NULL,
  jersey_number INTEGER NOT NULL,
  photo_url     TEXT,
  bat_hand      TEXT CHECK (bat_hand IN ('L', 'R', 'S')) DEFAULT 'R',
  throw_hand    TEXT CHECK (throw_hand IN ('L', 'R')) DEFAULT 'R',
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players are viewable by everyone" ON players FOR SELECT USING (true);

-- ─────────────────────────────────────────
-- 2. EVENTS (Schedule)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT NOT NULL,
  event_type    TEXT CHECK (event_type IN ('game','practice','tournament','tryout','other')) NOT NULL,
  event_date    DATE NOT NULL,
  start_time    TIME NOT NULL,
  end_time      TIME,
  location      TEXT NOT NULL,
  opponent      TEXT,
  description   TEXT,
  is_home_game  BOOLEAN DEFAULT false,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT USING (true);

-- ─────────────────────────────────────────
-- 3. TRYOUT REGISTRATIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tryout_registrations (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name       TEXT NOT NULL,
  date_of_birth     DATE NOT NULL,
  parent_name       TEXT NOT NULL,
  parent_email      TEXT NOT NULL,
  parent_phone      TEXT NOT NULL,
  positions_played  TEXT[] NOT NULL,
  experience_level  TEXT CHECK (experience_level IN ('beginner','intermediate','advanced')) NOT NULL,
  previous_teams    TEXT,
  medical_notes     TEXT,
  how_heard_about_us TEXT,
  status            TEXT CHECK (status IN ('pending','reviewed','accepted','declined')) DEFAULT 'pending',
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tryout_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a tryout" ON tryout_registrations FOR INSERT WITH CHECK (true);

-- ─────────────────────────────────────────
-- 4. CONTACT MESSAGES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a contact message" ON contact_messages FOR INSERT WITH CHECK (true);

-- ─────────────────────────────────────────
-- 5. PLAYER PORTAL — ACCOUNTS
--    Links a Supabase auth user to a player
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS player_accounts (
  id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  player_id       UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  parent_name     TEXT NOT NULL,
  parent_email    TEXT NOT NULL,
  notify_on_note  BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE player_accounts ENABLE ROW LEVEL SECURITY;
-- Parent can read their own account
CREATE POLICY "Users can read their own player account"
  ON player_accounts FOR SELECT USING (auth.uid() = id);

-- ─────────────────────────────────────────
-- 6. PLAYER PORTAL — COACH NOTES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coach_notes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id  UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  content    TEXT NOT NULL,
  coach_name TEXT NOT NULL,
  note_type  TEXT CHECK (note_type IN ('note','focus','praise','reminder')) DEFAULT 'note',
  is_focus   BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE coach_notes ENABLE ROW LEVEL SECURITY;
-- Player/parent can only read notes for their player
CREATE POLICY "Players can read their own notes"
  ON coach_notes FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM player_accounts
      WHERE player_accounts.player_id = coach_notes.player_id
        AND player_accounts.id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- 7. PLAYER PORTAL — GOALS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS player_goals (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id       UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  description     TEXT NOT NULL,
  acknowledged    BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  is_complete     BOOLEAN DEFAULT false,
  due_date        DATE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE player_goals ENABLE ROW LEVEL SECURITY;
-- Read own goals
CREATE POLICY "Players can read their own goals"
  ON player_goals FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM player_accounts
      WHERE player_accounts.player_id = player_goals.player_id
        AND player_accounts.id = auth.uid()
    )
  );
-- Players/parents can acknowledge goals (UPDATE)
CREATE POLICY "Players can acknowledge their own goals"
  ON player_goals FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM player_accounts
      WHERE player_accounts.player_id = player_goals.player_id
        AND player_accounts.id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- 8. PLAYER PORTAL — WORKOUT PLANS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workout_plans (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id  UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  week_of    DATE NOT NULL,   -- Monday of the week
  title      TEXT NOT NULL DEFAULT 'Weekly Workout Plan',
  days       JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (player_id, week_of)
);

ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
-- Read own workout plans
CREATE POLICY "Players can read their own workout plans"
  ON workout_plans FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM player_accounts
      WHERE player_accounts.player_id = workout_plans.player_id
        AND player_accounts.id = auth.uid()
    )
  );

-- =====================================================
-- SEED DATA — Insert the 12 mock players
-- (copy IDs from this output to use in player portal)
-- =====================================================
INSERT INTO players (name, position, jersey_number, bat_hand, throw_hand, is_active) VALUES
  ('Ethan Rivera',     'Pitcher',      7,  'R', 'R', true),
  ('Liam Johnson',     'Catcher',      12, 'R', 'R', true),
  ('Noah Martinez',    'First Base',   23, 'L', 'L', true),
  ('Mason Williams',   'Second Base',  4,  'R', 'R', true),
  ('Lucas Brown',      'Shortstop',    2,  'S', 'R', true),
  ('Jack Davis',       'Third Base',   15, 'R', 'R', true),
  ('Aiden Wilson',     'Left Field',   9,  'L', 'L', true),
  ('Henry Anderson',   'Center Field', 1,  'R', 'R', true),
  ('Owen Thomas',      'Right Field',  22, 'R', 'R', true),
  ('Elijah Jackson',   'Pitcher',      11, 'L', 'L', true),
  ('James White',      'Utility',      5,  'R', 'R', true),
  ('Benjamin Harris',  'Utility',      8,  'R', 'R', true);

-- =====================================================
-- COACH SETUP INSTRUCTIONS
-- =====================================================
-- To create a coach account:
--   1. Go to Supabase Dashboard → Authentication → Users → Add User
--   2. Enter the coach's email and password
--   3. After creation, click the user → Edit raw_user_meta_data to:
--      { "role": "coach", "name": "Coach Mike Thompson" }
--      (replace with the actual coach name)
-- =====================================================
