const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

export async function loginUser(payload: UserPayload): Promise<UserResponse> {
  const response = await fetch(`${API_URL}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Invalid email or password");
  }

  return data;
}

export async function getUsers(email?: string) {
  const url = email
    ? `${API_URL}/api/users?email=${encodeURIComponent(email)}`
    : `${API_URL}/api/users`;
  const response = await fetch(url, {
    method: "GET",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch users");
  }

  return data;
}

export async function getUser(id: string) {
  const response = await fetch(`${API_URL}/api/users/${encodeURIComponent(id)}`, {
    method: "GET",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch user");
  }

  return data;
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
