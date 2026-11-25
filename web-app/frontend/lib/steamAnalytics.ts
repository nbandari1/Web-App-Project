export type SteamGame = {
  appId: number;
  name: string;
  iconUrl: string | null;
  lifetimePlaytimeMinutes: number;
  recentPlaytimeMinutes: number | null;
  lastPlayedAt: string | null;
};

export const hours = (minutes: number) => `${(minutes / 60).toFixed(1)} h`;
export function filterGames(games: SteamGame[], search: string, sort: string) {
  return games.filter(game => game.name.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) :
      sort === "recent" ? (b.recentPlaytimeMinutes ?? -1) - (a.recentPlaytimeMinutes ?? -1) || a.name.localeCompare(b.name) :
        b.lifetimePlaytimeMinutes - a.lifetimePlaytimeMinutes || a.name.localeCompare(b.name));
}
export function summarizeGames(games: SteamGame[]) {
  const ranked = filterGames(games, "", "lifetime");
  const minutes = games.reduce((sum, game) => sum + game.lifetimePlaytimeMinutes, 0);
  return { minutes, average: games.length ? minutes / games.length : 0, mostPlayed: ranked.find(game => game.lifetimePlaytimeMinutes > 0) ?? null };
}

export function gameChartItems(games: SteamGame[], window: string) {
  const items = games.map(game => ({ label: game.name, value: (window === "recent" ? game.recentPlaytimeMinutes ?? 0 : game.lifetimePlaytimeMinutes) / 60 }))
    .filter(item => item.value > 0).sort((a, b) => b.value - a.value);
  const top = items.slice(0, 5);
  const other = items.slice(5).reduce((sum, item) => sum + item.value, 0);
  return { top, distribution: other > 0 ? [...top, { label: "Other games", value: other }] : top };
}

export function parseGames(value: unknown): SteamGame[] {
  if (!Array.isArray(value)) throw new Error("Steam returned an invalid game library.");
  const nonNegative = (n: unknown): n is number => typeof n === "number" && Number.isSafeInteger(n) && n >= 0;
  return value.map(game => {
    if (!game || !nonNegative(game.appId) || game.appId === 0 || typeof game.name !== "string" || !nonNegative(game.lifetimePlaytimeMinutes) ||
      !(game.recentPlaytimeMinutes === null || nonNegative(game.recentPlaytimeMinutes))) throw new Error("Steam returned invalid playtime data.");
    return { ...game, iconUrl: typeof game.iconUrl === "string" && game.iconUrl.startsWith("https://media.steampowered.com/") ? game.iconUrl : null } as SteamGame;
  });
}
