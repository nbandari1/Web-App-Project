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

export async function getUsers() {
  const response = await fetch(`${API_URL}/api/users`, {
    method: "GET",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch users");
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
