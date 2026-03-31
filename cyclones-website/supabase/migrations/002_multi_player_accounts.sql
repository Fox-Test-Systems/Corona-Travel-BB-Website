-- =====================================================
-- Migration 002 — Support duplicate parent emails
-- Run in Supabase SQL Editor AFTER 001_schema.sql
-- =====================================================
-- Goal: decouple player_accounts.id from auth.users so
-- one parent (one auth user) can link to multiple players
-- and a coach's email can also be used as a parent email.
-- =====================================================

-- Step 1: add user_id column (nullable first so UPDATE can populate it)
ALTER TABLE player_accounts
  ADD COLUMN IF NOT EXISTS user_id UUID;

-- Step 2: copy existing id values (which ARE auth user UUIDs) into user_id
UPDATE player_accounts SET user_id = id WHERE user_id IS NULL;

-- Step 3: make user_id NOT NULL and add the FK to auth.users
ALTER TABLE player_accounts
  ALTER COLUMN user_id SET NOT NULL;

-- (only add constraint if it doesn't already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'player_accounts'
      AND constraint_name = 'player_accounts_user_id_fkey'
  ) THEN
    ALTER TABLE player_accounts
      ADD CONSTRAINT player_accounts_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 4: add UNIQUE guard so one parent can't be linked to the same player twice
ALTER TABLE player_accounts
  DROP CONSTRAINT IF EXISTS unique_user_player;
ALTER TABLE player_accounts
  ADD CONSTRAINT unique_user_player UNIQUE (user_id, player_id);

-- Step 5: drop the old FK that tied id → auth.users  (so new rows can use gen_random_uuid())
ALTER TABLE player_accounts
  DROP CONSTRAINT IF EXISTS player_accounts_id_fkey;

-- Step 6: give id a proper default so the insert in the API no longer needs to supply it
ALTER TABLE player_accounts
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ─────────────────────────────────────────
-- Step 7: update all RLS policies that used  id = auth.uid()
--         to use the new  user_id = auth.uid()
-- ─────────────────────────────────────────

-- player_accounts
DROP POLICY IF EXISTS "Users can read their own player account" ON player_accounts;
CREATE POLICY "Users can read their own player account"
  ON player_accounts FOR SELECT USING (user_id = auth.uid());

-- coach_notes
DROP POLICY IF EXISTS "Players can read their own notes" ON coach_notes;
CREATE POLICY "Players can read their own notes"
  ON coach_notes FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM player_accounts
      WHERE player_accounts.player_id = coach_notes.player_id
        AND player_accounts.user_id = auth.uid()
    )
  );

-- player_goals (read)
DROP POLICY IF EXISTS "Players can read their own goals" ON player_goals;
CREATE POLICY "Players can read their own goals"
  ON player_goals FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM player_accounts
      WHERE player_accounts.player_id = player_goals.player_id
        AND player_accounts.user_id = auth.uid()
    )
  );

-- player_goals (acknowledge / update)
DROP POLICY IF EXISTS "Players can acknowledge their own goals" ON player_goals;
CREATE POLICY "Players can acknowledge their own goals"
  ON player_goals FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM player_accounts
      WHERE player_accounts.player_id = player_goals.player_id
        AND player_accounts.user_id = auth.uid()
    )
  );

-- workout_plans
DROP POLICY IF EXISTS "Players can read their own workout plans" ON workout_plans;
CREATE POLICY "Players can read their own workout plans"
  ON workout_plans FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM player_accounts
      WHERE player_accounts.player_id = workout_plans.player_id
        AND player_accounts.user_id = auth.uid()
    )
  );
