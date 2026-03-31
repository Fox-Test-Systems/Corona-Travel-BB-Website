import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNoteNotification } from "@/lib/email";

export async function GET(request: NextRequest) {
  const playerId = request.nextUrl.searchParams.get("player_id");
  if (!playerId) {
    return NextResponse.json({ error: "player_id required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coach_notes")
    .select("*")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  // Verify caller is a coach
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== "coach") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json();
  const { player_id, content, note_type, is_focus } = body as {
    player_id: string;
    content: string;
    note_type: string;
    is_focus: boolean;
  };

  if (!player_id || !content?.trim()) {
    return NextResponse.json({ error: "player_id and content required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: note, error } = await admin
    .from("coach_notes")
    .insert({
      player_id,
      content: content.trim(),
      coach_name: user.user_metadata?.name ?? user.email ?? "Coach",
      note_type: note_type ?? "note",
      is_focus: is_focus ?? false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send email notification to parent if they have an account and notifications on
  const { data: account } = await admin
    .from("player_accounts")
    .select("parent_email, parent_name, notify_on_note")
    .eq("player_id", player_id)
    .maybeSingle();

  const { data: player } = await admin
    .from("players")
    .select("name")
    .eq("id", player_id)
    .single();

  if (account?.notify_on_note && account.parent_email && player) {
    const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/portal/${player_id}`;
    await sendNoteNotification({
      parentEmail: account.parent_email,
      parentName: account.parent_name,
      playerName: player.name,
      coachName: note.coach_name,
      noteContent: content.trim(),
      portalUrl,
    });
  }

  return NextResponse.json(note, { status: 201 });
}
