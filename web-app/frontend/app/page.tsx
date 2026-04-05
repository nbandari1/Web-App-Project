import LoginForm from "@/components/auth/LoginForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center px-12 xl:px-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_28%)]" />

          <div className="relative z-10 max-w-xl">
            <p className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900/70 px-4 py-1.5 text-sm text-slate-300 backdrop-blur">
              Activity Tracker Platform
            </p>

            <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight">
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
          <div className="absolute inset-0 lg:hidden bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_35%)]" />

          <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/75 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-400">
                Welcome
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                Create your account
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Get started with your personalized activity dashboard.
              </p>
            </div>

            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
