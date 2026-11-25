"use client";
import { useEffect, useMemo, useState } from "react";
import MalAnalytics from "./MalAnalytics";
import AnalyticsCharts from "./AnalyticsCharts";
import { filterGames, gameChartItems, hours, summarizeGames } from "@/lib/steamAnalytics";
import { loadSteamLibrary, loadSteamRecent } from "@/lib/steamApi";
import { getSteamConnectionStatus } from "@/lib/api";

type Library = Awaited<ReturnType<typeof loadSteamLibrary>>;
type Recent = Awaited<ReturnType<typeof loadSteamRecent>>;
const box = "min-w-0 rounded-2xl border border-slate-700 bg-slate-950/60 p-4";
export default function ActivityAnalytics() {
  const [library, setLibrary] = useState<Library | null>(null);
  const [recent, setRecent] = useState<Recent | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [range, setRange] = useState("lifetime");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("lifetime");
  const [selected, setSelected] = useState<number[]>([]);
  const [visible, setVisible] = useState(24);
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const report = (source: string, error: unknown) => { if (!signal.aborted) setErrors(previous => ({ ...previous, [source]: error instanceof Error ? error.message : "Activity unavailable. Please retry." })); };
    async function load() {
      try {
        const connected = await getSteamConnectionStatus();
        if (signal.aborted) return;
        if (!connected) { report("Steam", new Error("Connect Steam in Connected Accounts to view gaming activity.")); return; }
        await Promise.allSettled([
          loadSteamLibrary(signal).then(value => { if (!signal.aborted) setLibrary(value); }).catch(error => report("Library", error)),
          loadSteamRecent(signal).then(value => { if (!signal.aborted) setRecent(value); }).catch(error => report("Recent activity", error)),
        ]);
      } catch (error) { report("Steam", error); }
      finally { if (!signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [retry]);
  function refresh() { setLoading(true); setLibrary(null); setRecent(null); setErrors({}); setSelected([]); setRetry(value => value + 1); }
  const stats = useMemo(() => summarizeGames(library?.games ?? []), [library]);
  const games = useMemo(() => {
    const recentById = new Map(recent?.games.map(game => [game.appId, game.recentPlaytimeMinutes]));
    return (library?.games ?? recent?.games ?? []).map(game => ({ ...game, recentPlaytimeMinutes: recentById.get(game.appId) ?? game.recentPlaytimeMinutes }));
  }, [library, recent]);
  const filtered = useMemo(() => filterGames(games, search, sort), [games, search, sort]);
  const { top, distribution } = useMemo(() => gameChartItems(range === "recent" ? recent?.games ?? [] : library?.games ?? [], range), [library, recent, range]);
  const complete = library?.complete === true;
  return <div className="space-y-5"><section aria-labelledby="steam-activity-title" className="min-w-0 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 text-white">
    <h2 id="steam-activity-title" className="text-2xl font-semibold">Steam activity analytics</h2>
    <div className="my-4 flex flex-wrap items-center gap-3"><label>Chart window <select className="rounded bg-slate-950 p-2" value={range} onChange={event => setRange(event.target.value)}><option value="lifetime">Lifetime</option><option value="recent">Last 14 days</option></select></label><button disabled={loading} onClick={refresh} className="rounded-xl border border-slate-600 px-4 py-2 disabled:opacity-50">Refresh / retry Steam</button></div>
    {loading && <div role="status" className="grid animate-pulse gap-3 sm:grid-cols-3"><span className="sr-only">Loading Steam activity</span>{[1, 2, 3].map(key => <div key={key} className="h-24 rounded-2xl bg-slate-800" />)}</div>}
    {Object.entries(errors).map(([source, error]) => <p role="alert" key={source} className="my-2 text-sm text-amber-200">{source}: {error}</p>)}
    {!loading && (library || recent) && <>
      <p className="my-3 text-sm text-slate-400">Steam connected. Playtime is recorded by Steam. Lifetime covers the owned library; recent activity covers the last 14 days. These windows overlap.</p>
      {library && !complete && <p role="status">Only {library.games.length} of {library.totalCount} games returned. Lifetime totals and averages are unavailable; charts show returned games only.</p>}
      {recent && !recent.complete && <p role="status">Recent hours are a partial total for {recent.games.length} of {recent.count} games.</p>}
      <div className="my-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{[
        ["Owned games", library?.totalCount ?? "Unavailable"], ["Lifetime gaming hours", complete ? hours(stats.minutes) : "Unavailable"],
        ["Recently played games · last 14 days", recent?.count ?? "Unavailable"], ["Playtime · last 14 days", recent ? `${hours(recent.minutes)}${recent.complete ? "" : " (partial)"}` : "Unavailable"],
        ["Most-played owned game · lifetime", complete ? stats.mostPlayed?.name ?? "No playtime yet" : "Unavailable"], ["Average lifetime playtime / owned game", complete ? hours(stats.average) : "Unavailable"],
      ].map(([label, value]) => <div key={label} className={box}><p className="text-sm text-slate-400">{label}</p><strong className="mt-2 block break-words text-xl">{value}</strong></div>)}</div>
      <div className="grid gap-4 lg:grid-cols-2"><AnalyticsCharts title={`Most-played games · ${range === "recent" ? "last 14 days" : "lifetime"}`} items={top} /><AnalyticsCharts title={`Playtime distribution · ${range === "recent" ? "last 14 days" : "lifetime"}`} items={distribution} distribution />
        {complete && recent?.complete && <AnalyticsCharts title="Steam recorded hours · overlapping windows" items={[{ label: "Owned library · lifetime", value: stats.minutes / 60 }, { label: "Recent activity · last 14 days", value: recent.minutes / 60 }]} />}
        <AnalyticsCharts title="Selected games · lifetime and last 14 days" items={games.filter(game => selected.includes(game.appId)).flatMap(game => [{ label: `${game.name} · lifetime`, value: game.lifetimePlaytimeMinutes / 60 }, ...(game.recentPlaytimeMinutes === null ? [] : [{ label: `${game.name} · last 14 days`, value: game.recentPlaytimeMinutes / 60 }])])} /></div>
      <div className="mt-5"><h3 className="text-xl font-semibold">{library ? "Steam game library" : "Recently played games · library unavailable"}</h3><p className="mt-1 text-sm text-slate-400">Select up to 4 games to compare. Unavailable recent playtime is not treated as zero.</p>
        <div className="my-3 flex flex-wrap gap-3"><label className="min-w-0">Search <input className="w-full rounded bg-slate-950 p-2 sm:w-auto" value={search} onChange={event => { setSearch(event.target.value); setVisible(24); }} placeholder="Game name" /></label><label>Sort <select className="rounded bg-slate-950 p-2" value={sort} onChange={event => { setSort(event.target.value); setVisible(24); }}><option value="name">Name</option><option value="lifetime">Lifetime playtime</option><option value="recent">Recent playtime</option></select></label></div>
        <p className="text-sm text-slate-400">{filtered.length} matching games</p><div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{filtered.slice(0, visible).map(game => <label key={game.appId} className={`${box} flex items-start gap-3`}><input type="checkbox" aria-label={`Compare ${game.name}`} checked={selected.includes(game.appId)} disabled={!selected.includes(game.appId) && selected.length >= 4} onChange={event => setSelected(previous => event.target.checked ? [...previous, game.appId] : previous.filter(id => id !== game.appId))} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {game.iconUrl && <img src={game.iconUrl} alt="" loading="lazy" width={32} height={32} className="h-8 w-8 rounded" onError={event => { event.currentTarget.style.display = "none"; }} />}
          <span className="min-w-0"><strong className="break-words">{game.name}</strong><span className="block text-sm text-slate-400">Lifetime: {hours(game.lifetimePlaytimeMinutes)}</span><span className="block text-sm text-slate-400">Last 14 days: {game.recentPlaytimeMinutes === null ? "Unavailable" : hours(game.recentPlaytimeMinutes)}</span></span></label>)}</div>
        {filtered.length === 0 && <p className="my-4">{games.length ? "No games match your search." : "No games returned. Your library may be empty or restricted."}</p>}{filtered.length > visible && <button className="mt-3 rounded-xl border border-slate-600 px-4 py-2" onClick={() => setVisible(value => value + 24)}>Show more games</button>}
      </div>
    </>}
  </section><MalAnalytics steamMinutes={complete ? stats.minutes : null} /></div>;
}
