---
name: forms-validation
description: "Form handling and validation for the Cyclones baseball website using React Hook Form and Zod. Use when: building the tryout registration form, contact form, schedule event editor, or any form with validation. Covers form setup, Zod schema validation, error display, submission handling, and accessible form patterns."
argument-hint: "Describe the form to build or the validation pattern needed"
---

# Forms & Validation — Cyclones Website

## Tech Stack

| Library | Purpose |
|---------|---------|
| **React Hook Form** | Form state management, performance-optimized re-renders |
| **Zod** | Schema validation (TypeScript-first, runtime validation) |
| **@hookform/resolvers** | Connects Zod schemas to React Hook Form |

## Installation

```bash
npm install react-hook-form zod @hookform/resolvers
```

## Form Pattern

Every form in the Cyclones site follows this pattern:

1. Define a **Zod schema** (in `src/lib/schemas.ts`)
2. Create a **Client Component** with `"use client"`
3. Use `useForm` with `zodResolver`
4. Submit to a **Next.js API route**
5. Show **success/error feedback**

## Tryout Registration Form

### Schema

```ts
// src/lib/schemas.ts
import { z } from 'zod';

export const tryoutRegistrationSchema = z.object({
  playerName: z.string().min(2, 'Player name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  parentName: z.string().min(2, 'Parent/guardian name is required'),
  parentEmail: z.string().email('Please enter a valid email'),
  parentPhone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[\d\s\-\(\)\+]+$/, 'Please enter a valid phone number'),
  positionsPlayed: z
    .array(z.string())
    .min(1, 'Select at least one position'),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Please select an experience level',
  }),
  previousTeams: z.string().optional(),
  medicalNotes: z.string().optional(),
  howHeardAboutUs: z.string().optional(),
});

export type TryoutRegistrationInput = z.infer<typeof tryoutRegistrationSchema>;
```

### Form Component

```tsx
// src/components/forms/TryoutForm.tsx
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tryoutRegistrationSchema, type TryoutRegistrationInput } from '@/lib/schemas';
import { useState } from 'react';

const POSITIONS = [
  'Pitcher', 'Catcher', 'First Base', 'Second Base',
  'Shortstop', 'Third Base', 'Left Field', 'Center Field', 'Right Field',
];

export function TryoutForm() {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TryoutRegistrationInput>({
    resolver: zodResolver(tryoutRegistrationSchema),
    defaultValues: {
      positionsPlayed: [],
      experienceLevel: undefined,
    },
  });

  async function onSubmit(data: TryoutRegistrationInput) {
    try {
      const response = await fetch('/api/tryouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Submission failed');

      setSubmitStatus('success');
      reset();
    } catch {
      setSubmitStatus('error');
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className="card p-8 text-center">
        <h3 className="text-2xl font-display text-cyclone-green mb-2">Registration Received!</h3>
        <p className="text-gray-400">We'll be in touch soon about tryout details.</p>
        <button onClick={() => setSubmitStatus('idle')} className="btn-outline mt-4">
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6 sm:p-8 space-y-6">
      {submitStatus === 'error' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          Something went wrong. Please try again.
        </div>
      )}

      {/* Player Info */}
      <fieldset className="space-y-4">
        <legend className="text-xl font-display text-cyclone-yellow">Player Information</legend>

        <FormField label="Player Name" error={errors.playerName?.message}>
          <input {...register('playerName')} className="form-input" placeholder="Full name" />
        </FormField>

        <FormField label="Date of Birth" error={errors.dateOfBirth?.message}>
          <input {...register('dateOfBirth')} type="date" className="form-input" />
        </FormField>

        <FormField label="Positions Played" error={errors.positionsPlayed?.message}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {POSITIONS.map((pos) => (
              <label key={pos} className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  value={pos}
                  {...register('positionsPlayed')}
                  className="accent-cyclone-green"
                />
                {pos}
              </label>
            ))}
          </div>
        </FormField>

        <FormField label="Experience Level" error={errors.experienceLevel?.message}>
          <select {...register('experienceLevel')} className="form-input">
            <option value="">Select level...</option>
            <option value="beginner">Beginner (0-1 years)</option>
            <option value="intermediate">Intermediate (2-3 years)</option>
            <option value="advanced">Advanced (4+ years)</option>
          </select>
        </FormField>
      </fieldset>

      {/* Parent Info */}
      <fieldset className="space-y-4">
        <legend className="text-xl font-display text-cyclone-yellow">Parent/Guardian Information</legend>

        <FormField label="Parent/Guardian Name" error={errors.parentName?.message}>
          <input {...register('parentName')} className="form-input" placeholder="Full name" />
        </FormField>

        <FormField label="Email" error={errors.parentEmail?.message}>
          <input {...register('parentEmail')} type="email" className="form-input" placeholder="email@example.com" />
        </FormField>

        <FormField label="Phone" error={errors.parentPhone?.message}>
          <input {...register('parentPhone')} type="tel" className="form-input" placeholder="(555) 123-4567" />
        </FormField>
      </fieldset>

      {/* Optional Fields */}
      <fieldset className="space-y-4">
        <legend className="text-xl font-display text-cyclone-yellow">Additional Info (Optional)</legend>

        <FormField label="Previous Teams">
          <input {...register('previousTeams')} className="form-input" placeholder="List any previous teams" />
        </FormField>

        <FormField label="Medical Notes">
          <textarea
            {...register('medicalNotes')}
            className="form-input min-h-[80px]"
            placeholder="Allergies, conditions, or other medical information"
          />
        </FormField>

        <FormField label="How did you hear about us?">
          <input {...register('howHeardAboutUs')} className="form-input" placeholder="Referral, social media, etc." />
        </FormField>
      </fieldset>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-50">
        {isSubmitting ? 'Submitting...' : 'Register for Tryouts'}
      </button>
    </form>
  );
}

// Reusable field wrapper
function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}
```

