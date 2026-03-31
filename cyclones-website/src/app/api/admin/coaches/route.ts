import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/admin/coaches — list all coach auth users
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== "coach") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const coaches = data.users
    .filter((u) => u.user_metadata?.role === "coach")
    .map((u) => ({
      id: u.id,
      email: u.email ?? "",
      name: u.user_metadata?.name ?? u.email ?? "",
      created_at: u.created_at,
    }));

  return NextResponse.json(coaches);
}

// POST /api/admin/coaches — create a new coach account
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== "coach") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as {
    name: string; email: string; initial_password: string;
  };

  if (!body.name?.trim() || !body.email?.trim() || !body.initial_password) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
  }
  if (body.initial_password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: newUser, error } = await admin.auth.admin.createUser({
    email: body.email.trim(),
    password: body.initial_password,
    user_metadata: { role: "coach", name: body.name.trim() },
    email_confirm: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(
    { id: newUser.user.id, email: newUser.user.email, name: body.name.trim() },
    { status: 201 }
  );
}

// DELETE /api/admin/coaches — remove a coach (cannot delete yourself)
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== "coach") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json() as { id: string };
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  if (id === user.id) {
    return NextResponse.json({ error: "You cannot remove yourself" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
