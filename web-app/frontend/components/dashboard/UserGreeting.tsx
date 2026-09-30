"use client";

import { useEffect, useState } from "react";
import { streamUser, type UserRecord } from "@/lib/api";
import { getStoredUser } from "@/lib/currentUser";

function deriveName(user: UserRecord | null) {
  if (!user) {
    return "there";
  }

  if (user.name?.trim()) {
    return user.name.trim();
  }

  if (user.email?.trim()) {
    return user.email.split("@")[0];
  }

  return "there";
}

export default function UserGreeting() {
  const [user, setUser] = useState<UserRecord | null>(null);

  useEffect(() => {
    const parsedUser = getStoredUser();

    if (!parsedUser?.id) {
      return;
    }

    const closeStream = streamUser({
      id: parsedUser.id,
      onMessage: (nextUser) => {
        setUser(nextUser);
      },
    });

    return () => {
      closeStream();
    };
  }, []);

  return (
    <div>
      <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">
        Dashboard
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        Hello {deriveName(user)}
      </h1>
    </div>
  );
}
