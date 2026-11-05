"use client";

import { useEffect, useRef, useState } from "react";
import ReactGridLayout, {
  type Layout,
  useContainerWidth,
  verticalCompactor,
} from "react-grid-layout";
import UserGreeting from "@/components/dashboard/UserGreeting";
import NotesBoard from "@/components/dashboard/NotesBoard";
import FocusTimer from "@/components/dashboard/FocusTimer";
import Settings from "@/components/dashboard/Settings";
import ConnectedAccountsCard from "@/components/dashboard/ConnectedAccountsCard";
import ActivityAnalytics from "@/components/dashboard/ActivityAnalytics";
import Tasks from "@/components/dashboard/Tasks";
import Reminders from "@/components/dashboard/Reminders";
import { getStoredUser } from "@/lib/currentUser";

import { defaults, readPreferences, type Preferences, type WidgetId } from "@/lib/dashboardPreferences";

const DEFAULT_DASHBOARD_LAYOUT: Layout = [
  { i: "steam", x: 0, y: 0, w: 4, h: 4, minW: 2, minH: 3 },
  { i: "spotify", x: 4, y: 0, w: 4, h: 4, minW: 2, minH: 3 },
  { i: "mal", x: 8, y: 0, w: 4, h: 4, minW: 2, minH: 3 },
  { i: "timer", x: 0, y: 4, w: 4, h: 8, minW: 3, minH: 7 },
  { i: "tasks", x: 4, y: 4, w: 4, h: 8, minW: 3, minH: 7 },
  { i: "accounts", x: 8, y: 4, w: 4, h: 8, minW: 3, minH: 7 },
  { i: "notes", x: 0, y: 12, w: 8, h: 8, minW: 4, minH: 7 },
  { i: "reminders", x: 8, y: 12, w: 4, h: 8, minW: 3, minH: 7 },
];

const DASHBOARD_LAYOUT_VERSION = "v14";

