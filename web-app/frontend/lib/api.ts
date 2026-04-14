const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export type UserPayload = {
  email: string;
  password: string;
};

export type UserResponse = {
  message: string;
  user: {
    id: string;
    email: string;
  };
};

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type AnyJson = JsonValue | unknown;

const LS_CURRENT_USER_EMAIL = "activityTracker.currentUserEmail.v1";

export function setCurrentUserEmail(email: string) {
  try {
    if (!email) return;
    window.localStorage.setItem(LS_CURRENT_USER_EMAIL, email);
  } catch {
    // ignore
  }
}

export function getCurrentUserEmail(): string | null {
  try {
    return window.localStorage.getItem(LS_CURRENT_USER_EMAIL);
  } catch {
    return null;
  }
}

export function clearCurrentUserEmail() {
  try {
    window.localStorage.removeItem(LS_CURRENT_USER_EMAIL);
  } catch {
    // ignore
  }
}

function hasMessage(x: unknown): x is { message?: unknown } {
  return typeof x === "object" && x !== null && "message" in x;
}

async function readJsonSafe(res: Response): Promise<AnyJson> {
  const text = await res.text();
  try {
    return text ? (JSON.parse(text) as JsonValue) : null;
  } catch {
    // When backend returns HTML error pages, this prevents crashing.
    return { message: text };
  }
}

export async function createUser(payload: UserPayload): Promise<UserResponse> {
  const response = await fetch(`${API_URL}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await readJsonSafe(response)) as unknown;

  if (!response.ok) {
    const msg = hasMessage(data) && typeof data.message === "string" ? data.message : null;
    throw new Error(msg || "Failed to create user");
  }

  const typed = data as UserResponse;

  // Treat created user as the active/"logged in" user for the UI.
  if (typed?.user?.email) setCurrentUserEmail(typed.user.email);

  return typed;
}

export async function getUsers() {
  const response = await fetch(`${API_URL}/api/users`, {
    method: "GET",
  });

  const data = await readJsonSafe(response);

  if (!response.ok) {
    const msg = hasMessage(data) && typeof data.message === "string" ? data.message : null;
    throw new Error(msg || "Failed to fetch users");
  }

  return data;
}

export async function getLatestUserEmail(): Promise<string | null> {
  const users = await getUsers();
  if (!Array.isArray(users) || users.length === 0) return null;

  const last = users[users.length - 1] as unknown;
  if (typeof last !== "object" || last === null) return null;

  const email = "email" in last && typeof (last as { email?: unknown }).email === "string" ? (last as { email: string }).email : null;
  return email;
}

export async function updateUser(id: string, updates: Partial<UserPayload>) {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  const data = await readJsonSafe(response);

  if (!response.ok) {
    const msg = hasMessage(data) && typeof data.message === "string" ? data.message : null;
    throw new Error(msg || "Failed to update user");
  }

  return data;
}

export async function deleteUser(id: string) {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: "DELETE",
  });

  const data = await readJsonSafe(response);

  if (!response.ok) {
    const msg = hasMessage(data) && typeof data.message === "string" ? data.message : null;
    throw new Error(msg || "Failed to delete user");
  }

  return data;
}
