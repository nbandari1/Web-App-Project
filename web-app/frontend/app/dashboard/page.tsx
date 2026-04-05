export default function Dashboard() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold tracking-tight">
            Activity Tracker
          </h1>

          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>Dashboard</span>
            <button className="rounded-lg bg-slate-800 px-3 py-1.5 hover:bg-slate-700 transition">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Welcome back 👋</h2>
          <p className="mt-2 text-slate-400">
            Here’s a quick overview of your productivity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/20 backdrop-blur">
            <p className="text-sm text-slate-400">Tasks Completed</p>
            <h3 className="mt-2 text-3xl font-semibold">18</h3>
            <p className="mt-1 text-sm text-slate-500">This week</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/20 backdrop-blur">
            <p className="text-sm text-slate-400">Focus Time</p>
            <h3 className="mt-2 text-3xl font-semibold">12 hrs</h3>
            <p className="mt-1 text-sm text-slate-500">Pomodoro sessions</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/20 backdrop-blur">
            <p className="text-sm text-slate-400">Notes Created</p>
            <h3 className="mt-2 text-3xl font-semibold">36</h3>
            <p className="mt-1 text-sm text-slate-500">Workspace notes</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/20 backdrop-blur">
            <p className="text-sm text-slate-400">Streak</p>
            <h3 className="mt-2 text-3xl font-semibold">7 days</h3>
            <p className="mt-1 text-sm text-slate-500">Keep it going 🚀</p>
          </div>
        </div>

        {/* Placeholder Section (future features) */}
        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur">
          <h3 className="text-xl font-semibold">Next Step 🔥</h3>
          <p className="mt-2 text-slate-400">
            This is where your Tasks, Pomodoro Timer, and Notes will go.
          </p>

          <div className="mt-6 flex gap-4">
            <button className="rounded-xl bg-blue-500 px-4 py-2 font-medium hover:bg-blue-400 transition">
              Add Task
            </button>
            <button className="rounded-xl bg-slate-800 px-4 py-2 font-medium hover:bg-slate-700 transition">
              Start Timer
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
