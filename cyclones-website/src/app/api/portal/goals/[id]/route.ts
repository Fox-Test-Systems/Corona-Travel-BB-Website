import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json();
  const updates = body as { acknowledged?: boolean; is_complete?: boolean };

  const isCoach = user.user_metadata?.role === "coach";
  const admin = createAdminClient();

  if (updates.is_complete !== undefined && !isCoach) {
    // Only coaches can mark goals complete
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (updates.acknowledged !== undefined && isCoach) {
    // Coaches don't acknowledge — that's for players/parents
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const patch: Record<string, unknown> = {};
  if (updates.acknowledged === true) {
    patch.acknowledged = true;
    patch.acknowledged_at = new Date().toISOString();
  }
  if (updates.is_complete === true) {
    patch.is_complete = true;
  }

  const { data, error } = await admin
    .from("player_goals")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
