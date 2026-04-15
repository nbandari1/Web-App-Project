const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export type UserPayload = {
  name: string;
  email: string;
  password: string;
};

export type UserRecord = {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  createdAt?: string | null;
};

export type UserResponse = {
  message: string;
  user: {
    id: string;
    name?: string;
    email: string;
  };
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  user: {
    id: string;
    name?: string;
    email?: string;
  };
};

export type NotePayload = {
  title: string;
  content: string;
};

export type NoteRecord = {
  id: string;
  title: string;
  content: string;
  createdAt?: string | null;
};

export async function createUser(payload: UserPayload): Promise<UserResponse> {
  const response = await fetch(`${API_URL}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create user");
  }

  return data;
}

export async function getUsers(): Promise<UserRecord[]> {
  const response = await fetch(`${API_URL}/api/users`, {
    method: "GET",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch users");
  }

  return data;
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to sign in");
  }

  return data;
}

export function streamUser({
  id,
  onMessage,
  onError,
}: {
  id: string;
  onMessage: (user: UserRecord | null) => void;
  onError?: () => void;
}) {
  const eventSource = new EventSource(`${API_URL}/api/users/stream/${id}`);

  eventSource.onmessage = (event) => {
    const user = JSON.parse(event.data) as UserRecord | null;
    onMessage(user);
  };

  eventSource.onerror = () => {
    onError?.();
  };

  return () => {
    eventSource.close();
  };
}

export async function updateUser(id: string, updates: Partial<UserPayload>) {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update user");
  }

  return data;
}

export async function deleteUser(id: string) {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete user");
  }

  return data;
}

export async function createNote(
  userId: string,
  payload: NotePayload,
): Promise<{ message: string; note: NoteRecord }> {
  const response = await fetch(`${API_URL}/api/users/${userId}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create note");
  }

  return data;
}

export async function getNotes(userId: string): Promise<NoteRecord[]> {
  const response = await fetch(`${API_URL}/api/users/${userId}/notes`, {
    method: "GET",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch notes");
  }

  return data;
}

export function streamNotes({
  userId,
  onMessage,
  onError,
}: {
  userId: string;
  onMessage: (notes: NoteRecord[]) => void;
  onError?: () => void;
}) {
  const eventSource = new EventSource(`${API_URL}/api/users/${userId}/notes/stream`);

  eventSource.onmessage = (event) => {
    const notes = JSON.parse(event.data) as NoteRecord[];
    onMessage(notes);
  };

  eventSource.onerror = () => {
    onError?.();
  };

  return () => {
    eventSource.close();
  };
}

export async function deleteNote(userId: string, noteId: string) {
  const response = await fetch(`${API_URL}/api/users/${userId}/notes/${noteId}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete note");
  }

  return data;
}
