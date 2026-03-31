---
name: react-components
description: "React 18+ component patterns for the Cyclones baseball website. Use when: building UI components like Navbar, Footer, Hero, PlayerCard, RosterGrid, Calendar, EventCard, or any reusable UI element. Covers component architecture, props patterns, composition, and responsive design."
argument-hint: "Describe the React component or UI section to build"
---

# React Components — Cyclones Website

## Component Architecture

### Directory Structure

```
src/components/
├── layout/
│   ├── Navbar.tsx         # Site navigation with mobile hamburger
│   ├── Footer.tsx         # Footer with links and social icons
│   └── Hero.tsx           # Full-width hero section with CTA
├── ui/
│   ├── Button.tsx         # Reusable button (primary/secondary/outline)
│   ├── Card.tsx           # Generic card wrapper
│   ├── Badge.tsx          # Position/status badges
│   ├── SectionHeading.tsx # Consistent section titles
│   └── Container.tsx      # Max-width content wrapper
├── schedule/
│   ├── Calendar.tsx       # Monthly calendar grid
│   ├── EventCard.tsx      # Single event display
│   ├── EventList.tsx      # List view of events
│   └── EventForm.tsx      # Add/edit event (coach only)
├── roster/
│   ├── PlayerCard.tsx     # Individual player card
│   └── RosterGrid.tsx     # Grid of PlayerCards
└── forms/
    ├── TryoutForm.tsx     # Tryout registration form
    └── ContactForm.tsx    # Contact page form
```

## Component Conventions

### Naming
- PascalCase for components: `PlayerCard.tsx`
- One component per file (primary export)
- Co-locate types with component or import from `@/lib/types`

### Props Pattern
```tsx
interface PlayerCardProps {
  name: string;
  position: string;
  jerseyNumber: number;
  photoUrl?: string;
  gradYear?: number;
}

export function PlayerCard({ name, position, jerseyNumber, photoUrl, gradYear }: PlayerCardProps) {
  return (
    <div className="bg-gray-900 rounded-xl border border-cyclone-green/20 overflow-hidden hover:border-cyclone-green/50 transition-colors">
      {photoUrl ? (
        <Image src={photoUrl} alt={name} width={300} height={300} className="w-full aspect-square object-cover" />
      ) : (
        <div className="w-full aspect-square bg-gray-800 flex items-center justify-center">
          <span className="text-6xl font-bold text-cyclone-green">#{jerseyNumber}</span>
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-bold text-cyclone-yellow">{name}</h3>
        <p className="text-gray-400">{position}</p>
        <span className="inline-block mt-2 px-3 py-1 bg-cyclone-green/10 text-cyclone-green text-sm rounded-full">
          #{jerseyNumber}
        </span>
      </div>
    </div>
  );
}
```

## Key Components

### Navbar

```tsx
"use client";
import { useState } from 'react';
import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/teams', label: 'Teams' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/tryouts', label: 'Tryouts' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-950/95 backdrop-blur-sm border-b border-cyclone-green/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-cyclone-green">CYCLONES</span>
            <span className="text-sm text-cyclone-yellow">U9</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-cyclone-green transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-300 hover:text-cyclone-green"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-gray-300 hover:text-cyclone-green hover:bg-gray-900 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
```

### Hero Section

```tsx
import Image from 'next/image';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative h-[80vh] min-h-[500px] flex items-center">
      {/* Background Image */}
      <Image
        src="/images/hero-baseball.jpg"
        alt="Cyclones in action"
        fill
        priority
        className="object-cover brightness-40"
      />

      {/* Overlay Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
          <span className="text-cyclone-green">CYCLONES</span>
          <br />
          <span className="text-cyclone-yellow">U9 TRAVEL BASEBALL</span>
        </h1>
        <p className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto">
          Building champions on and off the field. Competitive youth baseball in [Your City].
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/tryouts"
            className="px-8 py-3 bg-cyclone-green text-gray-950 font-bold rounded-lg hover:bg-cyclone-green/90 transition-colors text-lg"
          >
            Register for Tryouts
          </Link>
          <Link
            href="/schedule"
            className="px-8 py-3 border-2 border-cyclone-yellow text-cyclone-yellow font-bold rounded-lg hover:bg-cyclone-yellow/10 transition-colors text-lg"
          >
            View Schedule
          </Link>
        </div>
      </div>
    </section>
  );
}
```

### RosterGrid

```tsx
import { PlayerCard } from './PlayerCard';
import type { Player } from '@/lib/types';

interface RosterGridProps {
  players: Player[];
}

export function RosterGrid({ players }: RosterGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          name={player.name}
          position={player.position}
          jerseyNumber={player.jersey_number}
          photoUrl={player.photo_url}
        />
      ))}
    </div>
  );
}
```

### Footer

```tsx
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-cyclone-green/20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <span className="text-2xl font-bold text-cyclone-green">CYCLONES</span>
            <p className="mt-2 text-gray-400">U9 Travel Baseball</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-cyclone-yellow mb-3">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/schedule" className="hover:text-cyclone-green transition-colors">Schedule</Link></li>
              <li><Link href="/tryouts" className="hover:text-cyclone-green transition-colors">Tryouts</Link></li>
              <li><Link href="/contact" className="hover:text-cyclone-green transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-cyclone-yellow mb-3">Follow Us</h3>
            <div className="flex gap-4">
              {/* Add social media icons/links here */}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Cyclones U9 Travel Baseball. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

## Design Rules

1. **Server Components by default** — only add `"use client"` when interactivity is needed
2. **Cyclones palette everywhere** — use `text-cyclone-green`, `text-cyclone-yellow`, `bg-cyclone-green`, etc.
3. **Mobile-first** — start with single-column, expand with `sm:`, `md:`, `lg:` breakpoints
4. **Accessible** — all interactive elements need `aria-label`, images need `alt` text
5. **Consistent spacing** — use Tailwind's spacing scale (`p-4`, `gap-6`, `mt-8`)
