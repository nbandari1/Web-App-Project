"use client";

import { useEffect, useRef, useState } from "react";
import { accents, themes, widgets, type Preferences, type WidgetId } from "@/lib/dashboardPreferences";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/currentUser";
import { streamUser, type UserRecord } from "@/lib/api";

type Props = {
  preferences: Preferences;
  onPreferencesChange: (preferences: Preferences) => void;
  onReset: () => void;
  theme: "classic" | "new";
  onThemeChange: (theme: "classic" | "new") => void;
};

export default function Settings({ theme, onThemeChange, preferences, onPreferencesChange, onReset }: Props) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
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
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-cyan-400 bg-cyan-500 text-[var(--dashboard-on-accent)] shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
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
            <div className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Profile</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {user?.name || "Guest"}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {user?.email || ""}
              </p>
            </div>

            <button
              type="button"
              onClick={() => dialogRef.current?.showModal()}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center text-sm font-medium text-slate-950 transition hover:opacity-90"
            >
              Customize
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-2xl border border-red-700 bg-red-700 px-3 py-3 text-center text-sm font-semibold text-[#fff] transition hover:border-red-600 hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="dashboard-customize-title"
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%_-_2rem)] max-w-lg overflow-auto rounded-3xl border border-slate-700 bg-slate-950 p-5 text-white shadow-2xl backdrop:bg-black/60"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="dashboard-customize-title" className="text-xl font-semibold">Customize dashboard</h2>
          <form method="dialog">
            <button className="rounded-xl bg-slate-800 px-3 py-2">Done</button>
          </form>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Theme
            <select
              className="rounded-xl border border-slate-700 bg-slate-900 p-2 capitalize"
              value={preferences.theme}
              onChange={(event) => {
                const theme = themes.find((choice) => choice === event.target.value);
                if (theme) onPreferencesChange({ ...preferences, theme });
              }}
            >
              {themes.map((theme) => <option key={theme} value={theme}>{theme}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Accent color
            <select
              className="rounded-xl border border-slate-700 bg-slate-900 p-2 capitalize"
              value={preferences.accent}
              onChange={(event) => {
                const accent = accents.find((choice) => choice === event.target.value);
                if (accent) onPreferencesChange({ ...preferences, accent });
              }}
            >
              {accents.map((accent) => <option key={accent} value={accent}>{accent}</option>)}
            </select>
          </label>
        </div>

        <label className="mt-4 grid gap-1 text-sm">
          Background (dark theme)
          <select
            className="rounded-xl border border-slate-700 bg-slate-900 p-2"
            value={theme}
            onChange={(event) => onThemeChange(event.target.value === "classic" ? "classic" : "new")}
          >
            <option value="new">Dashboard artwork</option>
            <option value="classic">Solid background</option>
          </select>
        </label>

        <fieldset className="mt-5 rounded-xl border border-slate-700 p-3">
          <legend className="px-1 text-sm font-semibold">Visible widgets</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(widgets) as WidgetId[]).map((id) => (
              <label key={id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-cyan-400"
                  checked={!preferences.hidden.includes(id)}
                  onChange={(event) => onPreferencesChange({
                    ...preferences,
                    hidden: event.target.checked
                      ? preferences.hidden.filter((widget) => widget !== id)
                      : [...preferences.hidden, id],
                  })}
                />
                {widgets[id]}
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={onReset}
          className="mt-5 rounded-xl border border-slate-700 px-3 py-2 text-sm hover:border-cyan-400"
        >
          Restore defaults
        </button>
      </dialog>
    </div>
  );
}
