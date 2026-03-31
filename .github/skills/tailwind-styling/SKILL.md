---
name: tailwind-styling
description: "Tailwind CSS styling and theming for the Cyclones baseball website. Use when: configuring the Cyclones brand theme (bright green + yellow), styling responsive layouts, creating animations/transitions, building dark-themed sports UI, or auditing mobile responsiveness. Covers Tailwind config, custom colors, typography, and responsive patterns."
argument-hint: "Describe the styling, theme, or responsive layout to implement"
---

# Tailwind CSS Styling — Cyclones Website

## Brand Color System

### Primary Palette

| Name | Hex | Tailwind Class | Usage |
|------|-----|---------------|-------|
| Cyclone Green | `#00FF66` | `cyclone-green` | Primary brand, accents, CTAs, highlights |
| Cyclone Yellow | `#FFD700` | `cyclone-yellow` | Headings, secondary accent, text highlights |
| Deep Black | `#0A0A0F` | `gray-950` | Page backgrounds |
| Dark Surface | `#1A1A2E` | Custom `surface` | Card backgrounds, elevated surfaces |
| Light Gray | `#E5E7EB` | `gray-200` | Body text on dark backgrounds |

### Cyclone Green Shades (auto-generated)
- `cyclone-green/10` — Subtle background tints
- `cyclone-green/20` — Borders, dividers
- `cyclone-green/50` — Hover states
- `cyclone-green/90` — Active/pressed states

## Tailwind Configuration

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cyclone-green': {
          DEFAULT: '#00FF66',
          50: '#E6FFF0',
          100: '#B3FFD1',
          200: '#80FFB3',
          300: '#4DFF94',
          400: '#1AFF75',
          500: '#00FF66',
          600: '#00CC52',
          700: '#00993D',
          800: '#006629',
          900: '#003314',
        },
        'cyclone-yellow': {
          DEFAULT: '#FFD700',
          50: '#FFFBE6',
          100: '#FFF3B3',
          200: '#FFEB80',
          300: '#FFE34D',
          400: '#FFDB1A',
          500: '#FFD700',
          600: '#CCB000',
          700: '#998400',
          800: '#665800',
          900: '#332C00',
        },
        surface: '#1A1A2E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'Impact', 'sans-serif'], // Bold sports headings
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 50%, #0A0A0F 100%)',
        'card-gradient': 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)',
      },
      animation: {
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-in',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 255, 102, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(0, 255, 102, 0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      brightness: {
        40: '.4',
      },
    },
  },
  plugins: [],
};

export default config;
```

## Global Styles

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply scroll-smooth;
  }

  body {
    @apply bg-gray-950 text-gray-200 antialiased;
  }

  h1, h2, h3, h4 {
    @apply font-display uppercase tracking-wide;
  }

  /* Custom scrollbar for dark theme */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    @apply bg-gray-950;
  }
  ::-webkit-scrollbar-thumb {
    @apply bg-cyclone-green/30 rounded-full;
  }
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-cyclone-green/50;
  }
}

@layer components {
  /* Reusable button styles */
  .btn-primary {
    @apply px-6 py-3 bg-cyclone-green text-gray-950 font-bold rounded-lg
           hover:bg-cyclone-green/90 active:bg-cyclone-green/80
           transition-all duration-200 text-center;
  }

  .btn-secondary {
    @apply px-6 py-3 border-2 border-cyclone-yellow text-cyclone-yellow font-bold rounded-lg
           hover:bg-cyclone-yellow/10 active:bg-cyclone-yellow/20
           transition-all duration-200 text-center;
  }

  .btn-outline {
    @apply px-6 py-3 border border-cyclone-green/30 text-cyclone-green rounded-lg
           hover:border-cyclone-green hover:bg-cyclone-green/5
           transition-all duration-200 text-center;
  }

  /* Card styles */
  .card {
    @apply bg-surface rounded-xl border border-cyclone-green/10
           hover:border-cyclone-green/30 transition-all duration-300;
  }

  .card-elevated {
    @apply card shadow-lg shadow-cyclone-green/5
           hover:shadow-cyclone-green/10;
  }

  /* Section containers */
  .section {
    @apply py-16 sm:py-20 lg:py-24;
  }

  .section-heading {
    @apply text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-cyclone-yellow text-center mb-12;
  }
}
```

## Responsive Design Patterns

### Breakpoints
| Prefix | Min-width | Target |
|--------|-----------|--------|
| (none) | 0px | Mobile phones |
| `sm:` | 640px | Large phones / small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |

### Mobile-First Grid Pattern
```tsx
// Always start with single column, expand up
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
  {/* Cards */}
</div>
```

### Responsive Typography
```tsx
<h1 className="text-3xl sm:text-5xl lg:text-7xl font-display font-extrabold">
  <span className="text-cyclone-green">CYCLONES</span>
</h1>
```

### Container Pattern
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

## Common Patterns

### Glowing Green Border Effect
```tsx
<div className="border border-cyclone-green/20 hover:border-cyclone-green/60 hover:shadow-lg hover:shadow-cyclone-green/10 transition-all duration-300 rounded-xl">
```

### Green Gradient Text
```tsx
<span className="bg-gradient-to-r from-cyclone-green to-cyclone-yellow bg-clip-text text-transparent">
  Cyclones Baseball
</span>
```

### Dark Overlay on Images
```tsx
<div className="relative">
  <Image src="..." alt="..." fill className="object-cover" />
  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
  <div className="relative z-10">{/* Content over image */}</div>
</div>
```

### Sports Stat Badge
```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-cyclone-green/10 text-cyclone-green border border-cyclone-green/20">
  #24
</span>
```

## Typography System

| Element | Classes |
|---------|---------|
| Page title | `text-5xl sm:text-7xl font-display font-extrabold text-cyclone-green` |
| Section heading | `text-3xl sm:text-4xl font-display font-bold text-cyclone-yellow` |
| Card title | `text-lg font-bold text-cyclone-yellow` |
| Body text | `text-base text-gray-300` |
| Small/meta | `text-sm text-gray-400` |
| Nav links | `text-base font-medium text-gray-300 hover:text-cyclone-green` |

## Fonts Setup

Add Google Fonts via Next.js:

```tsx
// src/app/layout.tsx
import { Inter, Oswald } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`}>
      <body className="font-sans">{/* ... */}</body>
    </html>
  );
}
```
