"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createUser, loginUser } from "@/lib/api";
import { setStoredUser } from "@/lib/currentUser";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!formData.email || !formData.password || (mode === "signup" && !formData.name)) {
      setMessage(
        mode === "signup"
          ? "Please fill in all fields."
          : "Please enter your email and password.",
      );
      return;
    }

    try {
      setLoading(true);

      if (mode === "signup") {
        const data = await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        setStoredUser(data.user);
        setMessage("Account created successfully.");
      } else {
        const data = await loginUser({
          email: formData.email,
          password: formData.password,
        });

        setStoredUser(data.user);
        setMessage("Welcome back.");
      }

      // 🔥 redirect after success
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setMessage("");
          }}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            mode === "signup"
              ? "bg-blue-500 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Sign Up
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setMessage("");
          }}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            mode === "login"
              ? "bg-blue-500 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Login
        </button>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {mode === "signup" ? (
          <div>
            <label className="mb-2 block text-sm text-slate-300">Name</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
              placeholder="Your name"
            />
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-sm text-slate-300">Email</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Password</label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Enter password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-500 py-3 font-semibold"
        >
          {loading
            ? mode === "signup"
              ? "Creating Account..."
              : "Signing In..."
            : mode === "signup"
              ? "Create Account"
              : "Sign In"}
        </button>
      </form>

      {message ? (
        <p
          className={`mt-4 text-center text-sm ${
            message === "Welcome back." || message === "Account created successfully."
              ? "text-emerald-300"
              : "text-rose-300"
          }`}
        >
          {message}
        </p>
      ) : null}
    </>
  );
}
