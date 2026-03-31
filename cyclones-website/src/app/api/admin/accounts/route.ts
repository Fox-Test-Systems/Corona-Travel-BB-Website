import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  // Only coaches can create player portal accounts
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== "coach") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json();
  const { player_id, parent_name, parent_email, initial_password } = body as {
    player_id: string;
    parent_name: string;
    parent_email: string;
    initial_password: string;
  };

  if (!player_id || !parent_name || !parent_email || !initial_password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  if (initial_password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Look up the player to confirm it exists
  const { data: player } = await admin
    .from("players")
    .select("name")
    .eq("id", player_id)
    .single();

  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  // ── Resolve auth user ──────────────────────────────────────────────
  // A parent with multiple kids (or a coach who is also a parent) uses
  // one auth user linked to multiple player_accounts rows.
  // Priority: (1) existing player_account with this email → reuse user_id
  //           (2) any existing auth user with this email → reuse that user
  //           (3) create a fresh auth user

  let authUserId: string;
  let isNewUser = false;

  // Check if any player_account already uses this email
  const { data: existingAccount } = await admin
    .from("player_accounts")
    .select("user_id")
    .eq("parent_email", parent_email)
    .limit(1)
    .maybeSingle();

  if (existingAccount?.user_id) {
    authUserId = existingAccount.user_id;
  } else {
    // Email may belong to a coach or another user not yet in player_accounts
    const { data: allUsers } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const existingAuthUser = allUsers?.users.find(
      (u) => u.email?.toLowerCase() === parent_email.toLowerCase()
    );

    if (existingAuthUser) {
      authUserId = existingAuthUser.id;
    } else {
      // Brand-new user — create the auth account
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email: parent_email,
        password: initial_password,
        user_metadata: { role: "player", parent_name },
        email_confirm: true,
      });
      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }
      authUserId = newUser.user.id;
      isNewUser = true;
    }
  }

  // Guard: prevent linking the same parent to the same player twice
  const { data: duplicate } = await admin
    .from("player_accounts")
    .select("id")
    .eq("user_id", authUserId)
    .eq("player_id", player_id)
    .maybeSingle();

  if (duplicate) {
    return NextResponse.json(
      { error: "This parent already has access to this player's portal." },
      { status: 409 }
    );
  }

  // Insert the player_accounts record (id auto-generated via gen_random_uuid())
  const { error: accountError } = await admin.from("player_accounts").insert({
    user_id: authUserId,
    player_id,
    parent_name,
    parent_email,
    notify_on_note: true,
  });

  if (accountError) {
    // Roll back newly created auth user only — don't delete an existing one
    if (isNewUser) await admin.auth.admin.deleteUser(authUserId);
    return NextResponse.json({ error: accountError.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: "Account created successfully", user_id: authUserId },
    { status: 201 }
  );
}
