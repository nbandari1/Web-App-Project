"use client";
import { memo, useEffect, useState } from "react";
import AnalyticsCharts from "./AnalyticsCharts";
type Entry = { title: string; episodes: number; seconds: number | null };
function MalAnalytics({ steamMinutes }: { steamMinutes: number | null }) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
    fetch(`${base}/api/mal/activity`, { credentials: "include", cache: "no-store", signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "MAL activity unavailable.");
        if (!Array.isArray(data.entries) || data.entries.some((entry: Entry) => !entry || typeof entry.title !== "string" || !Number.isFinite(entry.episodes) || entry.episodes < 0 || !(entry.seconds === null || Number.isFinite(entry.seconds) && entry.seconds >= 0))) throw new Error("MAL returned invalid activity.");
        return data.entries as Entry[];
      })
      .then(data => { if (!controller.signal.aborted) { setEntries(data); setError(""); } })
      .catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "MAL activity unavailable."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [retry]);
  const known = (entries ?? []).filter(entry => entry.seconds !== null);
  const seconds = known.reduce((sum, entry) => sum + (entry.seconds ?? 0), 0);
  const ranked = [...known].filter(entry => (entry.seconds ?? 0) > 0).sort((a, b) => (b.seconds ?? 0) - (a.seconds ?? 0));
  const top = ranked.slice(0, 5).map(entry => ({ label: entry.title, value: (entry.seconds ?? 0) / 3600 }));
  const other = ranked.slice(5).reduce((sum, entry) => sum + (entry.seconds ?? 0) / 3600, 0);
  return <section aria-labelledby="mal-activity-title" className="min-w-0 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 text-white">
    <h2 id="mal-activity-title" className="text-2xl font-semibold">Watch activity and platform comparison</h2>
    <button disabled={loading} className="my-4 rounded-xl border border-slate-600 px-4 py-2 disabled:opacity-50" onClick={() => { setLoading(true); setEntries(null); setError(""); setRetry(value => value + 1); }}>Refresh / retry MyAnimeList</button>
    {loading && <p role="status" className="animate-pulse">Loading watch activity.</p>}
    {error && <p role="alert">{error} Check your MyAnimeList connection and retry.</p>}
    {entries && <>
      <div className="my-4 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-slate-700 p-4"><p>Estimated lifetime MAL watch time</p><strong>{(seconds / 3600).toFixed(1)} hours</strong></div><div className="rounded-2xl border border-slate-700 p-4"><p>Episodes watched</p><strong>{entries.reduce((sum, entry) => sum + entry.episodes, 0)}</strong></div></div>
      <p className="mb-4 text-sm text-slate-400">Estimates use watched episodes × average duration. Actual sessions and rewatches are not measured. {entries.filter(entry => entry.seconds === null).length} titles excluded because duration is unavailable. MAL does not provide dated watch sessions, so recent comparisons are unavailable.</p>
      <div className="grid gap-4 lg:grid-cols-2"><AnalyticsCharts title="Estimated lifetime watch hours by title" items={other > 0 ? [...top, { label: "Other titles", value: other }] : top} distribution />
        {steamMinutes !== null && <AnalyticsCharts title="Cross-platform lifetime hours" items={[{ label: "Steam owned library · recorded", value: steamMinutes / 60 }, { label: "MAL watch progress · estimated", value: seconds / 3600 }]} />}</div>
      <p className="mt-3 text-sm text-slate-400">Cross-platform comparisons use cumulative hours with different measurement methods. Activities are not combined into a total. Spotify activity is unavailable.</p>
    </>}
  </section>;
}

export default memo(MalAnalytics);
