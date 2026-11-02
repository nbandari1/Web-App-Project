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
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-[#111b42]/50 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setMessage("");
          }}
          className={`rounded-md px-4 py-2 text-sm font-medium tracking-[2px] transition ${
            mode === "signup"
              ? "bg-[#6d5bd6] text-white shadow-[0_8px_24px_rgba(109,91,214,0.18)]"
              : "text-[#8794ba] hover:text-white"
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
          className={`rounded-md px-4 py-2 text-sm font-medium tracking-[2px] transition ${
            mode === "login"
              ? "bg-[#6d5bd6] text-white shadow-[0_8px_24px_rgba(109,91,214,0.18)]"
              : "text-[#8794ba] hover:text-white"
          }`}
        >
          Login
        </button>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {mode === "signup" ? (
          <div>
            <label className="mb-2 block text-xs text-[#7f89aa]">Name</label>
            <div className="relative">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 fill-none stroke-[#8794ba] stroke-2">
                <circle cx="12" cy="8" r="3.25" />
                <path d="M5.5 19c.7-3.7 3-5.5 6.5-5.5s5.8 1.8 6.5 5.5" />
              </svg>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#34405e] bg-[#8b96b3]/20 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#69749a] focus:border-[#718cff] focus:bg-[#8b96b3]/25"
                placeholder="Your name"
              />
            </div>
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-xs text-[#7f89aa]">Email address</label>
          <div className="relative">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 fill-none stroke-[#8794ba] stroke-2">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#34405e] bg-[#8b96b3]/20 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#69749a] focus:border-[#718cff] focus:bg-[#8b96b3]/25"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs text-[#7f89aa]">Password</label>
            {mode === "login" ? (
              <button type="button" className="text-[10px] text-[#718cff] hover:text-white">
                Forgot password
              </button>
            ) : null}
          </div>
          <div className="relative">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 fill-none stroke-[#8794ba] stroke-2">
              <rect x="5" y="10" width="14" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#34405e] bg-[#8b96b3]/20 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#69749a] focus:border-[#718cff] focus:bg-[#8b96b3]/25"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-label={mode === "login" ? "Sign In" : loading ? "Creating Account" : "Create Account"}
          className={`w-full disabled:cursor-not-allowed disabled:opacity-60 ${
            mode === "login"
              ? "h-[54px] overflow-hidden rounded-lg bg-[url('/images/Sign-in-button.png')] bg-cover bg-center"
              : "rounded-lg bg-[#6955d4] py-3 text-sm font-medium text-white shadow-[0_14px_34px_rgba(85,67,190,0.22)] transition hover:bg-[#7562df]"
          }`}
        >
          {mode === "signup" ? (
            loading ? "Creating Account..." : "Create Account"
          ) : null}
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
