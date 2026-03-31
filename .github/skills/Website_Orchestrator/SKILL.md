---
name: Website_Orchestrator
description: "Master orchestrator for building the Cyclones U9 Travel Baseball team website. Use when: starting a new page, planning site architecture, coordinating across frontend/backend/styling, or needing guidance on which skill to invoke next. Covers project setup, page creation workflow, deployment, and cross-cutting concerns."
argument-hint: "Describe what part of the Cyclones website you want to build or plan"
---

# Website Orchestrator — Cyclones U9 Travel Baseball

## Project Overview

**Team**: Cyclones  
**Age Group**: U9  
**Brand Colors**: Bright green (`#00FF66`) background/accents, Yellow (`#FFD700`) wording/text highlights  
**Dark accent**: Black (`#1A1A2E`) for contrast and readability  

## Site Pages

| Page | Route | Description | Auth Required |
|------|-------|-------------|---------------|
| Homepage | `/` | Hero video/image, upcoming events, commitment highlights, CTA buttons | No |
| Teams | `/teams` | U9 roster with player photos, positions, jersey numbers | No |
| Schedule/Calendar | `/schedule` | Interactive calendar — players/parents VIEW, coaches EDIT | Coach edit only |
| Tryout Registration | `/tryouts` | Online registration form with player info, parent contact, medical | No |
| About | `/about` | Program philosophy, coach bios, alumni success stories | No |
| Contact | `/contact` | Contact form + social media links + location map | No |

## Tech Stack

| Layer | Technology | Skill Reference |
|-------|-----------|-----------------|
| Language | TypeScript | [typescript-patterns](../typescript-patterns/SKILL.md) |
| Framework | Next.js 14+ (App Router) | [nextjs-framework](../nextjs-framework/SKILL.md) |
| UI Components | React 18+ | [react-components](../react-components/SKILL.md) |
| Styling | Tailwind CSS v3+ | [tailwind-styling](../tailwind-styling/SKILL.md) |
| Database + Auth | Supabase (Postgres + Auth) | [supabase-backend](../supabase-backend/SKILL.md) |
| Forms | React Hook Form + Zod | [forms-validation](../forms-validation/SKILL.md) |
| Deployment | Vercel | Included in nextjs-framework |

## Project Structure

```
cyclones-website/
├── .github/skills/              # AI Agent Skills
├── public/
│   ├── images/                  # Team photos, logo, hero images
│   └── fonts/                   # Custom fonts if any
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── layout.tsx           # Root layout (nav + footer)
│   │   ├── page.tsx             # Homepage
│   │   ├── teams/page.tsx       # Teams/Roster page
│   │   ├── schedule/page.tsx    # Schedule calendar (public view)
│   │   ├── schedule/edit/page.tsx # Schedule editor (coach auth)
│   │   ├── tryouts/page.tsx     # Tryout registration form
│   │   ├── about/page.tsx       # About the program
│   │   ├── contact/page.tsx     # Contact form
│   │   └── api/                 # API routes
│   │       ├── schedule/route.ts
│   │       ├── tryouts/route.ts
│   │       └── contact/route.ts
│   ├── components/              # Reusable React components
│   │   ├── layout/              # Navbar, Footer, Hero
│   │   ├── ui/                  # Buttons, Cards, Inputs
│   │   ├── schedule/            # Calendar, EventCard
│   │   ├── roster/              # PlayerCard, RosterGrid
│   │   └── forms/               # TryoutForm, ContactForm
│   ├── lib/                     # Utilities and configs
│   │   ├── supabase.ts          # Supabase client config
│   │   ├── types.ts             # Shared TypeScript types
│   │   └── utils.ts             # Helper functions
│   └── styles/
│       └── globals.css          # Tailwind base + custom styles
├── tailwind.config.ts           # Tailwind config with Cyclones theme
├── next.config.js               # Next.js configuration
├── tsconfig.json                # TypeScript config
├── package.json
└── .env.local                   # Supabase keys (never commit)
```

## Build Workflow — Page by Page

Follow this order when building each page:

### Step 1: Project Setup
1. Initialize Next.js project with TypeScript and Tailwind
2. Configure Tailwind with Cyclones brand colors
3. Set up Supabase project and environment variables
4. Create root layout with Navbar and Footer

### Step 2: Homepage (`/`)
1. **Skill**: `react-components` — Build Hero section with action imagery
2. **Skill**: `tailwind-styling` — Apply Cyclones green/yellow theme
3. Add upcoming events preview (pulls from schedule)
4. Add CTA buttons: "Register for Tryouts", "View Schedule"

### Step 3: Teams Page (`/teams`)
1. **Skill**: `react-components` — Build PlayerCard and RosterGrid
2. **Skill**: `supabase-backend` — Create `players` table, fetch roster data
3. Display player cards with photo, name, position, jersey number

### Step 4: Schedule/Calendar (`/schedule`)
1. **Skill**: `react-components` — Build calendar view component
2. **Skill**: `supabase-backend` — Create `events` table, set up Row Level Security
3. **Skill**: `supabase-backend` — Coach authentication for edit mode
4. Public view: read-only calendar with game/practice details
5. Coach view (`/schedule/edit`): add/edit/delete events (protected route)

### Step 5: Tryout Registration (`/tryouts`)
1. **Skill**: `forms-validation` — Build multi-field registration form
2. **Skill**: `supabase-backend` — Create `registrations` table, store submissions
3. Fields: player name, DOB, parent contact, experience level, medical notes
4. Email notification to coaches on new registration

### Step 6: About Page (`/about`)
1. **Skill**: `react-components` — Coach bio cards, program philosophy section
2. Static content with compelling copy and imagery

### Step 7: Contact Page (`/contact`)
1. **Skill**: `forms-validation` — Contact form with name, email, message
2. **Skill**: `supabase-backend` — Store messages or send via email API

### Step 8: Polish & Deploy
1. **Skill**: `tailwind-styling` — Responsive design audit, mobile optimization
2. **Skill**: `nextjs-framework` — SEO metadata, image optimization, performance
3. Deploy to Vercel

## Invoking Skills

When building any part of the site, load the relevant skill(s) first:

- **Starting a new page?** → Load `nextjs-framework` for routing + `react-components` for UI
- **Styling anything?** → Load `tailwind-styling` for Cyclones brand consistency
- **Adding data persistence?** → Load `supabase-backend` for DB + auth
- **Building a form?** → Load `forms-validation` for React Hook Form + Zod patterns
- **TypeScript questions?** → Load `typescript-patterns` for types and interfaces

## Key Design Principles

1. **Mobile-first**: 70%+ of parents browse on phones — design for mobile first
2. **Fast load times**: Use Next.js Image optimization, lazy loading, static generation where possible
3. **Brand consistency**: Every page uses the Cyclones green/yellow/black palette
4. **Clear CTAs**: "Register for Tryouts" and "View Schedule" always accessible
5. **Coach-friendly**: Schedule editing must be simple and intuitive
6. **Parent-friendly**: Info is easy to find — no more than 2 clicks to any content
