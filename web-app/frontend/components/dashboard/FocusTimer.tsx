"use client";

import { useEffect, useState } from "react";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function formatInput(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function parseInput(value: string): number {
  if (value.includes(":")) {
    const parts = value.split(":");
    const minutes = parseInt(parts[0]) || 0;
    const seconds = parseInt(parts[1]) || 0;
    return Math.max(0, minutes * 60 + seconds);
  } else {
    const minutes = parseInt(value) || 0;
    return Math.max(0, minutes * 60);
  }
}

export default function FocusTimer() {
  const [minutesInput, setMinutesInput] = useState("25:00");
  const [durationSeconds, setDurationSeconds] = useState(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    if (remainingSeconds <= 0) {
      setIsRunning(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setRemainingSeconds((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [isRunning, remainingSeconds]);

  const progress = durationSeconds > 0 ? (remainingSeconds / durationSeconds) * 100 : 0;

  const handleStart = () => {
    if (remainingSeconds <= 0) {
      const minutes = Number(minutesInput) || 0;
      const nextDuration = Math.max(0, minutes) * 60;
      setDurationSeconds(nextDuration);
      setRemainingSeconds(nextDuration);
    }

    const minutes = Number(minutesInput) || 0;
    setDurationSeconds(Math.max(0, minutes) * 60);
    setRemainingSeconds((current) => (current > 0 ? current : Math.max(0, minutes) * 60));
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    const minutes = Number(minutesInput) || 0;
    const nextDuration = Math.max(0, minutes) * 60;
    setDurationSeconds(nextDuration);
    setRemainingSeconds(nextDuration);
    setIsRunning(false);
  };

  const handleSkip = () => {
    setRemainingSeconds(0);
    setIsRunning(false);
  };

  const handleMinutesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setMinutesInput(value);

    if (!isRunning) {
      const minutes = Number(value) || 0;
      const nextDuration = Math.max(0, minutes) * 60;
      setDurationSeconds(nextDuration);
      setRemainingSeconds(nextDuration);
    }
  };

  return (
    <section className="rounded-[2rem] border border-slate-800 bg-slate-950/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Focus Timer</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Pomodoro</h2>
        </div>
        <span className="inline-flex items-center rounded-full border border-cyan-500/20 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-cyan-200">
          Pomodoro
        </span>
      </div>

      <div className="mt-8 flex flex-col items-center gap-6">
        <div className="relative flex h-72 w-72 items-center justify-center rounded-full bg-slate-900/95 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)]">
          <div className="absolute inset-0 rounded-full border border-slate-700/70" />
          <div className="absolute inset-6 rounded-full bg-slate-950/90" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 opacity-90" />
          <div className="relative text-center">
            <p className="text-6xl font-semibold tracking-tight text-white">{formatTime(remainingSeconds)}</p>
            <p className="mt-2 text-sm uppercase tracking-[0.24em] text-slate-400">remaining</p>
          </div>
          <div className="pointer-events-none absolute inset-0 rounded-full border border-cyan-400/20" />
        </div>

        <p className="text-sm text-slate-400">Focus</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-[1.15fr_1fr]">
        <label className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 shadow-inner shadow-slate-950/30">
          <span className="text-slate-400">Minutes</span>
          <input
            type="number"
            max={120}
            value={minutesInput}
            onChange={handleMinutesChange}
            className="w-20 rounded-2xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-right text-white text-lg outline-none focus:border-cyan-400 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </label>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-14 w-14 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/95 text-slate-300 transition hover:border-cyan-400 hover:text-white"
            aria-label="Restart timer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-repeat" viewBox="0 0 16 16">
              <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
              <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
            </svg>
          </button>

          <button
            type="button"
            onClick={isRunning ? handlePause : handleStart}
            className="inline-flex h-14 flex-1 items-center justify-center rounded-3xl bg-cyan-400 text-slate-950 transition hover:bg-cyan-300"
            aria-label={isRunning ? "Pause timer" : "Start timer"}
          >
            {isRunning ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pause-fill" viewBox="0 0 16 16">
                <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-play-fill" viewBox="0 0 16 16">
                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="inline-flex h-14 w-14 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/95 text-slate-300 transition hover:border-cyan-400 hover:text-white"
            aria-label="Skip to end"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-rewind-fill" viewBox="0 0 16 16">
              <path d="M8.404 7.304a.802.802 0 0 0 0 1.392l6.363 3.692c.539.313 1.233-.066 1.233-.696V4.308c0-.63-.693-1.01-1.233-.696L8.404 7.304z"/>
              <path d="M.404 7.304a.802.802 0 0 0 0 1.392l6.363 3.692c.539.313 1.233-.066 1.233-.696V4.308c0-.63-.693-1.01-1.233-.696L.404 7.304z"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
