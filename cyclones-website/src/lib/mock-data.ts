import type { Player, GameEvent, Coach } from "./types";

// Mock data for first pass — replace with Supabase queries later

export const mockPlayers: Player[] = [
  { id: "1", name: "Ethan Rivera", position: "Pitcher", jersey_number: 7, photo_url: null, bat_hand: "R", throw_hand: "R", is_active: true },
  { id: "2", name: "Liam Johnson", position: "Catcher", jersey_number: 12, photo_url: null, bat_hand: "R", throw_hand: "R", is_active: true },
  { id: "3", name: "Noah Martinez", position: "First Base", jersey_number: 23, photo_url: null, bat_hand: "L", throw_hand: "L", is_active: true },
  { id: "4", name: "Mason Williams", position: "Second Base", jersey_number: 4, photo_url: null, bat_hand: "R", throw_hand: "R", is_active: true },
  { id: "5", name: "Lucas Brown", position: "Shortstop", jersey_number: 2, photo_url: null, bat_hand: "S", throw_hand: "R", is_active: true },
  { id: "6", name: "Jack Davis", position: "Third Base", jersey_number: 15, photo_url: null, bat_hand: "R", throw_hand: "R", is_active: true },
  { id: "7", name: "Aiden Wilson", position: "Left Field", jersey_number: 9, photo_url: null, bat_hand: "L", throw_hand: "L", is_active: true },
  { id: "8", name: "Henry Anderson", position: "Center Field", jersey_number: 1, photo_url: null, bat_hand: "R", throw_hand: "R", is_active: true },
  { id: "9", name: "Owen Thomas", position: "Right Field", jersey_number: 22, photo_url: null, bat_hand: "R", throw_hand: "R", is_active: true },
  { id: "10", name: "Elijah Jackson", position: "Pitcher", jersey_number: 11, photo_url: null, bat_hand: "L", throw_hand: "L", is_active: true },
  { id: "11", name: "James White", position: "Utility", jersey_number: 5, photo_url: null, bat_hand: "R", throw_hand: "R", is_active: true },
  { id: "12", name: "Benjamin Harris", position: "Utility", jersey_number: 8, photo_url: null, bat_hand: "R", throw_hand: "R", is_active: true },
];

export const mockEvents: GameEvent[] = [
  {
    id: "1", title: "Cyclones vs Thunder", event_type: "game", event_date: "2026-04-05",
    start_time: "10:00", end_time: "12:00", location: "Riverside Park Field 3",
    opponent: "Thunder", description: "League opener", is_home_game: true,
  },
  {
    id: "2", title: "Practice", event_type: "practice", event_date: "2026-04-07",
    start_time: "17:30", end_time: "19:00", location: "Cyclones Training Facility",
    opponent: null, description: "Hitting and fielding drills", is_home_game: true,
  },
  {
    id: "3", title: "Cyclones vs Lightning", event_type: "game", event_date: "2026-04-12",
    start_time: "09:00", end_time: "11:00", location: "Oak Hill Complex",
    opponent: "Lightning", description: null, is_home_game: false,
  },
  {
    id: "4", title: "Practice", event_type: "practice", event_date: "2026-04-14",
    start_time: "17:30", end_time: "19:00", location: "Cyclones Training Facility",
    opponent: null, description: "Base running and pitching", is_home_game: true,
  },
  {
    id: "5", title: "Spring Classic Tournament", event_type: "tournament", event_date: "2026-04-19",
    start_time: "08:00", end_time: "18:00", location: "Champions Sports Complex",
    opponent: null, description: "Full day tournament — 3 game guarantee", is_home_game: false,
  },
  {
    id: "6", title: "Spring Classic Tournament Day 2", event_type: "tournament", event_date: "2026-04-20",
    start_time: "08:00", end_time: "16:00", location: "Champions Sports Complex",
    opponent: null, description: "Bracket play", is_home_game: false,
  },
  {
    id: "7", title: "Cyclones vs Hurricanes", event_type: "game", event_date: "2026-04-26",
    start_time: "13:00", end_time: "15:00", location: "Riverside Park Field 3",
    opponent: "Hurricanes", description: null, is_home_game: true,
  },
  {
    id: "8", title: "Open Tryouts", event_type: "tryout", event_date: "2026-05-10",
    start_time: "09:00", end_time: "12:00", location: "Cyclones Training Facility",
    opponent: null, description: "Open tryouts for Fall 2026 season. All ages welcome.", is_home_game: true,
  },
];

export const mockCoaches: Coach[] = [
  {
    id: "1", name: "Coach Mike Thompson", title: "Head Coach",
    bio: "Coach Mike has 15 years of youth baseball coaching experience and played college ball at State University. He believes in developing well-rounded players with strong fundamentals and great sportsmanship.",
    photo_url: null, email: "mike@cyclones.com", years_experience: 15,
  },
  {
    id: "2", name: "Coach Sarah Chen", title: "Assistant Coach",
    bio: "Coach Sarah is a former collegiate softball player who specializes in hitting mechanics and base running. She brings energy and expertise to every practice.",
    photo_url: null, email: "sarah@cyclones.com", years_experience: 8,
  },
  {
    id: "3", name: "Coach David Reyes", title: "Pitching Coach",
    bio: "Coach David pitched in the minor leagues for 4 years before transitioning to coaching. He focuses on age-appropriate arm care and pitching development.",
    photo_url: null, email: "david@cyclones.com", years_experience: 10,
  },
];
