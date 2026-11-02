"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/currentUser";
import { streamUser, type UserRecord } from "@/lib/api";

type Props = {
  theme: "classic" | "new";
  onThemeChange: (theme: "classic" | "new") => void;
};

export default function Settings({ theme, onThemeChange }: Props) {
  const [open, setOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [user, setUser] = useState<UserRecord | null>(() => getStoredUser());
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser?.id) return;
    const unsubscribe = streamUser({
      id: storedUser.id,
      onMessage: setUser,
      onError: () => {},
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    setOpen(false);
    router.push("/");
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-cyan-400 bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
        aria-label="Settings"
        aria-expanded={open}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.07-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.1 7.1 0 0 0-1.62-.94L14.38 2.8a.49.49 0 0 0-.49-.42h-3.84a.49.49 0 0 0-.49.42l-.36 2.52a7.1 7.1 0 0 0-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22L2.66 8.84a.49.49 0 0 0 .12.64l2.03 1.58c-.05.31-.08.63-.08.94s.03.63.08.94L2.78 14.52a.49.49 0 0 0-.12.64l1.92 3.32c.13.23.39.32.61.22l2.39-.96c.5.39 1.04.71 1.62.94l.36 2.52c.03.24.24.42.49.42h3.84c.25 0 .46-.18.49-.42l.36-2.52a7.1 7.1 0 0 0 1.62-.94l2.39.96c.22.1.48.01.61-.22l1.92-3.32a.49.49 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute right-0 top-[calc(100%+12px)] z-[70] aspect-[697/946] w-[224px] max-w-[calc(100vw-32px)] bg-contain bg-center bg-no-repeat shadow-2xl shadow-black/40 ${
            theme === "classic"
              ? "rounded-[2rem] border border-slate-700 bg-slate-950/95"
              : ""
          }`}
          style={theme === "new"
            ? { backgroundImage: "url('/images/Settings.png')" }
            : undefined}
        >
          <div className="absolute inset-x-[12%] top-[14%] flex flex-col items-center gap-2">
            <div className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Profile</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {user?.name || "Guest"}
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                {user?.email || "guest@example.com"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCustomizeOpen(true)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center text-sm font-medium text-slate-950 transition hover:bg-slate-100"
            >
              Customize
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-2xl border border-red-700 bg-red-700 px-3 py-3 text-center text-sm font-semibold text-white transition hover:border-red-600 hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {typeof document !== "undefined" && customizeOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCustomizeOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-[2rem] border border-slate-700 bg-slate-950/95 p-5 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Customize</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Background theme</h2>
              </div>
              <button
                type="button"
                onClick={() => setCustomizeOpen(false)}
                aria-label="Close customize menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xl text-white hover:bg-slate-700"
              >
                ×
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onThemeChange("classic")}
                className={`rounded-3xl border p-3 text-left transition ${
                  theme === "classic"
                    ? "border-cyan-400 bg-cyan-400/10"
                    : "border-slate-700 bg-slate-900 hover:border-slate-500"
                }`}
              >
                <div className="h-24 rounded-2xl bg-slate-950" />
                <p className="mt-3 font-semibold text-white">Original</p>
                <p className="mt-1 text-xs text-slate-400">Slate background</p>
              </button>

              <button
                type="button"
                onClick={() => onThemeChange("new")}
                className={`rounded-3xl border p-3 text-left transition ${
                  theme === "new"
                    ? "border-cyan-400 bg-cyan-400/10"
                    : "border-slate-700 bg-slate-900 hover:border-slate-500"
                }`}
              >
                <div
                  className="h-24 rounded-2xl bg-cover bg-center"
                  style={{ backgroundImage: "url('/images/Bg_dashboard.png')" }}
                />
                <p className="mt-3 font-semibold text-white">New</p>
                <p className="mt-1 text-xs text-slate-400">Dashboard artwork</p>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
