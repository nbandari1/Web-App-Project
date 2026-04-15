import NotesBoard from "@/components/dashboard/NotesBoard";

export default function NotesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden px-6 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_30%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">
                Notes
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
                Your note workspace
              </h1>
              <p className="mt-3 max-w-2xl text-base text-slate-400">
                Keep ideas, reminders, and progress updates in one clean space.
              </p>
            </div>
            <a
              href="/dashboard"
              className="rounded-2xl border border-white/12 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Back to Dashboard
            </a>
          </div>

          <NotesBoard />
        </div>
      </section>
    </main>
  );
}
