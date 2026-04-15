import UserGreeting from "@/components/dashboard/UserGreeting";
import NotesBoard from "@/components/dashboard/NotesBoard";
import FocusTimer from "@/components/dashboard/FocusTimer";
import AccountMenu from "@/components/dashboard/AccountMenu";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative min-h-screen px-6 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.12),transparent_35%)]" />
        <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-6">
          <header className="relative z-50 overflow-visible rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <UserGreeting />
                <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
                  Here’s your activity overview. Everything important is laid out so you can move fast.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center justify-center rounded-3xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
                  + Quick Add
                </button>
                <AccountMenu />
              </div>
            </div>
          </header>

          <div className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/80">Steam</p>
              <h2 className="mt-4 text-5xl font-semibold">47.2</h2>
              <p className="mt-3 text-sm text-slate-400">steam hours this week</p>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-2 w-4/5 rounded-full bg-cyan-400" />
              </div>
            </article>
            <article className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/80">Spotify</p>
              <h2 className="mt-4 text-5xl font-semibold">312</h2>
              <p className="mt-3 text-sm text-slate-400">minutes today</p>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-2 w-11/12 rounded-full bg-emerald-400" />
              </div>
            </article>
            <article className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/80">MAL</p>
              <h2 className="mt-4 text-5xl font-semibold">18</h2>
              <p className="mt-3 text-sm text-slate-400">episodes this week</p>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-2 w-3/4 rounded-full bg-blue-400" />
              </div>
            </article>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.55fr_0.85fr]">
            <div className="grid gap-6">
              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-cyan-300">
                      Active focus
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold text-white">Priority work</h2>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-cyan-200">
                    4 pending
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Focus", value: "3" },
                    { label: "Progress", value: "76%" },
                    { label: "Energy", value: "High" },
                    { label: "Notes", value: "12" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                        {item.label}
                      </p>
                      <h3 className="mt-3 text-3xl font-semibold text-white">{item.value}</h3>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">
                    Agenda
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Today&apos;s plan
                  </h2>
                  <div className="mt-6 space-y-4">
                    {[
                      { time: "9:30 AM", title: "Planning block", details: "Set priorities and define one meaningful win for the day." },
                      { time: "11:00 AM", title: "Deep focus session", details: "Work distraction-free on the task that moves everything forward." },
                      { time: "4:00 PM", title: "Wrap-up review", details: "Capture notes, decisions, and tomorrow's starting point." },
                    ].map((item) => (
                      <div key={item.time} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                        <p className="text-sm font-medium text-white">{item.time} - {item.title}</p>
                        <p className="mt-1 text-sm text-slate-400">{item.details}</p>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">
                    Highlights
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Working well
                  </h2>
                  <div className="mt-6 space-y-4">
                    {[
                      {
                        text: "Clear priorities",
                        wrapperClass: "rounded-2xl border border-emerald-500/15 bg-emerald-500/10 p-4",
                        textClass: "text-sm font-medium text-emerald-200",
                      },
                      {
                        text: "Strong note habit",
                        wrapperClass: "rounded-2xl border border-cyan-500/15 bg-cyan-500/10 p-4",
                        textClass: "text-sm font-medium text-cyan-200",
                      },
                      {
                        text: "Ready to act",
                        wrapperClass: "rounded-2xl border border-amber-500/15 bg-amber-500/10 p-4",
                        textClass: "text-sm font-medium text-amber-200",
                      },
                    ].map((item) => (
                      <div key={item.text} className={item.wrapperClass}>
                        <p className={item.textClass}>{item.text}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
            <div className="space-y-6">
              <FocusTimer />
              <NotesBoard />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
