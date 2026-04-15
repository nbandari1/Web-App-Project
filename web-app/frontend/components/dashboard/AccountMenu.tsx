"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getStoredUser } from "@/lib/currentUser";
import { streamUser, type UserRecord } from "@/lib/api";

export default function AccountMenu() {
  const [open, setOpen] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [steamActive, setSteamActive] = useState(false);
  const [malActive, setMalActive] = useState(false);
  const [user, setUser] = useState<UserRecord | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const portalContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!portalContainerRef.current) {
      const portal = document.createElement("div");
      portalContainerRef.current = portal;
      document.body.appendChild(portal);
    }

    return () => {
      if (portalContainerRef.current) {
        document.body.removeChild(portalContainerRef.current);
        portalContainerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const storedUser = getStoredUser();

    if (!storedUser?.id) {
      return;
    }

    setUser(storedUser);

    const closeStream = streamUser({
      id: storedUser.id,
      onMessage: (nextUser) => {
        setUser(nextUser);
      },
      onError: () => {},
    });

    return () => {
      closeStream();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (open && menuRef.current && !menuRef.current.contains(target)) {
        setOpen(false);
      }

      if (openSettings && settingsRef.current && !settingsRef.current.contains(target)) {
        setOpenSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, openSettings]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-cyan-400 bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
        aria-label="Account menu"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      {open ? (
        <div ref={menuRef} className="absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-3xl border border-slate-700 bg-slate-950/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="rounded-3xl bg-slate-900/85 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Account</p>
            <p className="mt-2 text-sm font-semibold text-white">
              {user?.name || "Guest"}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {user?.email || "guest@example.com"}
            </p>
          </div>
          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setOpenSettings(true);
              }}
              className="w-full rounded-2xl bg-slate-900/90 px-4 py-3 text-left text-sm text-white transition hover:bg-slate-800"
            >
              Settings
            </button>
            <button
              type="button"
              className="w-full rounded-2xl bg-rose-500/90 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-rose-400"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : null}
      {openSettings && portalContainerRef.current
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
              onClick={() => setOpenSettings(false)}
            >
              <div
                ref={settingsRef}
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-lg rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-black/40"
              >
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
                    onClick={() => setOpenSettings(false)}
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
                      className={`flex items-center gap-3 rounded-3xl border px-5 py-4 text-left text-white transition ${steamActive ? "border-cyan-400 bg-slate-900" : "border-slate-800 bg-slate-950/80"} hover:bg-slate-900`}
                      onClick={() => setSteamActive((value) => !value)}
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
                      className={`flex items-center gap-3 rounded-3xl border px-5 py-4 text-left text-white transition ${malActive ? "border-emerald-300 bg-slate-900" : "border-slate-800 bg-slate-950/80"} hover:bg-slate-900`}
                      onClick={() => setMalActive((value) => !value)}
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
            </div>,
            portalContainerRef.current,
          )
        : null}
    </div>
  );
}
