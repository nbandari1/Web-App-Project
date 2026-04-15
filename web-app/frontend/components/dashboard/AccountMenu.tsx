"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/currentUser";
import { streamUser, type UserRecord } from "@/lib/api";
import SettingsModal from "./SettingsModal";

export default function AccountMenu() {
  const [open, setOpen] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [user, setUser] = useState<UserRecord | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const portalContainerRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();

  // Create portal container once
  useEffect(() => {
    const div = document.createElement("div");
    portalContainerRef.current = div;
    document.body.appendChild(div);

    return () => {
      document.body.removeChild(div);
      portalContainerRef.current = null;
    };
  }, []);

  // Load user + stream updates
  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser?.id) return;

    setUser(storedUser);

    const unsubscribe = streamUser({
      id: storedUser.id,
      onMessage: setUser,
      onError: () => {},
    });

    return () => unsubscribe();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Sign out
  const handleSignOut = () => {
    localStorage.removeItem("user");
    setOpen(false);
    router.push("/");
  };

  return (
    <div className="relative">
      {/* Avatar button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-cyan-400 bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
        aria-label="Account menu"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 z-50 mt-3 w-56 rounded-3xl border border-slate-700 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-xl"
        >
          <div className="rounded-3xl bg-slate-900/85 p-4">
            <p className="text-xs uppercase text-slate-400">Account</p>
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
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-left text-sm text-white hover:bg-slate-800"
            >
              Settings
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-2xl bg-rose-500 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-rose-400"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL PORTAL */}
      {portalContainerRef.current
        ? createPortal(
            <SettingsModal
              open={openSettings}
              onClose={() => setOpenSettings(false)}
            />,
            portalContainerRef.current
          )
        : null}
    </div>
  );
}
