"use client";

import { useEffect, useState } from "react";
import {
  deleteTask,
  getTasks,
  streamTasks,
  updateTaskStatus,
  type TaskRecord,
} from "@/lib/api";
import { getStoredUser } from "@/lib/currentUser";
import AddTaskModal from "@/components/dashboard/AddTaskModal";

function formatDueDate(value?: string | null) {
  if (!value) return "No date assigned";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "No date assigned";
  return new Date(year, month - 1, day).toLocaleDateString([], { dateStyle: "medium" });
}

function deadlineTime(value?: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  const [year, month, day] = value.split("-").map(Number);
  const timestamp = new Date(year, month - 1, day).getTime();
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

export default function Tasks() {
  const [userId] = useState(() => getStoredUser()?.id ?? "");
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser?.id) {
      return;
    }
    getTasks(storedUser.id).then(setTasks).catch((loadError: unknown) => {
      setError(loadError instanceof Error ? loadError.message : "Failed to load tasks.");
    });

    return streamTasks({
      userId: storedUser.id,
      onMessage: (nextTasks) => {
        setTasks(nextTasks);
        setError("");
      },
      onError: () => setError("Tasks could not be refreshed."),
    });
  }, []);

  const rankedTasks = [...tasks].sort((first, second) => {
    if (first.status !== second.status) return first.status === "completed" ? 1 : -1;
    return deadlineTime(first.dueDate) - deadlineTime(second.dueDate);
  });

  const completed = tasks.filter((task) => task.status === "completed").length;
  const remaining = tasks.length - completed;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const remainingPriorityById = new Map(
    rankedTasks
      .filter((task) => task.status !== "completed")
      .map((task, index) => [task.id, index + 1]),
  );

  async function toggleTask(task: TaskRecord) {
    try {
      await updateTaskStatus(
        userId,
        task.id,
        task.status === "completed" ? "todo" : "completed",
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update task.");
    }
  }

  async function removeTask(taskId: string) {
    try {
      await deleteTask(userId, taskId);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete task.");
    }
  }

  return (
    <section
      id="task-summary"
      className="h-full overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:rounded-[2rem] sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">Tasks</p>
          <h2 className="mt-2 text-2xl font-semibold">Task summary</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
        >
          + Add Task
        </button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Total tasks", value: tasks.length, color: "text-white" },
          { label: "Completed", value: completed, color: "text-emerald-300" },
          { label: "Remaining", value: remaining, color: "text-amber-300" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 sm:p-4">
            <p className="text-xs text-slate-400 sm:text-sm">{stat.label}</p>
            <p className={`mt-2 text-2xl font-semibold sm:text-3xl ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div
        className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800"
        role="progressbar"
        aria-label="Tasks completed"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={tasks.length}
      >
        <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${progress}%` }} />
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-300">{error}</p>
      )}

      <div className="mt-5 space-y-3">
        {rankedTasks.map((task) => {
          const remainingPriority = remainingPriorityById.get(task.id);

          return (
            <div key={task.id} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <input
                type="checkbox"
                checked={task.status === "completed"}
                onChange={() => toggleTask(task)}
                className="mt-1 h-4 w-4 accent-emerald-400"
                aria-label={`Mark ${task.title} ${task.status === "completed" ? "incomplete" : "complete"}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {remainingPriority !== undefined && (
                    <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-300">
                      Priority {remainingPriority}
                    </span>
                  )}
                  <p className={`font-semibold ${task.status === "completed" ? "text-slate-500 line-through" : "text-white"}`}>
                    {task.title}
                  </p>
                </div>
                {task.description && <p className="mt-1 text-sm text-slate-400">{task.description}</p>}
                <p className="mt-2 text-xs text-cyan-300">{formatDueDate(task.dueDate)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeTask(task.id)}
                className="text-xs text-slate-400 transition hover:text-white"
              >
                Delete
              </button>
            </div>
          );
        })}

        {!tasks.length && (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-center">
            <p className="text-sm text-slate-400">No tasks yet.</p>
          </div>
        )}
      </div>

      {showForm && (
        <AddTaskModal
          userId={userId}
          onClose={() => setShowForm(false)}
          onError={setError}
        />
      )}
    </section>
  );
}
