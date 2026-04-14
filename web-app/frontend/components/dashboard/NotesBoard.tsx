"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  createNote,
  deleteNote,
  getNotes,
  streamNotes,
  type NoteRecord,
} from "@/lib/api";
import { getStoredUser } from "@/lib/currentUser";

function formatDate(value?: string | null) {
  if (!value) {
    return "Just now";
  }

  return new Date(value).toLocaleString();
}

export default function NotesBoard() {
  const [userId, setUserId] = useState("");
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const storedUser = getStoredUser();

    if (!storedUser?.id) {
      return;
    }

    setUserId(storedUser.id);

    async function loadInitialNotes() {
      try {
        const initialNotes = await getNotes(storedUser.id);
        setNotes(initialNotes);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Failed to load notes.",
        );
      }
    }

    loadInitialNotes();

    const closeStream = streamNotes({
      userId: storedUser.id,
      onMessage: (nextNotes) => {
        setNotes(nextNotes);
        setError("");
      },
      onError: () => {},
    });

    return () => {
      closeStream();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!userId) {
      setError("Create a user before adding notes.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Add both a note title and some content.");
      return;
    }

    try {
      setLoading(true);
      await createNote(userId, {
        title: title.trim(),
        content: content.trim(),
      });
      setTitle("");
      setContent("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create note.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(noteId: string) {
    if (!userId) {
      return;
    }

    try {
      await deleteNote(userId, noteId);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete note.",
      );
    }
  }

  return (
    <section
      id="notes-board"
      className="rounded-[2rem] border border-slate-800 bg-slate-900/75 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">
            Notes
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Your notes space
          </h2>
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Note title"
          className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
        />
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write your note here..."
          rows={5}
          className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
        />
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            Keep quick thoughts, reminders, and daily updates close at hand.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Add Note"}
          </button>
        </div>
      </form>

      {error ? (
        <p className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      <div className="mt-8 space-y-4">
        {notes.length ? (
          notes.map((note) => (
            <article
              key={note.id}
              className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {note.title}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {formatDate(note.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(note.id)}
                  className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300 transition hover:border-rose-400 hover:text-rose-200"
                >
                  Delete
                </button>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                {note.content}
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 p-8 text-center text-slate-400">
            No notes yet. Create your first note to start building your space.
          </div>
        )}
      </div>
    </section>
  );
}
