import LoginForm from "@/components/auth/LoginForm";
import { M_PLUS_1p } from "next/font/google";

const mPlus1P = M_PLUS_1p({
  variable: "--font-m-plus-1p",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function Home() {
  return (
    <main
      className={`${mPlus1P.variable} min-h-screen text-white`}
      style={{
        backgroundColor: "#08112d",
        fontFamily: "var(--font-m-plus-1p), sans-serif",
        letterSpacing: "2px",
      }}
    >
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center px-12 xl:px-20">
          <div
            className="absolute inset-x-6 top-6 bottom-6 rounded-2xl bg-cover bg-center"
            style={{ backgroundImage: "url('/images/login_bg.png')" }}
          />
          <div className="absolute inset-x-6 top-6 bottom-6 rounded-2xl bg-[#07152f]/50" />
          <div className="absolute inset-x-6 top-6 bottom-6 rounded-2xl bg-[linear-gradient(135deg,rgba(55,102,255,0.28),transparent_55%,rgba(3,9,28,0.55))]" />

          <div className="relative z-10 max-w-xl pl-4">
            <p className="inline-flex items-center gap-3 text-sm font-medium uppercase text-[#d8ddf5]/80">
              <span className="grid h-14 w-14 place-items-center rounded-lg border border-white/10 bg-[#7160dc]/90 shadow-[0_0_24px_rgba(113,96,220,0.35)]">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-white">
                  <path d="M13 2 4.9 13h6.1l-1 9L19.1 11H13l0-9Z" />
                </svg>
              </span>
              <span className="text-base normal-case text-[#adb5cf] opacity-80">ACTIVITY TRACKER</span>
            </p>

            <h1 className="mt-6 text-5xl font-bold leading-tight tracking-[2px]">
              Build a focused space for your tasks, notes, and daily progress.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
              A clean productivity dashboard designed to help you track what
              matters, stay organized, and move through your day with clarity.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/20 backdrop-blur">
                <p className="text-sm text-slate-400">Tasks Completed</p>
                <h3 className="mt-2 text-3xl font-semibold">18</h3>
                <p className="mt-1 text-sm text-slate-500">This week</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/20 backdrop-blur">
                <p className="text-sm text-slate-400">Focus Sessions</p>
                <h3 className="mt-2 text-3xl font-semibold">12</h3>
                <p className="mt-1 text-sm text-slate-500">Pomodoro cycles</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/20 backdrop-blur">
                <p className="text-sm text-slate-400">Notes Created</p>
                <h3 className="mt-2 text-3xl font-semibold">36</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Personal workspace
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/20 backdrop-blur">
                <p className="text-sm text-slate-400">Daily Streak</p>
                <h3 className="mt-2 text-3xl font-semibold">7 days</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Consistency matters
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center px-6 py-10 sm:px-8 lg:px-12">
          <div className="absolute inset-0 bg-[#08112d]" />
          <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_50%_42%,rgba(74,102,211,0.14),transparent_38%)]" />

          <div className="relative w-full max-w-md px-2 py-8 sm:px-4 sm:py-10">
            <div className="mb-8">
              <h2 className="text-3xl font-medium text-[#718cff]">
                Welcome back
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#8c98c2]">
                Sign in to your account to continue tracking
              </p>
            </div>

            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
