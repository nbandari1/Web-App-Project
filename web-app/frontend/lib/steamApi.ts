import { parseGames, type SteamGame } from "./steamAnalytics";

const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
export async function steamRequest(path: string, signal: AbortSignal) {
  const response = await fetch(`${base}/api/steam/${path}`, { credentials: "include", cache: "no-store", signal });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(response.status === 401 ? "Your session expired. Sign in again." : data?.message || "Steam could not be reached. Please retry.");
  if (!data || typeof data !== "object") throw new Error("Steam returned an invalid response.");
  return data;
}
export async function loadSteamLibrary(signal: AbortSignal) {
  const games: SteamGame[] = [];
  let totalCount = 0;
  for (let offset = 0; offset <= 100000; offset += 100) {
    const data = await steamRequest(`games?limit=100&offset=${offset}`, signal);
    if (!Number.isSafeInteger(data.totalCount) || data.totalCount < 0 || data.offset !== offset) throw new Error("Steam returned invalid pagination.");
    if (offset && data.totalCount !== totalCount) throw new Error("Your Steam library changed while loading. Please retry.");
    totalCount = data.totalCount;
    const page = parseGames(data.games);
    games.push(...page);
    if (games.length >= totalCount || page.length < 100) {
      if (new Set(games.map(game => game.appId)).size !== games.length) throw new Error("Steam returned duplicate games. Please retry.");
      return { games, totalCount, complete: games.length === totalCount };
    }
  }
  throw new Error("Steam library exceeds the supported size.");
}

export async function loadSteamRecent(signal: AbortSignal) {
  const data = await steamRequest("activity?count=100", signal);
  const games = parseGames(data.games);
  const summary = data.summary;
  if (data.windowDays !== 14 || !summary || typeof summary.complete !== "boolean" ||
    !Number.isSafeInteger(summary.totalGameCount) || summary.totalGameCount < games.length ||
    summary.returnedGameCount !== games.length || !Number.isSafeInteger(summary.playtimeMinutes) || summary.playtimeMinutes < 0 ||
    summary.complete !== (games.length >= summary.totalGameCount) ||
    new Set(games.map(game => game.appId)).size !== games.length) {
    throw new Error("Steam returned invalid recent activity.");
  }
  return { games, count: summary.totalGameCount as number, minutes: summary.playtimeMinutes as number, complete: summary.complete as boolean };
}
