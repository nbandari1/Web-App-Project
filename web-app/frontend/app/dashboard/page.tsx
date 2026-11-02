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
import Tasks from "@/components/dashboard/Tasks";
import Reminders from "@/components/dashboard/Reminders";
import { getStoredUser } from "@/lib/currentUser";

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
  const [theme, setTheme] = useState<"classic" | "new">(() => {
    if (typeof window === "undefined") return "new";
    const storedUser = getStoredUser();
    return storedUser?.id && window.localStorage.getItem(`dashboard-theme:${storedUser.id}`) === "classic"
      ? "classic"
      : "new";
  });
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

  useEffect(() => {
    const backgroundElements = [document.documentElement, document.body];

    backgroundElements.forEach((element) => {
      element.style.backgroundColor = "#0b1224";
      if (theme === "new") {
        element.style.backgroundImage = "url('/images/Bg_dashboard.png')";
        element.style.backgroundRepeat = "no-repeat";
        element.style.backgroundPosition = "center top";
        element.style.backgroundSize = "cover";
        element.style.backgroundAttachment = "fixed";
      } else {
        element.style.backgroundImage = "none";
        element.style.backgroundAttachment = "scroll";
      }
    });

    return () => {
      backgroundElements.forEach((element) => {
        element.style.backgroundColor = "";
        element.style.backgroundImage = "";
        element.style.backgroundRepeat = "";
        element.style.backgroundPosition = "";
        element.style.backgroundSize = "";
        element.style.backgroundAttachment = "";
      });
    };
  }, [theme]);

  const chooseTheme = (nextTheme: "classic" | "new") => {
    setTheme(nextTheme);
    const storedUser = getStoredUser();
    const userId = storedUser?.id;
    if (userId) {
      window.localStorage.setItem(`dashboard-theme:${userId}`, nextTheme);
    }
  };

  return (
    <main
      className={`min-h-[100dvh] text-white ${
        theme === "new" ? "" : "bg-slate-950"
      }`}
      style={theme === "new"
        ? {
            backgroundColor: "#0b1224",
            backgroundImage: "url('/images/Bg_dashboard.png')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center top",
            backgroundSize: "cover",
            backgroundAttachment: "fixed",
          }
        : { backgroundColor: "#020617" }}
    >
      <section className="relative min-h-screen px-4 py-4 sm:px-6 sm:py-8">
        <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-4 sm:gap-6">
          <header
            className={`relative z-50 overflow-visible rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:rounded-[2rem] sm:p-8 ${
              theme === "new" ? "bg-cover bg-center" : ""
            }`}
            style={theme === "new" ? { backgroundImage: "url('/images/dashboard_top_bg.png')" } : undefined}
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
                <Settings theme={theme} onThemeChange={chooseTheme} />
              </div>
            </div>
          </header>

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
                layout={width < 768 ? layout.map((item, index) => ({ ...item, x: 0, w: 1, y: index })) : layout}
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
                onLayoutChange={(nextLayout) => {
                  if (width < 768) return;
                }}
                onDragStop={(nextLayout) => {
                  setLayout(nextLayout);
                  if (width >= 768) {
                    window.localStorage.setItem("dashboard-layout", JSON.stringify(nextLayout));
                    window.localStorage.setItem("dashboard-layout-version", DASHBOARD_LAYOUT_VERSION);
                  }
                }}
                onResizeStop={(nextLayout) => {
                  setLayout(nextLayout);
                  if (width >= 768) {
                    window.localStorage.setItem("dashboard-layout", JSON.stringify(nextLayout));
                    window.localStorage.setItem("dashboard-layout-version", DASHBOARD_LAYOUT_VERSION);
                  }
                }}
              >
                <article key="steam" className="h-full min-h-0 overflow-auto rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                  <div className="dashboard-drag-handle absolute right-4 top-3 z-20 cursor-grab rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs text-slate-400 active:cursor-grabbing">⋮⋮</div>
                  <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/80">Steam</p>
                  <h2 className="mt-4 text-5xl font-semibold">47.2</h2>
                  <p className="mt-3 text-sm text-slate-400">steam hours this week</p>
                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-2 w-4/5 rounded-full bg-cyan-400" /></div>
                </article>

                <article key="spotify" className="h-full min-h-0 overflow-auto rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                  <div className="dashboard-drag-handle absolute right-4 top-3 z-20 cursor-grab rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs text-slate-400 active:cursor-grabbing">⋮⋮</div>
                  <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/80">Spotify</p>
                  <h2 className="mt-4 text-5xl font-semibold">312</h2>
                  <p className="mt-3 text-sm text-slate-400">minutes today</p>
                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-2 w-11/12 rounded-full bg-emerald-400" /></div>
                </article>

                <article key="mal" className="h-full min-h-0 overflow-auto rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                  <div className="dashboard-drag-handle absolute right-4 top-3 z-20 cursor-grab rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs text-slate-400 active:cursor-grabbing">⋮⋮</div>
                  <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/80">MAL</p>
                  <h2 className="mt-4 text-5xl font-semibold">18</h2>
                  <p className="mt-3 text-sm text-slate-400">episodes this week</p>
                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-2 w-3/4 rounded-full bg-blue-400" /></div>
                </article>

                <div key="tasks" className="h-full min-h-0 overflow-auto rounded-[2rem]">
                  <div className="dashboard-drag-handle absolute right-4 top-3 z-20 cursor-grab rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs text-slate-400 active:cursor-grabbing">⋮⋮</div>
                  <Tasks />
                </div>

                <div key="accounts" className="h-full min-h-0 overflow-auto rounded-[2rem]"><div className="dashboard-drag-handle absolute right-4 top-3 z-20 cursor-grab rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs text-slate-400 active:cursor-grabbing">⋮⋮</div><ConnectedAccountsCard /></div>
                <div key="timer" className="h-full min-h-0 overflow-auto rounded-[2rem]"><div className="dashboard-drag-handle absolute right-4 top-3 z-20 cursor-grab rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs text-slate-400 active:cursor-grabbing">⋮⋮</div><FocusTimer /></div>
                <div key="notes" className="h-full min-h-0 overflow-auto rounded-[2rem]"><div className="dashboard-drag-handle absolute right-4 top-3 z-20 cursor-grab rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs text-slate-400 active:cursor-grabbing">⋮⋮</div><NotesBoard /></div>
                <div key="reminders" className="h-full min-h-0 overflow-auto rounded-[2rem]"><div className="dashboard-drag-handle absolute right-4 top-3 z-20 cursor-grab rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-xs text-slate-400 active:cursor-grabbing">⋮⋮</div><Reminders /></div>
              </ReactGridLayout>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
