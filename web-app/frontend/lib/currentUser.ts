import type { UserRecord } from "@/lib/api";

export const STORAGE_KEY = "activity-tracker-user";

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = window.localStorage.getItem(STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as UserRecord;
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserRecord) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}
