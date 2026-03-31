import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/admin/players — list all players
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== "coach") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("players")
    .select("id, name, position, jersey_number, bat_hand, throw_hand, is_active")
    .order("jersey_number", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/admin/players — create a new player
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== "coach") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as {
    name: string; position: string; jersey_number: number;
    bat_hand: string; throw_hand: string;
  };

  if (!body.name?.trim() || !body.position?.trim() || !body.jersey_number) {
    return NextResponse.json({ error: "Name, position, and jersey number are required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("players")
    .insert({
      name: body.name.trim(),
      position: body.position.trim(),
      jersey_number: Number(body.jersey_number),
      bat_hand: body.bat_hand ?? "R",
      throw_hand: body.throw_hand ?? "R",
      is_active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
