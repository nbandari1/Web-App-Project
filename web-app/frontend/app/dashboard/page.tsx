import UserGreeting from "@/components/dashboard/UserGreeting";
import NotesBoard from "@/components/dashboard/NotesBoard";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden px-6 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.12),transparent_35%)]" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center">
          <section className="w-full rounded-[2.25rem] border border-slate-800 bg-slate-900/78 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="rounded-[1.8rem] border border-slate-800/70 bg-[linear-gradient(145deg,rgba(8,47,73,0.88),rgba(15,23,42,0.96))] p-6 sm:p-8">
              <UserGreeting />
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/dashboard/notes"
                  className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Open Notes
                </a>
                <button
                  type="button"
                  className="rounded-2xl border border-white/12 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Review Today
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                  Focus
                </p>
                <h3 className="mt-3 text-3xl font-semibold text-white">3</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  priority items ready for your next work block
                </p>
              </article>
              <article className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                  Progress
                </p>
                <h3 className="mt-3 text-3xl font-semibold text-white">76%</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  steady momentum across your weekly goals
                </p>
              </article>
              <article className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                  Energy
                </p>
                <h3 className="mt-3 text-3xl font-semibold text-white">High</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  a good time to tackle the most important task
                </p>
              </article>
              <article className="rounded-3xl border border-white/8 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                  Notes
                </p>
                <h3 className="mt-3 text-3xl font-semibold text-white">12</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  ideas and updates collected in your workspace
                </p>
              </article>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <section className="rounded-3xl border border-white/8 bg-white/5 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">
                  Agenda
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Today&apos;s plan
                </h2>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
                    <p className="text-sm font-medium text-white">
                      9:30 AM - Planning block
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Set priorities and define one meaningful win for the day.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
                    <p className="text-sm font-medium text-white">
                      11:00 AM - Deep focus session
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Work distraction-free on the task that moves everything
                      forward.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
                    <p className="text-sm font-medium text-white">
                      4:00 PM - Wrap-up review
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Capture notes, decisions, and tomorrow&apos;s starting
                      point.
                    </p>
                  </div>
                </div>
              </section>

              <div className="grid gap-4">
                <section className="rounded-3xl border border-white/8 bg-white/5 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">
                    Workspace
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Quick options
                  </h2>
                  <div className="mt-6 grid gap-3">
                    <a
                      href="/dashboard/notes"
                      className="rounded-2xl border border-white/8 bg-slate-950/40 p-4 transition hover:bg-white/8"
                    >
                      <p className="text-sm font-medium text-white">Notes Page</p>
                      <p className="mt-1 text-sm text-slate-400">
                        Open your personal notes and capture ideas.
                      </p>
                    </a>
                    <button
                      type="button"
                      className="rounded-2xl border border-white/8 bg-slate-950/40 p-4 text-left transition hover:bg-white/8"
                    >
                      <p className="text-sm font-medium text-white">Today&apos;s Review</p>
                      <p className="mt-1 text-sm text-slate-400">
                        Check your priorities and reset your focus.
                      </p>
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl border border-white/8 bg-slate-950/40 p-4 text-left transition hover:bg-white/8"
                    >
                      <p className="text-sm font-medium text-white">Quick Summary</p>
                      <p className="mt-1 text-sm text-slate-400">
                        See your progress at a glance before diving in.
                      </p>
                    </button>
                  </div>
                </section>

                <section className="rounded-3xl border border-white/8 bg-white/5 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">
                    Highlights
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/10 p-4">
                      <p className="text-sm font-medium text-emerald-200">
                        Clear priorities
                      </p>
                    </div>
                    <div className="rounded-2xl border border-cyan-500/15 bg-cyan-500/10 p-4">
                      <p className="text-sm font-medium text-cyan-200">
                        Strong note habit
                      </p>
                    </div>
                    <div className="rounded-2xl border border-amber-500/15 bg-amber-500/10 p-4">
                      <p className="text-sm font-medium text-amber-200">
                        Ready to act
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.12),transparent_35%)]" />
        <div className="relative grid w-full max-w-7xl gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
            <div className="rounded-[1.75rem] border border-slate-800/70 bg-[linear-gradient(135deg,rgba(8,47,73,0.78),rgba(15,23,42,0.92))] p-8 sm:p-10">
              <UserGreeting />
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#notes-board"
                  className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Open Notes
                </a>
                <button
                  type="button"
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Review Today
                </button>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                    Daily Flow
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Start your session with a clean overview and stay focused on
                    what matters most today.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                    Notes Space
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Save quick ideas, reminders, and progress notes in one calm
                    workspace.
                  </p>
                </div>
              </div>
            </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                  Focus
                </p>
                <h3 className="mt-3 text-3xl font-semibold text-white">3</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  priority items ready for your next work block
                </p>
              </article>
              <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                  Progress
                </p>
                <h3 className="mt-3 text-3xl font-semibold text-white">76%</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  steady momentum across your weekly goals
                </p>
              </article>
              <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                  Energy
                </p>
                <h3 className="mt-3 text-3xl font-semibold text-white">High</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  a good time to tackle the most important task
                </p>
              </article>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_0.92fr]">
              <section className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">
                  Agenda
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Today&apos;s rhythm
                </h2>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <p className="text-sm font-medium text-white">
                      9:30 AM - Planning block
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Set priorities and define one meaningful win for the day.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <p className="text-sm font-medium text-white">
                      11:00 AM - Deep focus session
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Work distraction-free on the task that moves everything forward.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <p className="text-sm font-medium text-white">
                      4:00 PM - Wrap-up review
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Capture notes, decisions, and tomorrow&apos;s starting point.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">
                  Highlights
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Working well
                </h2>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/10 p-4">
                    <p className="text-sm font-medium text-emerald-200">
                      Clear priorities
                    </p>
                    <p className="mt-1 text-sm text-emerald-100/80">
                      You&apos;re keeping the day focused and easy to navigate.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-cyan-500/15 bg-cyan-500/10 p-4">
                    <p className="text-sm font-medium text-cyan-200">
                      Strong note habit
                    </p>
                    <p className="mt-1 text-sm text-cyan-100/80">
                      Quick capture makes it easier to stay organized as things move.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-500/15 bg-amber-500/10 p-4">
                    <p className="text-sm font-medium text-amber-200">
                      Ready to act
                    </p>
                    <p className="mt-1 text-sm text-amber-100/80">
                      Use the notes panel to turn ideas into a simple daily record.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
          <NotesBoard />
        </div>
      </section>
      {/* Top Navbar */}
      <header className="hidden border-b border-slate-800 bg-slate-900/70 backdrop-blur">
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
      <section className="hidden mx-auto max-w-6xl px-6 py-10">
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
        <UserGreeting />
      </section>
    </main>
  );
}
