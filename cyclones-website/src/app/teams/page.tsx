import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Roster | Cyclones U9 Travel Baseball",
  description: "Meet the Cyclones U9 travel baseball team roster.",
};

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("players")
    .select("id, name, position, jersey_number, bat_hand, throw_hand")
    .eq("is_active", true)
    .order("jersey_number", { ascending: true });

  const players = data ?? [];

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative text-center mb-12">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-no-repeat bg-center bg-contain pointer-events-none opacity-60"
            style={{ backgroundImage: "url('/images/cyclone-swirl.svg')" }}
          />
          <h1 className="relative text-4xl sm:text-5xl font-extrabold text-cyclone-yellow mb-4">
            MEET THE TEAM
          </h1>
          <p className="relative text-gray-400 text-lg">
            Cyclones U9 — 2026 Season Roster
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {players.map((player) => (
            <Link
              key={player.id}
              href={`/portal/login?player=${player.id}`}
              className="bg-surface rounded-xl border border-cyclone-green/10 overflow-hidden hover:border-cyclone-green/40 transition-all group block"
            >
              {/* Player photo placeholder */}
              <div className="w-full aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
                <span className="text-6xl sm:text-7xl font-extrabold text-cyclone-green/20 group-hover:text-cyclone-green/40 transition-colors">
                  #{player.jersey_number}
                </span>
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-surface to-transparent" />
              </div>

              <div className="p-4">
                <h3 className="text-base sm:text-lg font-bold text-white truncate group-hover:text-cyclone-green transition-colors">
                  {player.name}
                </h3>
                <p className="text-gray-400 text-sm">{player.position}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-block px-2.5 py-0.5 bg-cyclone-green/10 text-cyclone-green text-xs font-semibold rounded-full">
                    #{player.jersey_number}
                  </span>
                  <span className="text-xs text-gray-500">
                    {player.bat_hand === "S"
                      ? "Switch"
                      : player.bat_hand === "L"
                      ? "Bats L"
                      : "Bats R"}{" "}
                    / {player.throw_hand === "L" ? "Throws L" : "Throws R"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
