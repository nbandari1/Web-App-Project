"use client";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SettingsModal({ open, onClose }: Props) {
  const [darkMode, setDarkMode] = useState(true);
  const [steamActive, setSteamActive] = useState(false);
  const [malActive, setMalActive] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-black/40">

        {/* HEADER */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">
              Settings
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              App options
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Adjust your dashboard preferences and connected services.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/90 text-slate-300 hover:bg-slate-900"
          >
            ×
          </button>
        </div>

        {/* CONTENT */}
        <div className="mt-8 space-y-5">

          {/* DARK MODE */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Dark Mode</p>
                <p className="mt-1 text-sm text-slate-400">
                  Enabled by default.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDarkMode((v) => !v)}
                className={`h-10 w-20 rounded-full p-1 transition ${
                  darkMode ? "bg-cyan-400" : "bg-slate-700"
                }`}
              >
                <span
                  className={`block h-8 w-8 rounded-full bg-white transition ${
                    darkMode ? "translate-x-10" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* CONNECTED SERVICES */}
          <div className="grid gap-4 sm:grid-cols-2">

            <button className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-950/80 px-5 py-4 text-left text-white hover:bg-slate-900">
              <div className="h-10 w-10 rounded-2xl bg-slate-800" />
              <div>
                <p className="font-semibold">Steam</p>
                <p className="text-sm text-slate-400">Sync activity</p>
              </div>
            </button>

            <button className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-950/80 px-5 py-4 text-left text-white hover:bg-slate-900">
              <div className="h-10 w-10 rounded-2xl bg-slate-800" />
              <div>
                <p className="font-semibold">MAL</p>
                <p className="text-sm text-slate-400">Anime tracking</p>
              </div>
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}
