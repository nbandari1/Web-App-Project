"use client";
import { useEffect, useState } from "react";

type Entry = { title: string; episodes: number; seconds: number | null };
const colors = ["#22d3ee", "#34d399", "#a78bfa", "#fbbf24", "#fb7185", "#60a5fa"];
export default function ActivityAnalytics() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState("all");
  const [range, setRange] = useState("lifetime");
  const [selected, setSelected] = useState<number | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mal/activity`, { credentials: "include", signal: controller.signal })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.message || "Activity unavailable"); return data.entries as Entry[]; })
      .then(data => { setEntries(data); setError(""); })
      .catch(err => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Activity unavailable"); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [retry]);
  const available = !loading && !error && entries !== null && range === "lifetime" && (platform === "all" || platform === "mal");
  const known = available ? entries.filter(e => e.seconds !== null) : [];
  const total = known.reduce((sum, e) => sum + (e.seconds ?? 0), 0);
  const top = [...known].filter(e => (e.seconds ?? 0) > 0).sort((a, b) => (b.seconds ?? 0) - (a.seconds ?? 0)).slice(0, 5);
  const remainder = total - top.reduce((sum, e) => sum + (e.seconds ?? 0), 0);
  const chart = remainder > 0 ? [...top, { title: "Other titles", episodes: 0, seconds: remainder }] : top;
  const box = "rounded-2xl border border-slate-700 bg-slate-950/60 p-4";
  return <section aria-labelledby="activity-title" className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 text-white">
    <h2 id="activity-title" className="text-2xl font-semibold">Activity analytics</h2>
    <div className="my-4 flex flex-wrap gap-3">
      <label>Platform <select className="rounded bg-slate-950 p-2" value={platform} onChange={e => { setPlatform(e.target.value); setSelected(null); }}><option value="all">All platforms</option><option value="mal">MyAnimeList</option><option value="steam">Steam</option><option value="spotify">Spotify</option></select></label>
      <label>Date range <select className="rounded bg-slate-950 p-2" value={range} onChange={e => { setRange(e.target.value); setSelected(null); }}><option value="lifetime">Lifetime</option><option value="week">Last 7 days</option><option value="month">Last 30 days</option></select></label>
      <button onClick={() => { setLoading(true); setRetry(v => v + 1); }}>Refresh</button>
    </div>
    {loading && <p role="status" className="animate-pulse">Loading activity…</p>}
    {!loading && error && <p role="alert">{error} Link MAL using “Connect MyAnimeList”, then refresh.</p>}
    {range !== "lifetime" && <p>Unavailable: MAL provides cumulative progress, not dated watch sessions. Daily and weekly trends cannot be inferred.</p>}
    {(platform === "steam" || platform === "spotify") && <p>Unavailable: this platform has no activity endpoint yet.</p>}
    <div className="my-4 grid gap-3 sm:grid-cols-3">
      <div className={box}><p>Estimated MAL watch time</p><strong>{available ? `${(total / 3600).toFixed(1)} hours` : "Unavailable"}</strong></div>
      <div className={box}><p>Measured activity time</p><strong>Unavailable</strong><p className="text-sm text-slate-400">No measured source connected</p></div>
      <div className={box}><p>Episodes watched</p><strong>{available ? entries.reduce((sum, e) => sum + e.episodes, 0) : "Unavailable"}</strong></div>
    </div>
    <p className="text-sm text-slate-400">Estimates use watched episodes × average episode duration. Rewatches and actual session lengths are not measured. Steam and Spotify are excluded from totals.</p>
    {available && <p className="mt-2 text-sm">{entries.filter(e => e.seconds === null).length} titles excluded from time estimates because duration is unavailable.</p>}
    {available && total === 0 && <p className="mt-4">No watch-time data available. Add watching progress on MAL or check missing episode durations.</p>}
    {total > 0 && <div className="mt-4 grid gap-4 md:grid-cols-2">
      <div className={box}><h3>Estimated hours by title</h3>{chart.map((entry, i) => <button key={entry.title + i} className="my-3 block w-full text-left" onClick={() => setSelected(i)} aria-pressed={selected === i}><span>{entry.title}: {((entry.seconds ?? 0) / 3600).toFixed(1)} h</span><span className="mt-1 block h-4 rounded bg-slate-800"><span className="block h-4 rounded" style={{ width: `${(entry.seconds ?? 0) / Math.max(...chart.map(e => e.seconds ?? 0)) * 100}%`, background: colors[i] }} /></span></button>)}</div>
      <div className={box}><h3>Estimated time distribution</h3><svg viewBox="0 0 120 120" className="mx-auto w-full max-w-64" role="group" aria-label="Estimated watch-time doughnut chart">{chart.map((entry, i) => { const fraction = (entry.seconds ?? 0) / total; const start = chart.slice(0, i).reduce((sum, item) => sum + (item.seconds ?? 0), 0) / total * 100; return <circle key={i} cx="60" cy="60" r="42" fill="none" stroke={colors[i]} strokeWidth={selected === i ? 19 : 15} pathLength="100" strokeDasharray={`${fraction * 100} ${100 - fraction * 100}`} strokeDashoffset={-start} transform="rotate(-90 60 60)" tabIndex={0} role="button" aria-label={`${entry.title}: ${(fraction * 100).toFixed(1)} percent`} onClick={() => setSelected(i)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(i); } }}><title>{entry.title}: {(fraction * 100).toFixed(1)}%</title></circle>; })}</svg><p aria-live="polite">{selected !== null && chart[selected] ? `${chart[selected].title}: ${((chart[selected].seconds ?? 0) / 3600).toFixed(1)} estimated hours` : "Select a bar or segment for details."}</p></div>
    </div>}
  </section>;
}
