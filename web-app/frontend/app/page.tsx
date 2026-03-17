"use client";

import { ChangeEvent, FormEvent, useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
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

    if (!formData.email || !formData.password) {
      setMessage("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to submit form.");
      }

      const data = await response.json();
      console.log("Response:", data);

      setMessage("Login form submitted successfully!");

      setFormData({
        email: "",
        password: "",
      });
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left side */}
        <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center px-12 xl:px-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_30%)]" />

          <div className="relative z-10 max-w-xl">
            <p className="mb-5 inline-flex rounded-full border border-slate-700/80 bg-slate-900/60 px-4 py-1.5 text-sm text-slate-300 backdrop-blur">
              Activity Tracker Web App
            </p>

            <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
              Organize your digital life in one powerful dashboard.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300 xl:text-lg">
              Track your gaming, music, anime, tasks, and notes with a clean,
              modern workspace designed for focus and clarity.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur">
                <p className="text-sm text-slate-400">Steam</p>
                <h3 className="mt-2 text-2xl font-semibold">12.4 hrs</h3>
                <p className="mt-1 text-sm text-slate-400">Weekly activity</p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur">
                <p className="text-sm text-slate-400">Spotify</p>
                <h3 className="mt-2 text-2xl font-semibold">340 min</h3>
                <p className="mt-1 text-sm text-slate-400">Listening time</p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur">
                <p className="text-sm text-slate-400">MyAnimeList</p>
                <h3 className="mt-2 text-2xl font-semibold">6 eps</h3>
                <p className="mt-1 text-sm text-slate-400">Episodes watched</p>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur">
                <p className="text-sm text-slate-400">Tasks</p>
                <h3 className="mt-2 text-2xl font-semibold">8 left</h3>
                <p className="mt-1 text-sm text-slate-400">Today’s progress</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right side */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-900/75 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-8">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                Welcome back
              </p>
              <h2 className="text-3xl font-bold">Sign in to continue</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Access your dashboard and manage all your activity in one place.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-300"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-sm text-blue-400 transition hover:text-blue-300"
                  >
                    Forgot?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-500 px-4 py-3 font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {message && (
              <p className="mt-4 text-center text-sm text-slate-300">
                {message}
              </p>
            )}

            <p className="mt-6 text-center text-sm text-slate-500">
              Secure access to your connected activity dashboard.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