export default function Dashboard() {
  const [preferences, setPreferences] = useState(defaults);
  const [theme, setTheme] = useState<"classic" | "new">("new");
  const preferenceKey = useRef("");
  const artworkKey = useRef("");

  useEffect(() => {
    const userId = getStoredUser()?.id ?? "guest";
    preferenceKey.current = `dashboard-preferences:${userId}`;
    artworkKey.current = `dashboard-theme:${userId}`;
    setPreferences(readPreferences(preferenceKey.current));
    setTheme(localStorage.getItem(artworkKey.current) === "classic" ? "classic" : "new");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.dashboardTheme = preferences.theme;
    root.dataset.dashboardAccent = preferences.accent;
    return () => {
      delete root.dataset.dashboardTheme;
      delete root.dataset.dashboardAccent;
    };
  }, [preferences.theme, preferences.accent]);

  function updatePreferences(next: Preferences) {
    setPreferences(next);
    if (preferenceKey.current) localStorage.setItem(preferenceKey.current, JSON.stringify(next));
  }

  function chooseTheme(next: "classic" | "new") {
    setTheme(next);
    if (artworkKey.current) localStorage.setItem(artworkKey.current, next);
  }

  const [layout, setLayout] = useState<Layout>(() => {
    if (typeof window === "undefined") return DEFAULT_DASHBOARD_LAYOUT;
    const savedVersion = window.localStorage.getItem("dashboard-layout-version");
    const savedLayout = window.localStorage.getItem("dashboard-layout");
    if (savedLayout && savedVersion === DASHBOARD_LAYOUT_VERSION) {
      try {
        const parsed = JSON.parse(savedLayout) as Layout;
        const expectedIds = DEFAULT_DASHBOARD_LAYOUT.map((item) => item.i);
        const savedIds = Array.isArray(parsed) ? parsed.map((item) => item.i).sort().join(",") : "";
        const validLayout = Array.isArray(parsed)
          && parsed.length === DEFAULT_DASHBOARD_LAYOUT.length
          && savedIds === [...expectedIds].sort().join(",");
        if (validLayout) return parsed;
      } catch {
        window.localStorage.removeItem("dashboard-layout");
      }
    }
    window.localStorage.removeItem("dashboard-layout");
    window.localStorage.setItem("dashboard-layout-version", DASHBOARD_LAYOUT_VERSION);
    return DEFAULT_DASHBOARD_LAYOUT;
  });
  const [touchDragReady, setTouchDragReady] = useState(false);
  const touchHoldTimer = useRef<number | null>(null);
  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: 1280 });

  const startTouchHold = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") return;
    const target = event.target as HTMLElement;
    if (!target.closest(".dashboard-drag-handle")) return;

    setTouchDragReady(false);
    if (touchHoldTimer.current !== null) window.clearTimeout(touchHoldTimer.current);
    touchHoldTimer.current = window.setTimeout(() => {
      setTouchDragReady(true);
      if (navigator.vibrate) navigator.vibrate(20);
    }, 420);
  };

  const cancelTouchHold = () => {
    if (touchHoldTimer.current !== null) {
      window.clearTimeout(touchHoldTimer.current);
      touchHoldTimer.current = null;
    }
    setTouchDragReady(false);
  };

  useEffect(() => () => {
    if (touchHoldTimer.current !== null) window.clearTimeout(touchHoldTimer.current);
  }, []);

  const visibleLayout = layout.filter(({ i }) => !preferences.hidden.includes(i as WidgetId));

  function saveLayout(next: Layout) {
    if (width < 768) return;
    const positions = new Map(next.map((item) => [item.i, item]));
    const merged = layout.map((item) => positions.get(item.i) ?? item);
    setLayout(merged);
    localStorage.setItem("dashboard-layout", JSON.stringify(merged));
    localStorage.setItem("dashboard-layout-version", DASHBOARD_LAYOUT_VERSION);
  }

  return (
    <main className="dashboard-surface min-h-[100dvh] text-white" data-artwork={theme === "new"}>
      <section className="relative min-h-screen px-4 py-4 sm:px-6 sm:py-8">
        <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-4 sm:gap-6">
          <header
            className={`relative z-50 overflow-visible rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:rounded-[2rem] sm:p-8 ${
              theme === "new" ? "bg-cover bg-center" : ""
            }`}
            data-dashboard-header
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <UserGreeting />
                <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
                  Here’s your activity overview. Everything important is laid out so you can move fast.
                </p>
              </div>
              <div className="flex w-full items-center gap-3 lg:w-auto lg:shrink-0">
                <a href="/api/mal/authorize">
              Connect MyAnimeList
</a>
                <button
                  type="button"
                  onClick={() => {
                    setLayout(DEFAULT_DASHBOARD_LAYOUT);
                    window.localStorage.removeItem("dashboard-layout");
                    window.localStorage.setItem("dashboard-layout-version", DASHBOARD_LAYOUT_VERSION);
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-200"
                  title="Reset dashboard component positions"
                >
                  Reset layout
                </button>
                <Settings
                  theme={theme}
                  onThemeChange={chooseTheme}
                  preferences={preferences}
                  onPreferencesChange={updatePreferences}
                  onReset={() => {
                    updatePreferences(defaults);
                    chooseTheme("new");
                  }}
                />
              </div>
            </div>
          </header>

          <ActivityAnalytics />
          <div
            ref={containerRef}
            className="relative"
            onPointerDown={startTouchHold}
            onPointerUp={cancelTouchHold}
            onPointerCancel={cancelTouchHold}
            onPointerLeave={(event) => {
              if (event.pointerType === "touch") cancelTouchHold();
            }}
            onContextMenu={(event) => {
              if ((event.target as HTMLElement).closest(".dashboard-drag-handle")) {
                event.preventDefault();
              }
            }}
          >
            {mounted && (
              <ReactGridLayout
                width={width}
                layout={width < 768 ? visibleLayout.map((item, index) => ({ ...item, x: 0, w: 1, minW: 1, y: index })) : visibleLayout}
                gridConfig={{
                  cols: width < 768 ? 1 : 12,
                  rowHeight: 55,
                  margin: [16, 16],
                  containerPadding: [0, 0],
                }}
                dragConfig={{
                  enabled: touchDragReady || width >= 768,
                  handle: ".dashboard-drag-handle",
                  cancel: "button, input, select, textarea, a",
                  threshold: 4,
                  bounded: true,
                  allowMobileScroll: false,
                }}
                resizeConfig={{ enabled: true, handles: ["se"] }}
                compactor={verticalCompactor}
                onDragStop={saveLayout}
                onResizeStop={saveLayout}
              >
                {!preferences.hidden.includes("steam") && (<article key="steam" className="h-full min-h-0 overflow-auto rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                  <div className="dashboard-drag-handle absolute right-4 top-3 z-20 cursor-grab rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs text-slate-400 active:cursor-grabbing">⋮⋮</div>
                  <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/80">Steam</p>
                  <h2 className="mt-4 text-2xl font-semibold">Unavailable</h2>
                  <p className="mt-3 text-sm text-slate-400">Steam activity integration pending</p>
                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-2 w-0 rounded-full bg-cyan-400" /></div>
                </article>)}

                {!preferences.hidden.includes("spotify") && (<article key="spotify" className="h-full min-h-0 overflow-auto rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                  <div className="dashboard-drag-handle absolute right-4 top-3 z-20 cursor-grab rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs text-slate-400 active:cursor-grabbing">⋮⋮</div>
                  <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/80">Spotify</p>
                  <h2 className="mt-4 text-2xl font-semibold">Unavailable</h2>
                  <p className="mt-3 text-sm text-slate-400">Spotify activity integration pending</p>
                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-2 w-0 rounded-full bg-emerald-400" /></div>
                </article>)}

                {!preferences.hidden.includes("mal") && (<article key="mal" className="h-full min-h-0 overflow-auto rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                  <div className="dashboard-drag-handle absolute right-4 top-3 z-20 cursor-grab rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs text-slate-400 active:cursor-grabbing">⋮⋮</div>
                  <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/80">MAL</p>
                  <h2 className="mt-4 text-2xl font-semibold">See analytics</h2>
                  <p className="mt-3 text-sm text-slate-400">Estimated lifetime activity above</p>
                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-2 w-0 rounded-full bg-blue-400" /></div>
                </article>)}

                <div key="tasks" className="h-full min-h-0 overflow-auto rounded-[2rem]">
                  <div className="dashboard-drag-handle absolute right-4 top-3 z-20 cursor-grab rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs text-slate-400 active:cursor-grabbing">⋮⋮</div>
                  <Tasks />
                </div>

                <div key="accounts" className="h-full min-h-0 overflow-auto rounded-[2rem]"><div className="dashboard-drag-handle absolute right-4 top-3 z-20 cursor-grab rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs text-slate-400 active:cursor-grabbing">⋮⋮</div><ConnectedAccountsCard /></div>
                {!preferences.hidden.includes("timer") && (<div key="timer" className="h-full min-h-0 overflow-auto rounded-[2rem]"><div className="dashboard-drag-handle absolute right-4 top-3 z-20 cursor-grab rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs text-slate-400 active:cursor-grabbing">⋮⋮</div><FocusTimer /></div>)}
                {!preferences.hidden.includes("notes") && (<div key="notes" className="h-full min-h-0 overflow-auto rounded-[2rem]"><div className="dashboard-drag-handle absolute right-4 top-3 z-20 cursor-grab rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs text-slate-400 active:cursor-grabbing">⋮⋮</div><NotesBoard /></div>)}
                {!preferences.hidden.includes("reminders") && (<div key="reminders" className="h-full min-h-0 overflow-auto rounded-[2rem]"><div className="dashboard-drag-handle absolute right-4 top-3 z-20 cursor-grab rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs text-slate-400 active:cursor-grabbing">⋮⋮</div><Reminders /></div>)}
              </ReactGridLayout>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
