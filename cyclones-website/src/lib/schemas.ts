import { z } from "zod/v4";

export const tryoutRegistrationSchema = z.object({
  playerName: z.string().min(2, "Player name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  parentName: z.string().min(2, "Parent/guardian name is required"),
  parentEmail: z.email("Please enter a valid email"),
  parentPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[\d\s\-()+ ]+$/, "Please enter a valid phone number"),
  positionsPlayed: z
    .array(z.string())
    .min(1, "Select at least one position"),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  previousTeams: z.string().optional(),
  medicalNotes: z.string().optional(),
  howHeardAboutUs: z.string().optional(),
});

export type TryoutRegistrationInput = z.infer<typeof tryoutRegistrationSchema>;

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.email("Please enter a valid email"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const eventFormSchema = z.object({
  title: z.string().min(2, "Event title is required"),
  eventType: z.enum(["game", "practice", "tournament", "tryout", "other"]),
  eventDate: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  opponent: z.string().optional(),
  description: z.string().optional(),
  isHomeGame: z.boolean(),
});

export type EventFormInput = z.infer<typeof eventFormSchema>;
