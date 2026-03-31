import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const playerId = request.nextUrl.searchParams.get("player_id");
  if (!playerId) {
    return NextResponse.json({ error: "player_id required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_goals")
    .select("*")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

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
  const { player_id, description, due_date } = body as {
    player_id: string;
    description: string;
    due_date: string | null;
  };

  if (!player_id || !description?.trim()) {
    return NextResponse.json({ error: "player_id and description required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("player_goals")
    .insert({
      player_id,
      description: description.trim(),
      due_date: due_date ?? null,
      acknowledged: false,
      is_complete: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
