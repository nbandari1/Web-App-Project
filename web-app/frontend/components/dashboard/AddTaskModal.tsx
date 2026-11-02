"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createTask } from "@/lib/api";

type Props = {
  userId: string;
  onClose: () => void;
  onError: (message: string) => void;
};

function getTodayValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AddTaskModal({ userId, onClose, onError }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(getTodayValue());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!userId) {
      setError("Create a user before adding tasks.");
      return;
    }
    if (!title.trim()) {
      setError("Add a task title.");
      return;
    }

    try {
      setSaving(true);
      await createTask(userId, {
        title: title.trim(),
        description: description.trim(),
        dueDate,
      });
      onClose();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to create task.";
      setError(message);
      onError(message);
    } finally {
      setSaving(false);
    }
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-task-title"
        className="grid w-full max-w-md gap-3 rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-2xl shadow-black/60 sm:p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">New task</p>
            <h3 id="add-task-title" className="mt-1 text-xl font-semibold text-white">Add Task</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close add task dialog"
          >
            ×
          </button>
        </div>

        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Task name"
          autoFocus
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
        />
        <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
          Complete by
          <input
            type="date"
            min={getTodayValue()}
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-normal normal-case text-white outline-none focus:border-cyan-400"
          />
        </label>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Create Task"}
        </button>
      </form>
    </div>,
    document.body,
  );
}
