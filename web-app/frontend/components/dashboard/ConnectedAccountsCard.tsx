"use client";

import { useEffect, useState } from "react";

type ConnectablePlatform = "steam" | "myanimelist";
type Platform = ConnectablePlatform | "spotify";

type Props = {
  connectedAccounts?: Partial<Record<ConnectablePlatform, boolean>>;
  onConnect?: (platform: ConnectablePlatform) => void;
};

const platforms: { id: Platform; name: string }[] = [
  { id: "steam", name: "Steam" },
  { id: "myanimelist", name: "MyAnimeList" },
  { id: "spotify", name: "Spotify" },
];

function PlatformIcon({ platform }: { platform: Platform }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {platform === "steam" ? (
        <>
          <circle cx="16.5" cy="7.5" r="5" />
          <circle cx="16.5" cy="7.5" r="2.5" />
          <circle cx="7.5" cy="17" r="3.5" />
          <path d="m1 13 6.5 4 4.5-8M10.5 18l8-6" />
        </>
      ) : platform === "myanimelist" ? (
        <>
          <rect x="1" y="3" width="22" height="18" rx="3" />
          <path d="M4 16V8l2.5 4L9 8v8m2 0 2-8 2 8m-3.3-3h2.6M18 8v8h3" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M6 9c4-1.5 8-1 12 1M7 12.5c3.5-1.2 6.5-.7 10 1M8 16c2.5-.8 5-.5 8 1" />
        </>
      )}
    </svg>
  );
}

export default function ConnectedAccountsCard({
  connectedAccounts = {},
  onConnect,
}: Props) {
  const [feedback, setFeedback] = useState<{ platform: string } | null>(null);

  useEffect(() => {
    if (!feedback) return;

    const timeout = window.setTimeout(() => setFeedback(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  function handleConnect(platform: ConnectablePlatform, name: string) {
    if (onConnect) {
      setFeedback(null);
      onConnect(platform);
      return;
    }

    setFeedback({ platform: name });
  }

  return (
    <section
      aria-labelledby="connected-accounts-heading"
      className="min-w-0 rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl"
    >
      <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">
        Integrations
      </p>
      <h2
        id="connected-accounts-heading"
        className="mt-2 text-2xl font-semibold text-white"
      >
        Connected Accounts
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        See which services are linked to your account.
      </p>

      <ul className="mt-6 space-y-4">
        {platforms.map(({ id, name }) => {
          const comingSoon = id === "spotify";
          const connected = id !== "spotify" && connectedAccounts[id] === true;
          const status = comingSoon
            ? "Coming Soon"
            : connected
              ? "Connected"
              : "Disconnected";
          const statusClass = comingSoon
            ? "border-amber-500/20 bg-amber-500/10 text-amber-200"
            : connected
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
              : "border-slate-700 bg-slate-800/80 text-slate-300";

          return (
            <li
              key={id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-slate-200">
                  <PlatformIcon platform={id} />
                </span>
                <div className="min-w-0">
                  <h3 className="break-words text-sm font-semibold text-white">
                    {name}
                  </h3>
                  <span
                    className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass}`}
                  >
                    {status}
                  </span>
                </div>
              </div>
              {id !== "spotify" && !connected ? (
                <button
                  type="button"
                  onClick={() => handleConnect(id, name)}
                  aria-label={`Connect ${name}`}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
                >
                  Connect
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div role="status" aria-live="polite" aria-atomic="true">
        {feedback ? (
          <p className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
            {feedback.platform} account linking is not available yet. Please
            check back later.
          </p>
        ) : null}
      </div>
    </section>
  );
}
