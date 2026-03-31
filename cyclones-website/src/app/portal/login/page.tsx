"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PortalLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      { email, password }
    );

    if (signInError || !data.user) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    const { user } = data;
    const role = user.user_metadata?.role;

    if (role === "coach") {
      router.push("/admin/portal");
    } else {
      // Query DB for all players linked to this account (supports multi-kid families)
      const { data: accounts } = await supabase
        .from("player_accounts")
        .select("player_id");

      if (!accounts || accounts.length === 0) {
        setError("No player linked to this account. Contact your coach.");
        setLoading(false);
        return;
      }

      if (accounts.length === 1) {
        router.push(`/portal/${accounts[0].player_id}`);
      } else {
        // Multiple kids — let parent pick
        router.push("/portal/select");
      }
    }
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚾</div>
          <h1 className="text-3xl font-extrabold text-cyclone-yellow mb-2">
            Player Portal
          </h1>
          <p className="text-gray-400 text-sm">
            Sign in to view your notes, goals, and workout schedule
          </p>
        </div>

        {/* Login card */}
        <form
          onSubmit={handleLogin}
          className="bg-surface rounded-2xl border border-cyclone-green/20 p-8 space-y-5"
        >
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="parent@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyclone-green text-black font-bold rounded-lg hover:bg-cyclone-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Need access? Contact your coach to set up your account.
        </p>
      </div>
    </div>
  );
}
