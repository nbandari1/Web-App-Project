"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clearCurrentUserEmail, getCurrentUserEmail, getLatestUserEmail } from "@/lib/api";

type TabKey = "tasks" | "notes";

type TaskPriority = "Low" | "Medium" | "High";

type Task = {
  id: string;
  title: string;
  dueDate?: string;
  priority: TaskPriority;
  category: "Steam" | "MAL" | "Spotify" | "General";
  notes?: string;
  completed: boolean;
  createdAt: number;
};

type NoteColor = "amber" | "violet" | "emerald" | "sky" | "pink" | "slate";

type Note = {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  createdAt: number;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  const first = parts[0]?.[0] ?? "U";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
}

function emailToUsername(email: string) {
  const prefix = email.split("@")[0] || "User";
  return prefix;
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

const LS_TASKS = "activityTracker.tasks.v1";
const LS_NOTES = "activityTracker.notes.v1";

export default function DashboardPage() {
  const router = useRouter();

  const [username, setUsername] = useState<string>("User");
  const [activeTab, setActiveTab] = useState<TabKey>("tasks");

  // Tasks state (lazy init from localStorage)
  const [tasks, setTasks] = useState<Task[]>(() => loadJson<Task[]>(LS_TASKS, []));
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskDraft, setTaskDraft] = useState<Omit<Task, "id" | "createdAt" | "completed">>({
    title: "",
    dueDate: "",
    priority: "Medium",
    category: "General",
    notes: "",
  });

  // Notes state (lazy init from localStorage)
  const [notes, setNotes] = useState<Note[]>(() => loadJson<Note[]>(LS_NOTES, []));
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(() => {
    const initialNotes = loadJson<Note[]>(LS_NOTES, []);
    return initialNotes[0]?.id ?? null;
  });
  const [noteDraft, setNoteDraft] = useState<Omit<Note, "id" | "createdAt">>({
    title: "",
    content: "",
    color: "amber",
  });

  useEffect(() => {
    // Username should reflect the active/"logged in" user.
    // We keep it simple here: read from localStorage (set on login/signup).
    // Fallback: latest user from backend (useful during dev).
    let cancelled = false;

    (async () => {
      try {
        const localEmail = getCurrentUserEmail();
        if (!cancelled && localEmail) {
          setUsername(emailToUsername(localEmail));
          return;
        }

        const email = await getLatestUserEmail();
        if (!cancelled && email) setUsername(emailToUsername(email));
      } catch {
        // ignore for now
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    saveJson(LS_TASKS, tasks);
  }, [tasks]);

  useEffect(() => {
    saveJson(LS_NOTES, notes);
  }, [notes]);

  const initials = useMemo(() => getInitials(username), [username]);

  const selectedNote = useMemo(() => {
    // Keep the user's selection when possible, otherwise fall back to first note.
    const effectiveId = selectedNoteId && notes.some((n) => n.id === selectedNoteId) ? selectedNoteId : notes[0]?.id;
    return (effectiveId ? notes.find((n) => n.id === effectiveId) : null) ?? null;
  }, [notes, selectedNoteId]);

  function createTask() {
    if (!taskDraft.title.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: taskDraft.title.trim(),
      dueDate: taskDraft.dueDate?.trim() || undefined,
      priority: taskDraft.priority,
      category: taskDraft.category,
      notes: taskDraft.notes?.trim() || undefined,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setTaskModalOpen(false);
    setTaskDraft({ title: "", dueDate: "", priority: "Medium", category: "General", notes: "" });
  }

  function toggleTaskComplete(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function createNote() {
    if (!noteDraft.title.trim()) return;
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: noteDraft.title.trim(),
      content: noteDraft.content.trim(),
      color: noteDraft.color,
      createdAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    setNoteModalOpen(false);
    setNoteDraft({ title: "", content: "", color: "amber" });
  }

  function handleLogout() {
    clearCurrentUserEmail();
    router.push("/");
  }

  const noteColorStyles: Record<NoteColor, { dot: string; card: string; ring: string; text: string }> = {
    amber: { dot: "bg-amber-400", card: "bg-amber-500/10", ring: "ring-amber-400/20", text: "text-amber-200" },
    violet: { dot: "bg-violet-500", card: "bg-violet-500/10", ring: "ring-violet-500/20", text: "text-violet-200" },
    emerald: { dot: "bg-emerald-400", card: "bg-emerald-500/10", ring: "ring-emerald-400/20", text: "text-emerald-200" },
    sky: { dot: "bg-sky-400", card: "bg-sky-500/10", ring: "ring-sky-400/20", text: "text-sky-200" },
    pink: { dot: "bg-pink-500", card: "bg-pink-500/10", ring: "ring-pink-500/20", text: "text-pink-200" },
    slate: { dot: "bg-slate-500", card: "bg-slate-500/10", ring: "ring-slate-400/20", text: "text-slate-200" },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-70 flex-col border-r border-slate-800 bg-slate-950/40 px-4 py-5 backdrop-blur lg:flex">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 to-indigo-500 text-sm font-semibold">
              AT
            </div>
            <div className="text-lg font-semibold tracking-tight">ActivityTracker</div>
          </div>

          <nav className="mt-8 flex flex-1 flex-col gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("tasks")}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                activeTab === "tasks"
                  ? "bg-violet-500/10 text-violet-200 ring-1 ring-violet-500/20"
                  : "text-slate-300 hover:bg-slate-900/40"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/60 ring-1 ring-slate-800">
                  ✓
                </span>
                Tasks
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                activeTab === "notes"
                  ? "bg-violet-500/10 text-violet-200 ring-1 ring-violet-500/20"
                  : "text-slate-300 hover:bg-slate-900/40"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/60 ring-1 ring-slate-800">
                  ✎
                </span>
                Notes
              </span>
            </button>

            <div className="my-2 border-t border-slate-800/60" />

            {/* Quick actions */}
            <button
              type="button"
              onClick={() => setTaskModalOpen(true)}
              className="rounded-xl bg-violet-600 px-3 py-2.5 text-sm font-medium hover:bg-violet-500"
            >
              + Task
            </button>
            <button
              type="button"
              onClick={() => setNoteModalOpen(true)}
              className="rounded-xl bg-amber-500 px-3 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400"
            >
              + Note
            </button>
          </nav>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/45 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-slate-100">{username}</div>
                <div className="truncate text-xs text-slate-400">signed in</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full rounded-xl border border-slate-800 bg-slate-950/20 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900/60"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/50 backdrop-blur">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Good evening, {username}</h1>
                <p className="mt-1 text-sm text-slate-400">Tasks & Notes</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("tasks")}
                  className={`rounded-xl px-4 py-2 text-sm ring-1 transition ${
                    activeTab === "tasks"
                      ? "bg-violet-500/15 text-violet-200 ring-violet-500/20"
                      : "bg-slate-900/40 text-slate-200 ring-slate-800 hover:bg-slate-900/70"
                  }`}
                >
                  Tasks
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("notes")}
                  className={`rounded-xl px-4 py-2 text-sm ring-1 transition ${
                    activeTab === "notes"
                      ? "bg-violet-500/15 text-violet-200 ring-violet-500/20"
                      : "bg-slate-900/40 text-slate-200 ring-slate-800 hover:bg-slate-900/70"
                  }`}
                >
                  Notes
                </button>

                <div className="ml-2 hidden items-center gap-2 sm:flex">
                  <button
                    type="button"
                    onClick={() => setTaskModalOpen(true)}
                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-500"
                  >
                    + Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoteModalOpen(true)}
                    className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
                  >
                    + Note
                  </button>
                </div>

                <button
                  className="ml-1 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-slate-300 hover:bg-slate-900/70"
                  title="Notifications"
                >
                  🔔
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="ml-2 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900/70"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl px-6 py-8">
            {/* Mobile quick actions */}
            <div className="mb-6 flex gap-2 sm:hidden">
              <button
                type="button"
                onClick={() => setTaskModalOpen(true)}
                className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium hover:bg-violet-500"
              >
                + Task
              </button>
              <button
                type="button"
                onClick={() => setNoteModalOpen(true)}
                className="flex-1 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400"
              >
                + Note
              </button>
            </div>

            {activeTab === "tasks" ? (
              <section className="rounded-3xl border border-slate-800 bg-slate-900/35 p-5 shadow-xl shadow-black/20 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Tasks</h2>
                    <p className="mt-1 text-sm text-slate-400">Create tasks and keep track of what matters.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tasks")}
                    className="rounded-xl border border-slate-800 bg-slate-950/20 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900/60"
                  >
                    Dashboard
                  </button>
                </div>

                <div className="mt-6 space-y-3">
                  {tasks.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/20 p-6 text-sm text-slate-400">
                      No tasks yet. Click <span className="text-slate-200">+ Task</span> to create one.
                    </div>
                  ) : (
                    tasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-950/20 p-4"
                      >
                        <button
                          type="button"
                          aria-label="Toggle task"
                          onClick={() => toggleTaskComplete(t.id)}
                          className={`mt-1 h-5 w-5 rounded-full border ${
                            t.completed ? "border-emerald-400 bg-emerald-400/20" : "border-slate-600"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div
                            className={`truncate text-sm font-medium ${
                              t.completed ? "text-slate-500 line-through" : "text-slate-100"
                            }`}
                          >
                            {t.title}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            {t.dueDate ? <span>Due: {t.dueDate}</span> : <span>No due date</span>}
                            <span className="text-slate-700">•</span>
                            <span>{t.category}</span>
                            <span className="text-slate-700">•</span>
                            <span
                              className={`rounded-full px-2 py-0.5 ring-1 ${
                                t.priority === "High"
                                  ? "bg-red-500/15 text-red-200 ring-red-500/20"
                                  : t.priority === "Medium"
                                    ? "bg-amber-500/15 text-amber-200 ring-amber-500/20"
                                    : "bg-sky-500/15 text-sky-200 ring-sky-500/20"
                              }`}
                            >
                              {t.priority}
                            </span>
                          </div>
                          {t.notes ? (
                            <div className="mt-2 text-sm text-slate-400">{t.notes}</div>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            ) : (
              <section className="grid gap-6 lg:grid-cols-3">
                {/* Notes grid */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">Notes</h2>
                      <p className="mt-1 text-sm text-slate-400">Click a note to see it on the side.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("tasks")}
                      className="rounded-xl border border-slate-800 bg-slate-950/20 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900/60"
                    >
                      Dashboard
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {notes.length === 0 ? (
                      <div className="sm:col-span-2 xl:col-span-3 rounded-2xl border border-slate-800 bg-slate-950/20 p-6 text-sm text-slate-400">
                        No notes yet. Click <span className="text-slate-200">+ Note</span> to create one.
                      </div>
                    ) : (
                      notes.map((n) => {
                        const c = noteColorStyles[n.color];
                        const selected = n.id === selectedNoteId;
                        const btnClass = [
                          "text-left rounded-3xl border border-slate-800 p-5 shadow-xl shadow-black/20 backdrop-blur transition",
                          selected ? `ring-2 ${c.ring}` : "hover:bg-slate-900/30",
                          c.card,
                        ].join(" ");
                        return (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => setSelectedNoteId(n.id)}
                            className={btnClass}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
                                <span className={`text-xs font-medium ${c.text}`}>Just added</span>
                              </div>
                              <span className="text-xs text-slate-500">×</span>
                            </div>
                            <div className="mt-4 text-base font-semibold">{n.title}</div>
                            <div className="mt-2 line-clamp-3 text-sm text-slate-300/80">
                              {n.content || "(No content)"}
                            </div>
                            <div className="mt-6 border-t border-white/5 pt-4 text-xs text-slate-500">Just now</div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Side view: recent/selected note */}
                <aside className="rounded-3xl border border-slate-800 bg-slate-900/35 p-5 shadow-xl shadow-black/20 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold">Recent Note</div>
                      <div className="mt-1 text-sm text-slate-400">Selected note preview</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNoteModalOpen(true)}
                      className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
                    >
                      + Note
                    </button>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/20 p-4">
                    {selectedNote ? (
                      <>
                        <div className="text-sm font-semibold">{selectedNote.title}</div>
                        <div className="mt-2 whitespace-pre-wrap text-sm text-slate-300/90">
                          {selectedNote.content || "(No content)"}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-slate-400">No note selected.</div>
                    )}
                  </div>
                </aside>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* Task modal (layout + working) */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xl font-semibold">Create New Task</div>
                <div className="mt-1 text-sm text-slate-400">Add a task to your activity tracker</div>
              </div>
              <button
                type="button"
                onClick={() => setTaskModalOpen(false)}
                className="rounded-xl px-3 py-2 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm text-slate-300">Task Title *</label>
                <input
                  value={taskDraft.title}
                  onChange={(e) => setTaskDraft((p) => ({ ...p, title: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-100"
                  placeholder="e.g. Review Steam playtime report"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Due Date</label>
                <input
                  value={taskDraft.dueDate || ""}
                  onChange={(e) => setTaskDraft((p) => ({ ...p, dueDate: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-100"
                  placeholder="dd-mm-yyyy"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Priority</label>
                <select
                  value={taskDraft.priority}
                  onChange={(e) => setTaskDraft((p) => ({ ...p, priority: e.target.value as TaskPriority }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-100"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm text-slate-300">Category Tag</label>
                <div className="flex flex-wrap gap-2">
                  {(["Steam", "MAL", "Spotify", "General"] as const).map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setTaskDraft((p) => ({ ...p, category: c }))}
                      className={`rounded-xl px-3 py-2 text-sm ring-1 transition ${
                        taskDraft.category === c
                          ? "bg-violet-500/15 text-violet-200 ring-violet-500/20"
                          : "bg-slate-950/10 text-slate-300 ring-slate-800 hover:bg-slate-900/40"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm text-slate-300">Notes (optional)</label>
                <textarea
                  value={taskDraft.notes || ""}
                  onChange={(e) => setTaskDraft((p) => ({ ...p, notes: e.target.value }))}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-100"
                  placeholder="Add any additional context or details..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setTaskModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950/20 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-900/60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createTask}
                className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold hover:bg-violet-500"
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note modal (layout + working) */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xl font-semibold">New Sticky Note</div>
                <div className="mt-1 text-sm text-slate-400">Pin a quick note to your dashboard</div>
              </div>
              <button
                type="button"
                onClick={() => setNoteModalOpen(false)}
                className="rounded-xl px-3 py-2 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <div className="mb-2 text-sm text-slate-300">Note Color</div>
                <div className="flex gap-2">
                  {(Object.keys(noteColorStyles) as NoteColor[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNoteDraft((p) => ({ ...p, color: c }))}
                      className={`h-8 w-8 rounded-lg ${noteColorStyles[c].dot} ring-2 transition ${
                        noteDraft.color === c ? "ring-white/40" : "ring-white/10"
                      }`}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Title *</label>
                <input
                  value={noteDraft.title}
                  onChange={(e) => setNoteDraft((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Anime to watch next season"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Content</label>
                <textarea
                  value={noteDraft.content}
                  onChange={(e) => setNoteDraft((p) => ({ ...p, content: e.target.value }))}
                  placeholder="Write your note here..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600"
                />
              </div>

              <div>
                <div className="mb-2 text-sm text-slate-300">Preview</div>
                <div
                  className={`rounded-2xl border border-slate-800 p-4 ring-1 ${
                    noteColorStyles[noteDraft.color].ring
                  } ${noteColorStyles[noteDraft.color].card}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${noteColorStyles[noteDraft.color].dot}`} />
                    <div className="text-sm font-semibold">{noteDraft.title || "Your note title"}</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-400">
                    {noteDraft.content || "Your note content will appear here..."}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setNoteModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-950/20 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-900/60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={createNote}
                  className="flex-1 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400"
                >
                  Pin Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
