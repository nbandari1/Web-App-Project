"use client";
import { useState } from "react";
export type ChartItem = { label: string; value: number };
const colors = ["#22d3ee", "#34d399", "#a78bfa", "#fbbf24", "#fb7185", "#60a5fa"];
export default function AnalyticsCharts({ title, items, distribution = false }: { title: string; items: ChartItem[]; distribution?: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);
  const max = Math.max(1, ...items.map(item => item.value));
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return <div className="min-w-0 rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
    <h3 className="font-semibold">{title}</h3>
    {items.length === 0 && <p className="mt-3 text-sm text-slate-400">No playtime available for this selection.</p>}
    {items.map((item, i) => <button key={`${item.label}-${i}`} className="my-3 block w-full text-left text-sm" aria-pressed={selected === i} onClick={() => setSelected(i)}>
      <span className="break-words">{item.label}: {item.value.toFixed(1)} h</span>
      <span className="mt-1 block h-3 rounded bg-slate-800"><span className="block h-3 rounded" style={{ width: `${item.value / max * 100}%`, backgroundColor: colors[i % colors.length] }} /></span>
    </button>)}
    {distribution && total > 0 && <svg viewBox="0 0 120 120" className="mx-auto w-full max-w-56" aria-label={title} role="group">
      {items.map((item, i) => {
        const portion = item.value / total * 100;
        const start = items.slice(0, i).reduce((sum, entry) => sum + entry.value, 0) / total * 100;
        return <circle key={i} cx="60" cy="60" r="42" fill="none" stroke={colors[i % colors.length]} strokeWidth={selected === i ? 19 : 15} pathLength="100" strokeDasharray={`${portion} ${100 - portion}`} strokeDashoffset={-start} transform="rotate(-90 60 60)" role="button" tabIndex={0} aria-label={`${item.label}: ${portion.toFixed(1)} percent`} onClick={() => setSelected(i)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelected(i); } }}><title>{item.label}: {portion.toFixed(1)}%</title></circle>;
      })}
    </svg>}
    <p aria-live="polite" className="text-sm text-cyan-200">{selected !== null && items[selected] ? `${items[selected].label}: ${items[selected].value.toFixed(1)} hours` : "Select a bar or segment for details."}</p>
  </div>;
}
