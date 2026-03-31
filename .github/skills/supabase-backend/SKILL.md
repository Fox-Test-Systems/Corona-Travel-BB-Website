---
name: supabase-backend
description: "Supabase backend patterns for the Cyclones baseball website. Use when: setting up the database, creating tables (players, events, registrations, contacts), configuring Row Level Security, implementing coach authentication, building API queries, or managing real-time subscriptions. Covers Supabase client setup, SQL schemas, RLS policies, and auth flows."
argument-hint: "Describe the database table, auth flow, or query to implement"
---

# Supabase Backend — Cyclones Website

## Overview

Supabase provides:
- **PostgreSQL database** — structured data for players, events, registrations
- **Authentication** — coach login for schedule editing
- **Row Level Security (RLS)** — public read, coach-only write
- **Real-time** — optional live updates for schedule changes
- **Storage** — player photos and team images

## Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy the project URL and anon key

### 2. Environment Variables

```env
# .env.local (never commit this file)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### 4. Client Configuration

```ts
// src/lib/supabase.ts — Browser client (Client Components)
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```ts
// src/lib/supabase-server.ts — Server client (Server Components & API routes)
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
}
```

## Database Schema

Run these SQL statements in the Supabase SQL Editor:

### Players Table

```sql
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  jersey_number INTEGER NOT NULL,
  photo_url TEXT,
  bat_hand TEXT CHECK (bat_hand IN ('L', 'R', 'S')) DEFAULT 'R',
  throw_hand TEXT CHECK (throw_hand IN ('L', 'R')) DEFAULT 'R',
  grad_year INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Public read access
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players are viewable by everyone"
  ON players FOR SELECT USING (true);
CREATE POLICY "Coaches can manage players"
  ON players FOR ALL USING (auth.role() = 'authenticated');
```

### Events Table (Schedule)

```sql
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  event_type TEXT CHECK (event_type IN ('game', 'practice', 'tournament', 'tryout', 'other')) NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location TEXT NOT NULL,
  opponent TEXT,
  description TEXT,
  is_home_game BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Public can view, only authenticated coaches can edit
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT USING (true);
CREATE POLICY "Coaches can insert events"
  ON events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Coaches can update events"
  ON events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Coaches can delete events"
  ON events FOR DELETE USING (auth.role() = 'authenticated');
```

### Tryout Registrations Table

```sql
CREATE TABLE tryout_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  positions_played TEXT[] NOT NULL,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
  previous_teams TEXT,
  medical_notes TEXT,
  how_heard_about_us TEXT,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Anyone can submit, only coaches can view
ALTER TABLE tryout_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a tryout registration"
  ON tryout_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Coaches can view registrations"
  ON tryout_registrations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Coaches can update registration status"
  ON tryout_registrations FOR UPDATE USING (auth.role() = 'authenticated');
```

### Contact Messages Table

```sql
CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Anyone can submit, only coaches can view
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a contact message"
  ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Coaches can view messages"
  ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Coaches can mark messages as read"
  ON contact_messages FOR UPDATE USING (auth.role() = 'authenticated');
```

### Coaches Table

```sql
CREATE TABLE coaches (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  email TEXT NOT NULL,
  years_experience INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coaches are viewable by everyone"
  ON coaches FOR SELECT USING (true);
CREATE POLICY "Coaches can update their own profile"
  ON coaches FOR UPDATE USING (auth.uid() = id);
```

## Authentication — Coach Login

### Login Page

```tsx
// src/app/login/page.tsx
"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/schedule/edit');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="card p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-display text-cyclone-yellow text-center">Coach Login</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-cyclone-green outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-cyclone-green outline-none"
          required
        />
        <button type="submit" className="btn-primary w-full">Sign In</button>
      </form>
    </div>
  );
}
```

### Creating Coach Accounts

Create coach accounts via Supabase Dashboard → Authentication → Users → Add User. Do NOT allow public signup — coaches are manually provisioned.

## Common Queries

### Fetch Active Roster
```ts
const { data: players } = await supabase
  .from('players')
  .select('*')
  .eq('is_active', true)
  .order('jersey_number', { ascending: true });
```

### Fetch Upcoming Events
```ts
const today = new Date().toISOString().split('T')[0];
const { data: events } = await supabase
  .from('events')
  .select('*')
  .gte('event_date', today)
  .order('event_date', { ascending: true })
  .limit(10);
```

### Submit Tryout Registration
```ts
const { error } = await supabase
  .from('tryout_registrations')
  .insert({
    player_name: data.playerName,
    date_of_birth: data.dateOfBirth,
    parent_name: data.parentName,
    parent_email: data.parentEmail,
    parent_phone: data.parentPhone,
    positions_played: data.positionsPlayed,
    experience_level: data.experienceLevel,
    previous_teams: data.previousTeams || null,
    medical_notes: data.medicalNotes || null,
    how_heard_about_us: data.howHeardAboutUs || null,
  });
```

### Insert Schedule Event (Coach Only)
```ts
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new Error('Not authenticated');

const { error } = await supabase
  .from('events')
  .insert({
    title: data.title,
    event_type: data.eventType,
    event_date: data.eventDate,
    start_time: data.startTime,
    end_time: data.endTime || null,
    location: data.location,
    opponent: data.opponent || null,
    description: data.description || null,
    is_home_game: data.isHomeGame,
    created_by: user.id,
  });
```

## Storage (Player Photos)

```ts
// Upload a player photo
const { data, error } = await supabase.storage
  .from('player-photos')
  .upload(`${playerId}.jpg`, file, {
    cacheControl: '3600',
    upsert: true,
  });

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('player-photos')
  .getPublicUrl(`${playerId}.jpg`);
```

## Security Checklist

- [x] RLS enabled on ALL tables
- [x] Public can only SELECT players and events
- [x] Public can INSERT registrations and contact messages (no SELECT)
- [x] Only authenticated users can INSERT/UPDATE/DELETE events
- [x] Service role key is NEVER exposed to the client
- [x] `.env.local` is in `.gitignore`
