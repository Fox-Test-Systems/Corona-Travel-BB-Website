---
name: nextjs-framework
description: "Next.js 14+ App Router patterns for the Cyclones baseball website. Use when: creating new pages, setting up routing, building API routes, configuring middleware, optimizing images/SEO, or deploying to Vercel. Covers App Router conventions, server/client components, API route handlers, and deployment."
argument-hint: "Describe the Next.js page, route, or feature to build"
---

# Next.js Framework — Cyclones Website

## Framework Version

- **Next.js 14+** with App Router (not Pages Router)
- **React 18+** with Server Components by default
- **Node.js 18+** runtime

## Project Initialization

```bash
npx create-next-app@latest cyclones-website --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

## App Router Conventions

### File-based Routing

| File | Purpose |
|------|---------|
| `page.tsx` | Route UI — makes the route publicly accessible |
| `layout.tsx` | Shared UI wrapper — persists across child routes |
| `loading.tsx` | Loading UI (React Suspense boundary) |
| `error.tsx` | Error UI boundary |
| `not-found.tsx` | 404 UI |
| `route.ts` | API endpoint (inside `api/` or any route folder) |

### Cyclones Route Map

```
src/app/
├── layout.tsx            # Root layout: <html>, <body>, Navbar, Footer
├── page.tsx              # Homepage
├── teams/
│   └── page.tsx          # Roster page
├── schedule/
│   ├── page.tsx          # Public calendar view
│   └── edit/
│       └── page.tsx      # Coach-only schedule editor
├── tryouts/
│   └── page.tsx          # Tryout registration form
├── about/
│   └── page.tsx          # About the program
├── contact/
│   └── page.tsx          # Contact form
└── api/
    ├── schedule/
    │   └── route.ts      # CRUD for schedule events
    ├── tryouts/
    │   └── route.ts      # POST tryout registrations
    └── contact/
        └── route.ts      # POST contact messages
```

## Server vs Client Components

### Default: Server Components
All components in the App Router are **Server Components** by default. Use for:
- Fetching data from Supabase
- Rendering static content (About, Teams roster)
- SEO-critical content

### Client Components (`"use client"`)
Add the `"use client"` directive at the top of files that need:
- Event handlers (`onClick`, `onChange`, `onSubmit`)
- React hooks (`useState`, `useEffect`, `useRef`)
- Browser APIs
- Interactive UI (calendar, forms, mobile nav toggle)

```tsx
// Server Component (default) — Teams page
import { createClient } from '@/lib/supabase-server';

export default async function TeamsPage() {
  const supabase = createClient();
  const { data: players } = await supabase.from('players').select('*');

  return <RosterGrid players={players ?? []} />;
}
```

```tsx
// Client Component — Interactive calendar
"use client";

import { useState } from 'react';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // ...interactive calendar logic
}
```

## API Route Handlers

API routes use the Web Request/Response API:

```ts
// src/app/api/schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET — Fetch all events (public)
export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — Create event (coach auth required)
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { data, error } = await supabase.from('events').insert(body);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
```

## Root Layout Pattern

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Cyclones U9 Travel Baseball',
  description: 'Official website of the Cyclones U9 travel baseball team. Tryouts, schedules, roster, and more.',
  keywords: ['travel baseball', 'U9', 'Cyclones', 'youth baseball'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

## Middleware (Coach Auth Protection)

```ts
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  // Only protect /schedule/edit routes
  if (request.nextUrl.pathname.startsWith('/schedule/edit')) {
    const supabase = createMiddlewareClient({ req: request, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/schedule/edit/:path*'],
};
```

## Image Optimization

Use Next.js `<Image>` component for all images:

```tsx
import Image from 'next/image';

<Image
  src="/images/hero-baseball.jpg"
  alt="Cyclones U9 in action"
  width={1920}
  height={1080}
  priority  // For above-the-fold images
  className="object-cover"
/>
```

## SEO Best Practices

Each page should export metadata:

```tsx
// src/app/tryouts/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tryouts | Cyclones U9 Travel Baseball',
  description: 'Register for Cyclones U9 travel baseball tryouts. Open to all players.',
};
```

## Deployment to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
4. Deploy — Vercel auto-detects Next.js

## Key Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```
