export interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number: number;
  photo_url: string | null;
  bat_hand: "L" | "R" | "S";
  throw_hand: "L" | "R";
  is_active: boolean;
}

export interface GameEvent {
  id: string;
  title: string;
  event_type: "game" | "practice" | "tournament" | "tryout" | "other";
  event_date: string;
  start_time: string;
  end_time: string | null;
  location: string;
  opponent: string | null;
  description: string | null;
  is_home_game: boolean;
}

export interface TryoutRegistration {
  id: string;
  player_name: string;
  date_of_birth: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  positions_played: string[];
  experience_level: "beginner" | "intermediate" | "advanced";
  previous_teams: string | null;
  medical_notes: string | null;
  how_heard_about_us: string | null;
  status: "pending" | "reviewed" | "accepted" | "declined";
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
  title: string;
  bio: string | null;
  photo_url: string | null;
  email: string;
  years_experience: number | null;
}

export type StaffRole = "head_coach" | "assistant_coach" | "team_rep";

export interface StaffMember {
  name: string;
  role: StaffRole;
  phone: string; // E.164 format: +15551234567
  receives_sms: boolean;
}

// ============================================
// PLAYER PORTAL
// ============================================

/** Links a Supabase auth user to a player record */
export interface PlayerAccount {
  id: string;           // = auth.users.id
  player_id: string;
  parent_name: string;
  parent_email: string;
  notify_on_note: boolean;
  created_at: string;
}

export type NoteType = "note" | "focus" | "praise" | "reminder";

export interface CoachNote {
  id: string;
  player_id: string;
  content: string;
  coach_name: string;
  note_type: NoteType;
  is_focus: boolean;
  created_at: string;
}

export interface PlayerGoal {
  id: string;
  player_id: string;
  description: string;
  acknowledged: boolean;
  acknowledged_at: string | null;
  is_complete: boolean;
  due_date: string | null;
  created_at: string;
}

export interface WorkoutDay {
  day: string;        // "Monday", "Tuesday", etc.
  activities: string; // Free-form text from coach
}

export interface WorkoutPlan {
  id: string;
  player_id: string;
  week_of: string;   // ISO date string — Monday of the week
  title: string;
  days: WorkoutDay[];
  created_at: string;
  updated_at: string;
}

// Slim player shape used in portal/admin dropdowns
export interface PlayerSummary {
  id: string;
  name: string;
  position: string;
  jersey_number: number;
}
