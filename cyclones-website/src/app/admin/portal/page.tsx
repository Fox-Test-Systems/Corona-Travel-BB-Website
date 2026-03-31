import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminPortal from "./AdminPortal";

export default async function AdminPortalPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "coach") {
    redirect("/portal/login");
  }

  // Fetch all active players for the dropdowns
  const adminClient = createAdminClient();
  const { data: players } = await adminClient
    .from("players")
    .select("id, name, position, jersey_number")
    .eq("is_active", true)
    .order("jersey_number", { ascending: true });

  // Fetch which players already have portal accounts
  const { data: accounts } = await adminClient
    .from("player_accounts")
    .select("player_id, parent_name, parent_email");

  const accountedPlayerIds = new Set((accounts ?? []).map((a) => a.player_id));

  return (
    <AdminPortal
      coachName={user.user_metadata?.name ?? user.email ?? "Coach"}
      currentUserId={user.id}
      players={players ?? []}
      accountedPlayerIds={[...accountedPlayerIds]}
    />
  );
}
