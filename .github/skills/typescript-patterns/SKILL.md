---
name: typescript-patterns
description: "TypeScript types and patterns for the Cyclones baseball website. Use when: defining data models (players, events, registrations), creating API request/response types, typing component props, or setting up Supabase type generation. Covers shared types, Zod schemas, and type-safe patterns."
argument-hint: "Describe the TypeScript type, interface, or pattern needed"
---

# TypeScript Patterns — Cyclones Website

## Shared Types

All shared types live in `src/lib/types.ts`:

```ts
// src/lib/types.ts

// ============================================
// DATABASE MODELS (match Supabase table schemas)
// ============================================

export interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number: number;
  photo_url: string | null;
  bat_hand: 'L' | 'R' | 'S';  // Left, Right, Switch
  throw_hand: 'L' | 'R';
  grad_year: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  event_type: 'game' | 'practice' | 'tournament' | 'tryout' | 'other';
  event_date: string;          // ISO date string
  start_time: string;          // HH:MM format
  end_time: string | null;
  location: string;
  opponent: string | null;     // For games
  description: string | null;
  is_home_game: boolean | null;
  created_by: string;          // Coach user ID
  created_at: string;
  updated_at: string;
}

export interface TryoutRegistration {
  id: string;
  player_name: string;
  date_of_birth: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  positions_played: string[];
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  previous_teams: string | null;
  medical_notes: string | null;
  how_heard_about_us: string | null;
  status: 'pending' | 'reviewed' | 'accepted' | 'declined';
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Coach {
  id: string;
  name: string;
  title: string;           // e.g., "Head Coach", "Assistant Coach"
  bio: string | null;
  photo_url: string | null;
  email: string;
  years_experience: number | null;
}

// ============================================
// API TYPES
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================
// COMPONENT PROP TYPES
// ============================================

export interface NavLink {
  href: string;
  label: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
}

// ============================================
// FORM INPUT TYPES (before validation)
// ============================================

export interface TryoutFormInput {
  playerName: string;
  dateOfBirth: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  positionsPlayed: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  previousTeams: string;
  medicalNotes: string;
  howHeardAboutUs: string;
}

export interface ContactFormInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface EventFormInput {
  title: string;
  eventType: Event['event_type'];
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  opponent: string;
  description: string;
  isHomeGame: boolean;
}
```

## Supabase Type Generation

Generate types directly from your Supabase schema:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

Then use in the Supabase client:

```ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

## Zod Schemas (Form Validation)

Zod schemas live alongside forms for runtime validation:

```ts
// src/lib/schemas.ts
import { z } from 'zod';

export const tryoutRegistrationSchema = z.object({
  playerName: z.string().min(2, 'Player name is required'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  parentName: z.string().min(2, 'Parent name is required'),
  parentEmail: z.string().email('Invalid email address'),
  parentPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  positionsPlayed: z.array(z.string()).min(1, 'Select at least one position'),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  previousTeams: z.string().optional(),
  medicalNotes: z.string().optional(),
  howHeardAboutUs: z.string().optional(),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const eventFormSchema = z.object({
  title: z.string().min(2, 'Event title is required'),
  eventType: z.enum(['game', 'practice', 'tournament', 'tryout', 'other']),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional(),
  location: z.string().min(2, 'Location is required'),
  opponent: z.string().optional(),
  description: z.string().optional(),
  isHomeGame: z.boolean(),
});

// Infer TypeScript types from Zod schemas
export type TryoutRegistrationInput = z.infer<typeof tryoutRegistrationSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type EventFormInput = z.infer<typeof eventFormSchema>;
```

## TypeScript Configuration

```json
// tsconfig.json (generated by create-next-app, key additions)
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Type Patterns

### Server Component Data Fetching
```tsx
// Type-safe data fetching in server components
async function getPlayers(): Promise<Player[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('is_active', true)
    .order('jersey_number');

  if (error) throw new Error(error.message);
  return data ?? [];
}
```

### API Route Type Safety
```ts
// Type the request body in API routes
export async function POST(request: NextRequest) {
  const body: unknown = await request.json();
  const parsed = tryoutRegistrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // parsed.data is fully typed as TryoutRegistrationInput
  const registration = parsed.data;
  // ...proceed with type-safe data
}
```
