"use client";

import { useState } from "react";

export default function SettingsModal() {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [steamActive, setSteamActive] = useState(false);
  const [malActive, setMalActive] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-900/90"
      >
        <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 3 12.9H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        Settings
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Settings</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">App options</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Adjust your dashboard preferences and connected services.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/90 text-slate-300 transition hover:bg-slate-900"
                aria-label="Close settings"
              >
                ×
              </button>
            </div>

            <div className="mt-8 space-y-5">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Dark Mode</p>
                    <p className="mt-1 text-sm text-slate-400">Enabled by default for the dashboard.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDarkMode((value) => !value)}
                    className={`h-10 w-20 rounded-full ${darkMode ? "bg-cyan-400" : "bg-slate-700"} p-1 transition`}
                  >
                    <span className={`block h-8 w-8 rounded-full bg-white shadow-sm transition ${darkMode ? "translate-x-10" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-950/80 px-5 py-4 text-left text-white transition hover:bg-slate-900"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-cyan-300">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M2 12h9" />
                      <path d="M12 4h9" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-semibold">Steam</p>
                    <p className="text-sm text-slate-400">Sync your Steam activity.</p>
                  </div>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-950/80 px-5 py-4 text-left text-white transition hover:bg-slate-900"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-emerald-300">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3v18" />
                      <path d="M3.5 9h17" />
                      <path d="M3.5 15h17" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-semibold">MAL</p>
                    <p className="text-sm text-slate-400">View your MAL sync status.</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
