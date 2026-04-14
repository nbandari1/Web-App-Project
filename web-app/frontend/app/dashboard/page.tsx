"use client";

import { useState } from "react";

export default function Dashboard() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold tracking-tight">
            Activity Tracker
          </h1>

          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>Dashboard</span>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="rounded-full border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 transition"
              aria-label="Open settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            <button className="rounded-lg bg-slate-800 px-3 py-1.5 hover:bg-slate-700 transition">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Welcome back 👋</h2>
          <p className="mt-2 text-slate-400">
            Here’s a quick overview of your productivity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/20 backdrop-blur">
            <p className="text-sm text-slate-400">Tasks Completed</p>
            <h3 className="mt-2 text-3xl font-semibold">18</h3>
            <p className="mt-1 text-sm text-slate-500">This week</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/20 backdrop-blur">
            <p className="text-sm text-slate-400">Focus Time</p>
            <h3 className="mt-2 text-3xl font-semibold">12 hrs</h3>
            <p className="mt-1 text-sm text-slate-500">Pomodoro sessions</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/20 backdrop-blur">
            <p className="text-sm text-slate-400">Notes Created</p>
            <h3 className="mt-2 text-3xl font-semibold">36</h3>
            <p className="mt-1 text-sm text-slate-500">Workspace notes</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/20 backdrop-blur">
            <p className="text-sm text-slate-400">Streak</p>
            <h3 className="mt-2 text-3xl font-semibold">7 days</h3>
            <p className="mt-1 text-sm text-slate-500">Keep it going 🚀</p>
          </div>
        </div>

        {/* Placeholder Section (future features) */}
        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur">
          <h3 className="text-xl font-semibold">Next Step 🔥</h3>
          <p className="mt-2 text-slate-400">
            This is where your Tasks, Pomodoro Timer, and Notes will go.
          </p>

          <div className="mt-6 flex gap-4">
            <button className="rounded-xl bg-blue-500 px-4 py-2 font-medium hover:bg-blue-400 transition">
              Add Task
            </button>
            <button className="rounded-xl bg-slate-800 px-4 py-2 font-medium hover:bg-slate-700 transition">
              Start Timer
            </button>
          </div>
        </div>
      </section>

      {settingsOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 sm:px-6">
          <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-slate-800 p-6 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Settings</h2>
                <p className="text-sm text-slate-400">Preview the UI for account options.</p>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-200 hover:bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <h3 className="text-lg font-semibold text-white">Dark Mode</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Toggle the theme for the app. This is just a design preview for now.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <h3 className="text-lg font-semibold text-white">Account Settings</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Manage your account details, profile settings, and connected apps.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <h3 className="text-lg font-semibold text-white">Sign Out</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Sign out of the app and return to the login screen.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
