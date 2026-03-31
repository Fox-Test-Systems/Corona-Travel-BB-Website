import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import PlayerDashboard from "./PlayerDashboard";

interface Props {
  params: Promise<{ playerId: string }>;
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // back to Monday
  const monday = new Date(now);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}

export default async function PlayerPortalPage({ params }: Props) {
  const { playerId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/portal/login");

  // Coaches can view any player; parents can only see their linked players
  const isCoach = user.user_metadata?.role === "coach";

  if (!isCoach) {
    // Verify this user has an account linked to the requested player
    const { data: account } = await supabase
      .from("player_accounts")
      .select("id")
      .eq("player_id", playerId)
      .maybeSingle();

    if (!account) redirect("/portal/login");
  }

  const { data: player } = await supabase
    .from("players")
    .select("id, name, position, jersey_number")
    .eq("id", playerId)
    .single();

  if (!player) redirect("/portal/login");

  const weekOf = getWeekStart();

  // Coaches bypass RLS — use admin client so they can see all player data.
  // Parents use the regular client (RLS restricts to their own player's data).
  const db = isCoach ? createAdminClient() : supabase;

  const [notesRes, goalsRes, workoutRes] = await Promise.all([
    db
      .from("coach_notes")
      .select("*")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false })
      .limit(20),
    db
      .from("player_goals")
      .select("*")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false }),
    db
      .from("workout_plans")
      .select("*")
      .eq("player_id", playerId)
      .eq("week_of", weekOf)
      .maybeSingle(),
  ]);

  return (
    <PlayerDashboard
      player={player}
      notes={notesRes.data ?? []}
      goals={goalsRes.data ?? []}
      workout={workoutRes.data ?? null}
      isCoach={isCoach}
    />
  );
}