## Contact Form

### Schema

```ts
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});
```

### Component (follows same pattern as TryoutForm)

```tsx
"use client";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, type ContactFormInput } from '@/lib/schemas';

export function ContactForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
  });

  async function onSubmit(data: ContactFormInput) {
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6 sm:p-8 space-y-4">
      <FormField label="Name" error={errors.name?.message}>
        <input {...register('name')} className="form-input" />
      </FormField>
      <FormField label="Email" error={errors.email?.message}>
        <input {...register('email')} type="email" className="form-input" />
      </FormField>
      <FormField label="Subject" error={errors.subject?.message}>
        <input {...register('subject')} className="form-input" />
      </FormField>
      <FormField label="Message" error={errors.message?.message}>
        <textarea {...register('message')} className="form-input min-h-[120px]" />
      </FormField>
      <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-50">
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
```

## Form Input Styling

Add to `globals.css`:

```css
@layer components {
  .form-input {
    @apply w-full p-3 bg-gray-800 text-gray-100 rounded-lg
           border border-gray-700 placeholder-gray-500
           focus:border-cyclone-green focus:ring-1 focus:ring-cyclone-green
           outline-none transition-colors;
  }
}
```

## Event Form (Coach Schedule Editor)

```tsx
// Same pattern — uses eventFormSchema
// Protected by middleware — only accessible at /schedule/edit
// Submits to POST /api/schedule
// Includes date picker, time inputs, event type dropdown, location field
```

## Validation Best Practices

1. **Client + Server validation** — Zod schema validates on both sides
2. **Instant feedback** — Errors appear per-field as user types (mode: 'onBlur')
3. **Accessible errors** — Error messages are associated with inputs
4. **Submit protection** — Button disabled during submission
5. **Success confirmation** — Clear feedback after successful submission
6. **Sanitize on server** — Always re-validate with Zod in API routes before DB insert
