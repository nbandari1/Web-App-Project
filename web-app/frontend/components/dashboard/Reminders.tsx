"use client";

import { useEffect, useState } from "react";
import { getTasks, streamTasks, type TaskRecord } from "@/lib/api";
import { getStoredUser } from "@/lib/currentUser";

function parseDeadline(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDeadline(value: string) {
  const deadline = parseDeadline(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const difference = Math.round((deadline.getTime() - today.getTime()) / 86400000);
  if (difference < 0) return `${Math.abs(difference)} day${Math.abs(difference) === 1 ? "" : "s"} overdue`;
  if (difference === 0) return "Due today";
  if (difference === 1) return "Due tomorrow";
  return `Due in ${difference} days`;
}

export default function Reminders() {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser?.id) {
      return;
    }

    getTasks(storedUser.id).then(setTasks).catch((loadError: unknown) => {
      setError(loadError instanceof Error ? loadError.message : "Failed to load reminders.");
    });

    return streamTasks({
      userId: storedUser.id,
      onMessage: (nextTasks) => {
        setTasks(nextTasks);
        setError("");
      },
      onError: () => setError("Reminders could not be refreshed."),
    });
  }, []);

  const rankedReminders = tasks
    .filter((task) => task.status !== "completed")
    .sort((first, second) => {
      if (!first.dueDate && !second.dueDate) return 0;
      if (!first.dueDate) return 1;
      if (!second.dueDate) return -1;
      return parseDeadline(first.dueDate).getTime() - parseDeadline(second.dueDate).getTime();
    })
    .slice(0, 6);

  return (
    <section className="h-full overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">Upcoming</p>
        <h2 className="mt-2 text-2xl font-semibold">Reminders</h2>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-300">{error}</p>
      )}

      {rankedReminders.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-5 text-sm text-slate-400">
          No remaining tasks.
        </p>
      ) : (
        <ol className="mt-5 space-y-3">
          {rankedReminders.map((task, index) => (
            <li key={task.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-xs font-semibold text-cyan-300">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{task.title}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {task.dueDate ? formatDeadline(task.dueDate) : "No deadline"}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
