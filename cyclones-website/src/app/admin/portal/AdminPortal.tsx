"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { CoachNote, PlayerGoal, WorkoutPlan, PlayerSummary, WorkoutDay } from "@/lib/types";

interface CoachUser { id: string; email: string; name: string; created_at: string; }
interface PlayerRow { id: string; name: string; position: string; jersey_number: number; bat_hand: string; throw_hand: string; is_active: boolean; }

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getWeekStart(offset = 0): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) + offset * 7;
  const monday = new Date(now);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}

interface Props {
  coachName: string;
  currentUserId: string;
  players: PlayerSummary[];
  accountedPlayerIds: string[];
}

type Tab = "notes" | "goals" | "workout" | "accounts" | "players" | "coaches";

export default function AdminPortal({ coachName, currentUserId, players: initialPlayers, accountedPlayerIds: initialAccountedIds }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [players, setPlayers] = useState<PlayerSummary[]>(initialPlayers);
  const [accountedPlayerIds, setAccountedPlayerIds] = useState<string[]>(initialAccountedIds);
  const [selectedPlayerId, setSelectedPlayerId] = useState(initialPlayers[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<Tab>("notes");

  // Players tab
  const [playerRows, setPlayerRows] = useState<PlayerRow[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerPosition, setNewPlayerPosition] = useState("");
  const [newPlayerJersey, setNewPlayerJersey] = useState("");
  const [newPlayerBat, setNewPlayerBat] = useState("R");
  const [newPlayerThrow, setNewPlayerThrow] = useState("R");
  const [savingPlayer, setSavingPlayer] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editPlayerData, setEditPlayerData] = useState<Partial<PlayerRow>>({});

  // Coaches tab
  const [coaches, setCoaches] = useState<CoachUser[]>([]);
  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [newCoachName, setNewCoachName] = useState("");
  const [newCoachEmail, setNewCoachEmail] = useState("");
  const [newCoachPassword, setNewCoachPassword] = useState("");
  const [savingCoach, setSavingCoach] = useState(false);
  const [coachMsg, setCoachMsg] = useState("");

  // Notes
  const [notes, setNotes] = useState<CoachNote[]>([]);
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState<CoachNote["note_type"]>("note");
  const [isFocus, setIsFocus] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);

  // Goals
  const [goals, setGoals] = useState<PlayerGoal[]>([]);
  const [goalDescription, setGoalDescription] = useState("");
  const [goalDueDate, setGoalDueDate] = useState("");
  const [submittingGoal, setSubmittingGoal] = useState(false);

  // Workout
  const [weekOffset, setWeekOffset] = useState(0);
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [workoutTitle, setWorkoutTitle] = useState("Weekly Workout Plan");
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>(
    DAYS_OF_WEEK.map((day) => ({ day, activities: "" }))
  );
  const [savingWorkout, setSavingWorkout] = useState(false);

  // Accounts
  const [newAccountPlayer, setNewAccountPlayer] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [initialPassword, setInitialPassword] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [accountMessage, setAccountMessage] = useState("");

  const [loadingData, setLoadingData] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  async function loadPlayers() {
    setLoadingPlayers(true);
    const res = await fetch("/api/admin/players");
    const data = await res.json();
    setPlayerRows(data ?? []);
    // Re-sync the selector list with active players
    const active = (data as PlayerRow[]).filter((p) => p.is_active).map((p) => ({ id: p.id, name: p.name, position: p.position, jersey_number: p.jersey_number }));
    setPlayers(active);
    setLoadingPlayers(false);
  }

  async function loadCoaches() {
    setLoadingCoaches(true);
    const res = await fetch("/api/admin/coaches");
    const data = await res.json();
    setCoaches(data ?? []);
    setLoadingCoaches(false);
  }

  async function handleAddPlayer(e: React.FormEvent) {
    e.preventDefault();
    setSavingPlayer(true);
    const res = await fetch("/api/admin/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newPlayerName, position: newPlayerPosition, jersey_number: Number(newPlayerJersey), bat_hand: newPlayerBat, throw_hand: newPlayerThrow }),
    });
    if (res.ok) {
      setNewPlayerName(""); setNewPlayerPosition(""); setNewPlayerJersey("");
      await loadPlayers();
    }
    setSavingPlayer(false);
  }

  async function handleSavePlayerEdit(id: string) {
    const res = await fetch(`/api/admin/players/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editPlayerData),
    });
    if (res.ok) { setEditingPlayerId(null); await loadPlayers(); }
  }

  async function handleRemovePlayer(id: string) {
    if (!confirm("Remove this player from the roster?")) return;
    await fetch(`/api/admin/players/${id}`, { method: "DELETE" });
    await loadPlayers();
  }

  async function handleAddCoach(e: React.FormEvent) {
    e.preventDefault();
    setSavingCoach(true); setCoachMsg("");
    const res = await fetch("/api/admin/coaches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCoachName, email: newCoachEmail, initial_password: newCoachPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setCoachMsg(`✓ Coach added! Login: ${newCoachEmail} / ${newCoachPassword}`);
      setNewCoachName(""); setNewCoachEmail(""); setNewCoachPassword("");
      await loadCoaches();
    } else {
      setCoachMsg(`Error: ${data.error}`);
    }
    setSavingCoach(false);
  }

  async function handleRemoveCoach(id: string) {
    if (!confirm("Remove this coach?")) return;
    const res = await fetch("/api/admin/coaches", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const data = await res.json();
    if (!res.ok) { setCoachMsg(`Error: ${data.error}`); return; }
    await loadCoaches();
  }

  const weekOf = getWeekStart(weekOffset);

  const loadPlayerData = useCallback(async (playerId: string) => {
    if (!playerId) return;
    setLoadingData(true);
    const [notesRes, goalsRes, workoutRes] = await Promise.all([
      fetch(`/api/portal/notes?player_id=${playerId}`),
      fetch(`/api/portal/goals?player_id=${playerId}`),
      fetch(`/api/portal/workouts?player_id=${playerId}&week_of=${weekOf}`),
    ]);
    const [notesData, goalsData, workoutData] = await Promise.all([
      notesRes.json(),
      goalsRes.json(),
      workoutRes.json(),
    ]);
    setNotes(notesData ?? []);
    setGoals(goalsData ?? []);
    if (workoutData?.id) {
      setWorkout(workoutData);
      setWorkoutTitle(workoutData.title);
      setWorkoutDays(
        DAYS_OF_WEEK.map((day) => ({
          day,
          activities: workoutData.days.find((d: WorkoutDay) => d.day === day)?.activities ?? "",
        }))
      );
    } else {
      setWorkout(null);
      setWorkoutTitle("Weekly Workout Plan");
      setWorkoutDays(DAYS_OF_WEEK.map((day) => ({ day, activities: "" })));
    }
    setLoadingData(false);
  }, [weekOf]);

  useEffect(() => {
    loadPlayerData(selectedPlayerId);
  }, [selectedPlayerId, weekOf, loadPlayerData]);

  useEffect(() => {
    if (activeTab === "players") loadPlayers();
    if (activeTab === "coaches") loadCoaches();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function handlePostNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setSubmittingNote(true);
    setFeedbackMsg("");
    const res = await fetch("/api/portal/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_id: selectedPlayerId,
        content: noteContent,
        note_type: noteType,
        is_focus: isFocus,
      }),
    });
    if (res.ok) {
      const newNote = await res.json();
      setNotes((prev) => [newNote, ...prev]);
      setNoteContent("");
      setIsFocus(false);
      setFeedbackMsg("✓ Note posted and email sent to parent.");
    } else {
      setFeedbackMsg("Failed to post note. Please try again.");
    }
    setSubmittingNote(false);
  }

  async function handleAddGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!goalDescription.trim()) return;
    setSubmittingGoal(true);
    const res = await fetch("/api/portal/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_id: selectedPlayerId,
        description: goalDescription,
        due_date: goalDueDate || null,
      }),
    });
    if (res.ok) {
      const newGoal = await res.json();
      setGoals((prev) => [newGoal, ...prev]);
      setGoalDescription("");
      setGoalDueDate("");
    }
    setSubmittingGoal(false);
  }

  async function handleMarkGoalComplete(goalId: string) {
    const res = await fetch(`/api/portal/goals/${goalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_complete: true }),
    });
    if (res.ok) {
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, is_complete: true } : g))
      );
    }
  }

  async function handleSaveWorkout(e: React.FormEvent) {
    e.preventDefault();
    setSavingWorkout(true);
    const res = await fetch("/api/portal/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_id: selectedPlayerId,
        week_of: weekOf,
        title: workoutTitle,
        days: workoutDays,
      }),
    });
    if (res.ok) {
      const saved = await res.json();
      setWorkout(saved);
      setFeedbackMsg("✓ Workout plan saved.");
    }
    setSavingWorkout(false);
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setCreatingAccount(true);
    setAccountMessage("");
    const res = await fetch("/api/admin/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_id: newAccountPlayer,
        parent_name: parentName,
        parent_email: parentEmail,
        initial_password: initialPassword,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setAccountMessage(`✓ Account created! Login: ${parentEmail} / ${initialPassword}`);
      setParentName("");
      setParentEmail("");
      setInitialPassword("");
      setNewAccountPlayer("");
      setAccountedPlayerIds((prev) => [...prev, newAccountPlayer]);
      router.refresh();
    } else {
      setAccountMessage(`Error: ${data.error ?? "Failed to create account"}`);
    }
    setCreatingAccount(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/portal/login");
    router.refresh();
  }

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);
  const unaccountedPlayers = players.filter((p) => !accountedPlayerIds.includes(p.id));
  const pendingGoals = goals.filter((g) => !g.is_complete);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-cyclone-green text-sm font-semibold uppercase tracking-widest mb-1">
              Coach Portal
            </p>
            <h1 className="text-3xl font-extrabold text-white">Admin Panel</h1>
            <p className="text-gray-400 text-sm mt-1">Logged in as {coachName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg hover:border-gray-500 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Player Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Player
          </label>
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="form-input"
          >
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.jersey_number} {p.name} — {p.position}
                {!accountedPlayerIds.includes(p.id) ? " (no account)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Feedback */}
        {feedbackMsg && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm border ${
            feedbackMsg.startsWith("✓")
              ? "bg-cyclone-green/10 border-cyclone-green/30 text-cyclone-green"
              : "bg-red-900/30 border-red-700 text-red-300"
          }`}>
            {feedbackMsg}
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex gap-1 mb-6 bg-surface rounded-xl p-1">
          {(["notes", "goals", "workout", "accounts", "players", "coaches"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setFeedbackMsg(""); }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg capitalize transition-colors ${
                activeTab === tab
                  ? "bg-cyclone-green text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loadingData && (
          <p className="text-gray-500 text-sm text-center py-6">Loading…</p>
        )}

        {/* ── Notes Tab ── */}
        {activeTab === "notes" && !loadingData && (
          <div className="space-y-6">
            {/* Post new note */}
            <form onSubmit={handlePostNote} className="bg-surface border border-cyclone-green/20 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-cyclone-yellow">
                Post a Note for {selectedPlayer?.name}
              </h2>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Type</label>
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as CoachNote["note_type"])}
                    className="form-input text-sm"
                  >
                    <option value="note">Note</option>
                    <option value="focus">Focus Area</option>
                    <option value="praise">Praise</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
                <div className="flex items-end gap-2 pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFocus}
                      onChange={(e) => setIsFocus(e.target.checked)}
                      className="w-4 h-4 accent-cyclone-yellow"
                    />
                    <span className="text-sm text-gray-300">Pin as focus</span>
                  </label>
                </div>
              </div>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="form-input min-h-[120px] resize-y"
                placeholder="Write your note here… (parent will be notified by email)"
                required
              />
              <button
                type="submit"
                disabled={submittingNote}
                className="w-full py-2.5 bg-cyclone-green text-black font-bold rounded-lg hover:bg-cyclone-green-600 transition-colors disabled:opacity-50"
              >
                {submittingNote ? "Posting…" : "Post Note & Notify Parent"}
              </button>
            </form>

            {/* Existing notes */}
            <div className="space-y-3">
              {notes.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No notes yet.</p>
              )}
              {notes.map((note) => (
                <div key={note.id} className="bg-surface border border-gray-800 rounded-xl p-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      {note.note_type}{note.is_focus ? " ⭐" : ""}
                    </span>
                    <span className="text-xs text-gray-600">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Goals Tab ── */}
        {activeTab === "goals" && !loadingData && (
          <div className="space-y-6">
            {/* Add goal */}
            <form onSubmit={handleAddGoal} className="bg-surface border border-cyclone-green/20 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-cyclone-yellow">
                Add Goal for {selectedPlayer?.name}
              </h2>
              <input
                type="text"
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                className="form-input"
                placeholder="e.g. Throw 10 accurate 30-foot throws in a row"
                required
              />
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Due Date (optional)
                </label>
                <input
                  type="date"
                  value={goalDueDate}
                  onChange={(e) => setGoalDueDate(e.target.value)}
                  className="form-input"
                />
              </div>
              <button
                type="submit"
                disabled={submittingGoal}
                className="w-full py-2.5 bg-cyclone-green text-black font-bold rounded-lg hover:bg-cyclone-green-600 transition-colors disabled:opacity-50"
              >
                {submittingGoal ? "Adding…" : "Add Goal"}
              </button>
            </form>

            {/* Goal list */}
            <div className="space-y-3">
              {pendingGoals.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No active goals.</p>
              )}
              {pendingGoals.map((goal) => (
                <div key={goal.id} className="bg-surface border border-gray-800 rounded-xl p-4 flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-white text-sm">{goal.description}</p>
                    <div className="flex gap-4 mt-1">
                      {goal.due_date && (
                        <span className="text-xs text-gray-500">Due: {new Date(goal.due_date).toLocaleDateString()}</span>
                      )}
                      {goal.acknowledged && (
                        <span className="text-xs text-cyclone-green font-semibold">✓ Player acknowledged</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleMarkGoalComplete(goal.id)}
                    className="text-xs border border-gray-700 text-gray-400 hover:border-cyclone-green hover:text-cyclone-green px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
                  >
                    Mark done
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Workout Tab ── */}
        {activeTab === "workout" && !loadingData && (
          <form onSubmit={handleSaveWorkout} className="space-y-5">
            {/* Week nav */}
            <div className="flex items-center justify-between bg-surface border border-gray-800 rounded-xl px-4 py-3">
              <button type="button" onClick={() => setWeekOffset((o) => o - 1)}
                className="text-gray-400 hover:text-white px-2">‹ Prev</button>
              <span className="text-sm text-white font-medium">
                Week of{" "}
                {new Date(weekOf + "T00:00:00").toLocaleDateString("en-US", {
                  month: "long", day: "numeric", year: "numeric",
                })}
              </span>
              <button type="button" onClick={() => setWeekOffset((o) => o + 1)}
                className="text-gray-400 hover:text-white px-2">Next ›</button>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Plan Title</label>
              <input
                type="text"
                value={workoutTitle}
                onChange={(e) => setWorkoutTitle(e.target.value)}
                className="form-input"
                placeholder="Weekly Workout Plan"
              />
            </div>

            {DAYS_OF_WEEK.map((day, i) => (
              <div key={day}>
                <label className="block text-xs font-bold uppercase tracking-widest text-cyclone-green mb-1">
                  {day}
                </label>
                <textarea
                  value={workoutDays[i]?.activities ?? ""}
                  onChange={(e) => {
                    const updated = [...workoutDays];
                    updated[i] = { day, activities: e.target.value };
                    setWorkoutDays(updated);
                  }}
                  className="form-input resize-none min-h-[72px]"
                  placeholder={`${day} activities (leave blank for rest day)`}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={savingWorkout}
              className="w-full py-3 bg-cyclone-green text-black font-bold rounded-lg hover:bg-cyclone-green-600 transition-colors disabled:opacity-50"
            >
              {savingWorkout ? "Saving…" : workout ? "Update Workout Plan" : "Save Workout Plan"}
            </button>
          </form>
        )}

        {/* ── Players Tab ── */}
        {activeTab === "players" && (
          <div className="space-y-6">
            {/* Add Player Form */}
            <form onSubmit={handleAddPlayer} className="bg-surface border border-cyclone-green/20 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-cyclone-yellow">Add Player to Roster</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Full Name</label>
                  <input type="text" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)}
                    className="form-input" placeholder="First Last" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Position</label>
                  <input type="text" value={newPlayerPosition} onChange={(e) => setNewPlayerPosition(e.target.value)}
                    className="form-input" placeholder="SS, P, C…" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Jersey #</label>
                  <input type="number" value={newPlayerJersey} onChange={(e) => setNewPlayerJersey(e.target.value)}
                    className="form-input" placeholder="0" min={0} max={99} required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Bats</label>
                  <select value={newPlayerBat} onChange={(e) => setNewPlayerBat(e.target.value)} className="form-input">
                    <option value="R">Right</option>
                    <option value="L">Left</option>
                    <option value="S">Switch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Throws</label>
                  <select value={newPlayerThrow} onChange={(e) => setNewPlayerThrow(e.target.value)} className="form-input">
                    <option value="R">Right</option>
                    <option value="L">Left</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={savingPlayer}
                className="w-full py-2.5 bg-cyclone-green text-black font-bold rounded-lg hover:bg-cyclone-green-600 transition-colors disabled:opacity-50">
                {savingPlayer ? "Adding…" : "Add Player"}
              </button>
            </form>

            {/* Roster List */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
                Current Roster ({playerRows.filter((p) => p.is_active).length} active)
              </h2>
              {loadingPlayers ? (
                <p className="text-gray-500 text-sm text-center py-6">Loading…</p>
              ) : (
                <div className="space-y-2">
                  {playerRows.map((p) => (
                    <div key={p.id} className={`rounded-xl border p-4 ${p.is_active ? "border-gray-700 bg-surface/50" : "border-gray-800 bg-black/20 opacity-50"}`}>
                      {editingPlayerId === p.id ? (
                        /* Inline edit form */
                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2">
                            <input type="text" value={editPlayerData.name ?? p.name}
                              onChange={(e) => setEditPlayerData((d) => ({ ...d, name: e.target.value }))}
                              className="form-input text-sm" placeholder="Name" />
                          </div>
                          <input type="text" value={editPlayerData.position ?? p.position}
                            onChange={(e) => setEditPlayerData((d) => ({ ...d, position: e.target.value }))}
                            className="form-input text-sm" placeholder="Position" />
                          <input type="number" value={editPlayerData.jersey_number ?? p.jersey_number}
                            onChange={(e) => setEditPlayerData((d) => ({ ...d, jersey_number: Number(e.target.value) }))}
                            className="form-input text-sm" placeholder="#" min={0} max={99} />
                          <select value={editPlayerData.bat_hand ?? p.bat_hand}
                            onChange={(e) => setEditPlayerData((d) => ({ ...d, bat_hand: e.target.value }))}
                            className="form-input text-sm">
                            <option value="R">Bats R</option>
                            <option value="L">Bats L</option>
                            <option value="S">Switch</option>
                          </select>
                          <select value={editPlayerData.throw_hand ?? p.throw_hand}
                            onChange={(e) => setEditPlayerData((d) => ({ ...d, throw_hand: e.target.value }))}
                            className="form-input text-sm">
                            <option value="R">Throws R</option>
                            <option value="L">Throws L</option>
                          </select>
                          <div className="col-span-2 flex gap-2 mt-1">
                            <button onClick={() => handleSavePlayerEdit(p.id)}
                              className="flex-1 py-1.5 bg-cyclone-green text-black text-xs font-bold rounded-lg hover:bg-cyclone-green-600">
                              Save
                            </button>
                            <button onClick={() => setEditingPlayerId(null)}
                              className="flex-1 py-1.5 bg-gray-700 text-white text-xs font-bold rounded-lg hover:bg-gray-600">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Read view */
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">
                              #{p.jersey_number} {p.name}
                              {!p.is_active && <span className="ml-2 text-xs text-gray-600">(inactive)</span>}
                            </p>
                            <p className="text-xs text-gray-400">{p.position} · Bats {p.bat_hand} / Throws {p.throw_hand}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => { setEditingPlayerId(p.id); setEditPlayerData({}); }}
                              className="text-xs px-3 py-1.5 border border-gray-600 text-gray-300 rounded-lg hover:border-cyclone-green hover:text-cyclone-green transition-colors">
                              Edit
                            </button>
                            {p.is_active && (
                              <button onClick={() => handleRemovePlayer(p.id)}
                                className="text-xs px-3 py-1.5 border border-red-700 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors">
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Coaches Tab ── */}
        {activeTab === "coaches" && (
          <div className="space-y-6">
            {/* Add Coach Form */}
            <form onSubmit={handleAddCoach} className="bg-surface border border-cyclone-green/20 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-cyclone-yellow">Add Coach Account</h2>

              {coachMsg && (
                <div className={`px-4 py-3 rounded-lg text-sm border ${
                  coachMsg.startsWith("✓")
                    ? "bg-cyclone-green/10 border-cyclone-green/30 text-cyclone-green"
                    : "bg-red-900/30 border-red-700 text-red-300"
                }`}>
                  {coachMsg}
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-400 mb-1">Coach Name</label>
                <input type="text" value={newCoachName} onChange={(e) => setNewCoachName(e.target.value)}
                  className="form-input" placeholder="Coach Smith" required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Email</label>
                <input type="email" value={newCoachEmail} onChange={(e) => setNewCoachEmail(e.target.value)}
                  className="form-input" placeholder="coach@email.com" required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Initial Password</label>
                <input type="text" value={newCoachPassword} onChange={(e) => setNewCoachPassword(e.target.value)}
                  className="form-input" placeholder="e.g. CoachLogin2026" minLength={8} required />
              </div>
              <button type="submit" disabled={savingCoach}
                className="w-full py-2.5 bg-cyclone-green text-black font-bold rounded-lg hover:bg-cyclone-green-600 transition-colors disabled:opacity-50">
                {savingCoach ? "Adding…" : "Add Coach"}
              </button>
            </form>

            {/* Coaches List */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
                Current Coaches ({coaches.length})
              </h2>
              {loadingCoaches ? (
                <p className="text-gray-500 text-sm text-center py-6">Loading…</p>
              ) : (
                <div className="space-y-2">
                  {coaches.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-xl border border-gray-700 bg-surface/50 p-4">
                      <div>
                        <p className="font-semibold text-white">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </div>
                      {c.id === currentUserId ? (
                        <span className="text-xs text-cyclone-green font-semibold px-3">You</span>
                      ) : (
                        <button onClick={() => handleRemoveCoach(c.id)}
                          className="text-xs px-3 py-1.5 border border-red-700 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors">
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Accounts Tab ── */}
        {activeTab === "accounts" && (
          <div className="space-y-6">
            <form onSubmit={handleCreateAccount} className="bg-surface border border-cyclone-green/20 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-cyclone-yellow">
                Create Player Portal Account
              </h2>

              {accountMessage && (
                <div className={`px-4 py-3 rounded-lg text-sm border ${
                  accountMessage.startsWith("✓")
                    ? "bg-cyclone-green/10 border-cyclone-green/30 text-cyclone-green"
                    : "bg-red-900/30 border-red-700 text-red-300"
                }`}>
                  {accountMessage}
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-400 mb-1">Player</label>
                <select
                  value={newAccountPlayer}
                  onChange={(e) => setNewAccountPlayer(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">— Select player —</option>
                  {unaccountedPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.jersey_number} {p.name}
                    </option>
                  ))}
                </select>
                {unaccountedPlayers.length === 0 && (
                  <p className="text-gray-500 text-xs mt-1">All players have accounts.</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Parent Name</label>
                <input type="text" value={parentName} onChange={(e) => setParentName(e.target.value)}
                  className="form-input" placeholder="Jane Smith" required />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Parent Email (login email)</label>
                <input type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)}
                  className="form-input" placeholder="parent@email.com" required />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Initial Password</label>
                <input type="text" value={initialPassword} onChange={(e) => setInitialPassword(e.target.value)}
                  className="form-input" placeholder="e.g. Cyclones2026" minLength={8} required />
                <p className="text-gray-600 text-xs mt-1">
                  Share this with the parent — they can change it after logging in.
                </p>
              </div>

              <button
                type="submit"
                disabled={creatingAccount || unaccountedPlayers.length === 0}
                className="w-full py-2.5 bg-cyclone-green text-black font-bold rounded-lg hover:bg-cyclone-green-600 transition-colors disabled:opacity-50"
              >
                {creatingAccount ? "Creating…" : "Create Account"}
              </button>
            </form>

            {/* Existing accounts summary */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
                Players with Accounts ({accountedPlayerIds.length}/{players.length})
              </h2>
              <div className="space-y-2">
                {players.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-800">
                    <span className="text-gray-300">#{p.jersey_number} {p.name}</span>
                    {accountedPlayerIds.includes(p.id) ? (
                      <span className="text-cyclone-green text-xs font-semibold">✓ Active</span>
                    ) : (
                      <span className="text-gray-600 text-xs">No account</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
