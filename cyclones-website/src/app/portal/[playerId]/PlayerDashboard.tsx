"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { CoachNote, PlayerGoal, WorkoutPlan, PlayerSummary } from "@/lib/types";

interface Props {
  player: PlayerSummary;
  notes: CoachNote[];
  goals: PlayerGoal[];
  workout: WorkoutPlan | null;
  isCoach: boolean;
}

const NOTE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  focus:    { label: "Focus Area",  color: "text-cyclone-yellow border-cyclone-yellow/30 bg-cyclone-yellow/10" },
  praise:   { label: "Praise",      color: "text-cyclone-green border-cyclone-green/30 bg-cyclone-green/10" },
  reminder: { label: "Reminder",    color: "text-blue-400 border-blue-400/30 bg-blue-400/10" },
  note:     { label: "Note",        color: "text-gray-400 border-gray-600 bg-gray-800/40" },
};

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function PlayerDashboard({ player, notes, goals: initialGoals, workout, isCoach }: Props) {
  const [goals, setGoals] = useState(initialGoals);
  const [activeTab, setActiveTab] = useState<"notes" | "goals" | "workout">("notes");
  const router = useRouter();
  const supabase = createClient();

  const focusNotes = notes.filter((n) => n.is_focus);
  const regularNotes = notes.filter((n) => !n.is_focus);

  async function handleAcknowledge(goalId: string, current: boolean) {
    if (current) return; // already acknowledged
    const res = await fetch(`/api/portal/goals/${goalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acknowledged: true }),
    });
    if (res.ok) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? { ...g, acknowledged: true, acknowledged_at: new Date().toISOString() }
            : g
        )
      );
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/portal/login");
    router.refresh();
  }

  const pendingGoals = goals.filter((g) => !g.is_complete);
  const completedGoals = goals.filter((g) => g.is_complete);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-cyclone-green text-sm font-semibold uppercase tracking-widest mb-1">
              Player Portal
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              {player.name}
            </h1>
            <p className="text-gray-400 mt-1">
              #{player.jersey_number} · {player.position}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isCoach && (
              <a
                href={`/admin/portal`}
                className="text-sm text-cyclone-green border border-cyclone-green/30 px-3 py-1.5 rounded-lg hover:bg-cyclone-green/10 transition-colors"
              >
                Admin
              </a>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg hover:border-gray-500 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Focus Area Banner */}
        {focusNotes.length > 0 && (
          <div className="bg-cyclone-yellow/10 border border-cyclone-yellow/30 rounded-xl p-5 mb-6">
            <p className="text-cyclone-yellow text-xs font-bold uppercase tracking-widest mb-2">
              ⭐ Current Focus
            </p>
            <p className="text-white text-base leading-relaxed whitespace-pre-wrap">
              {focusNotes[0].content}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              — Coach {focusNotes[0].coach_name} ·{" "}
              {new Date(focusNotes[0].created_at).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-surface rounded-xl p-1">
          {(["notes", "goals", "workout"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-colors ${
                activeTab === tab
                  ? "bg-cyclone-green text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
              {tab === "goals" && pendingGoals.length > 0 && (
                <span className="ml-1.5 text-xs bg-cyclone-yellow text-black px-1.5 py-0.5 rounded-full">
                  {pendingGoals.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notes Tab */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            {regularNotes.length === 0 && focusNotes.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                No notes yet. Check back after practice!
              </div>
            )}
            {regularNotes.map((note) => {
              const style = NOTE_TYPE_LABELS[note.note_type] ?? NOTE_TYPE_LABELS.note;
              return (
                <div
                  key={note.id}
                  className={`rounded-xl border p-5 ${style.color}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold uppercase tracking-widest ${style.color}`}>
                      {style.label}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(note.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-white leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <p className="text-gray-500 text-xs mt-3">
                    — Coach {note.coach_name}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === "goals" && (
          <div className="space-y-6">
            {/* Pending goals */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
                Active Goals
              </h2>
              {pendingGoals.length === 0 && (
                <p className="text-gray-500 text-sm">No active goals right now.</p>
              )}
              <div className="space-y-3">
                {pendingGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="bg-surface border border-cyclone-green/15 rounded-xl p-4 flex items-start gap-4"
                  >
                    <button
                      onClick={() => handleAcknowledge(goal.id, goal.acknowledged)}
                      className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        goal.acknowledged
                          ? "bg-cyclone-green border-cyclone-green text-black"
                          : "border-gray-600 hover:border-cyclone-green"
                      }`}
                      title={goal.acknowledged ? "Acknowledged" : "Click to acknowledge this goal"}
                    >
                      {goal.acknowledged && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-white leading-snug">{goal.description}</p>
                      <div className="flex items-center gap-4 mt-1.5">
                        {goal.due_date && (
                          <span className="text-xs text-gray-500">
                            Due: {new Date(goal.due_date).toLocaleDateString()}
                          </span>
                        )}
                        {goal.acknowledged && (
                          <span className="text-xs text-cyclone-green font-semibold">
                            ✓ Acknowledged
                          </span>
                        )}
                        {!goal.acknowledged && (
                          <span className="text-xs text-gray-500 italic">
                            Tap checkbox to acknowledge
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed goals */}
            {completedGoals.length > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-600 mb-3">
                  Completed
                </h2>
                <div className="space-y-2">
                  {completedGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="rounded-xl border border-gray-800 p-4 opacity-50"
                    >
                      <p className="text-gray-400 line-through text-sm">{goal.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Workout Tab */}
        {activeTab === "workout" && (
          <div>
            {!workout ? (
              <div className="text-center text-gray-500 py-12">
                No workout plan for this week yet. Check back soon!
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-white">{workout.title}</h2>
                  <span className="text-xs text-gray-500">
                    Week of{" "}
                    {new Date(workout.week_of + "T00:00:00").toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {DAYS_OF_WEEK.map((day) => {
                  const entry = workout.days.find((d) => d.day === day);
                  if (!entry?.activities) return null;
                  return (
                    <div
                      key={day}
                      className="bg-surface border border-cyclone-green/15 rounded-xl p-4"
                    >
                      <p className="text-cyclone-green text-xs font-bold uppercase tracking-widest mb-2">
                        {day}
                      </p>
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {entry.activities}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
