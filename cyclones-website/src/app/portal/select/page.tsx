import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

interface PlayerAccountRow {
  player_id: string;
  players: {
    id: string;
    name: string;
    position: string;
    jersey_number: number;
  } | null;
}

export default async function SelectPlayerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/portal/login");
  if (user.user_metadata?.role === "coach") redirect("/admin/portal");

  const { data: accounts } = await supabase
    .from("player_accounts")
    .select("player_id, players(id, name, position, jersey_number)")
    .returns<PlayerAccountRow[]>();

  if (!accounts || accounts.length === 0) redirect("/portal/login");
  if (accounts.length === 1) redirect(`/portal/${accounts[0].player_id}`);

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚾</div>
          <h1 className="text-3xl font-extrabold text-cyclone-yellow mb-2">
            Select Player
          </h1>
          <p className="text-gray-400 text-sm">
            You have multiple players on the roster. Who are you viewing today?
          </p>
        </div>

        <div className="space-y-3">
          {accounts.map(({ player_id, players: p }) => (
            <Link
              key={player_id}
              href={`/portal/${player_id}`}
              className="flex items-center gap-4 bg-surface border border-cyclone-green/20 hover:border-cyclone-green/60 rounded-xl p-5 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-cyclone-green/10 border border-cyclone-green/30 flex items-center justify-center shrink-0">
                <span className="text-cyclone-green font-extrabold text-lg">
                  #{p?.jersey_number ?? "?"}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-white group-hover:text-cyclone-green transition-colors">
                  {p?.name ?? "Unknown Player"}
                </p>
                <p className="text-xs text-gray-400">{p?.position}</p>
              </div>
              <span className="text-cyclone-green opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
