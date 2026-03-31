import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const playerId = request.nextUrl.searchParams.get("player_id");
  const weekOf = request.nextUrl.searchParams.get("week_of");

  if (!playerId || !weekOf) {
    return NextResponse.json({ error: "player_id and week_of required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("player_id", playerId)
    .eq("week_of", weekOf)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== "coach") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json();
  const { player_id, week_of, title, days } = body as {
    player_id: string;
    week_of: string;
    title: string;
    days: { day: string; activities: string }[];
  };

  if (!player_id || !week_of || !days) {
    return NextResponse.json({ error: "player_id, week_of, and days required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Upsert: update if exists for this player + week, insert otherwise
  const { data, error } = await admin
    .from("workout_plans")
    .upsert(
      {
        player_id,
        week_of,
        title: title || "Weekly Workout Plan",
        days,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "player_id,week_of" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
