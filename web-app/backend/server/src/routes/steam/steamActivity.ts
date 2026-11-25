const STEAM_API_URL = "https://api.steampowered.com";
const STEAM_ICON_URL =
  "https://media.steampowered.com/steamcommunity/public/images/apps";

type JsonObject = Record<string, unknown>;

export type SteamGame = {
  appId: number;
  name: string;
  iconUrl: string | null;
  lifetimePlaytimeMinutes: number;
  recentPlaytimeMinutes: number | null;
  lastPlayedAt: string | null;
};

export class SteamActivityError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonNegativeInteger(value: unknown): number | null {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0
    ? value
    : null;
}

function toIsoDate(value: unknown): string | null {
  const seconds = nonNegativeInteger(value);

  if (seconds === null || seconds === 0) {
    return null;
  }

  const date = new Date(seconds * 1000);

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString();
}

export function normalizeSteamGame(value: unknown): SteamGame | null {
  if (!isObject(value)) {
    return null;
  }

  const appId = nonNegativeInteger(value.appid);
  const lifetimePlaytimeMinutes =
    nonNegativeInteger(value.playtime_forever);

  if (
    appId === null ||
    appId === 0 ||
    lifetimePlaytimeMinutes === null
  ) {
    return null;
  }

  const name =
    typeof value.name === "string" && value.name.trim()
      ? value.name.trim()
      : `Steam game ${appId}`;

  const recentPlaytimeMinutes =
    value.playtime_2weeks === undefined
      ? null
      : nonNegativeInteger(value.playtime_2weeks);

  const iconHash =
    typeof value.img_icon_url === "string" &&
    /^[a-f0-9]{40}$/i.test(value.img_icon_url)
      ? value.img_icon_url
      : null;

  return {
    appId,
    name,
    iconUrl: iconHash
      ? `${STEAM_ICON_URL}/${appId}/${iconHash}.jpg`
      : null,
    lifetimePlaytimeMinutes,
    recentPlaytimeMinutes,
    lastPlayedAt: toIsoDate(value.rtime_last_played),
  };
}

function getApiKey() {
  const key = process.env.STEAM_WEB_API_KEY?.trim() ?? "";

  if (!/^[a-f0-9]{32}$/i.test(key)) {
    throw new SteamActivityError(
      503,
      "Steam Web API is not configured.",
    );
  }

  return key;
}

function validateSteamId(steamId: string) {
  if (!/^\d{17}$/.test(steamId)) {
    throw new SteamActivityError(
      400,
      "The linked Steam account is invalid.",
    );
  }
}

async function steamRequest(
  path: string,
  parameters: Record<string, string>,
) {
  const url = new URL(path, STEAM_API_URL);

  url.search = new URLSearchParams({
    key: getApiKey(),
    ...parameters,
  }).toString();

  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new SteamActivityError(
      502,
      "Steam could not be reached. Please try again.",
    );
  }

  if (!response.ok) {
    throw new SteamActivityError(
      502,
      "Steam rejected the activity request. Please try again.",
    );
  }

  const body: unknown = await response
    .json()
    .catch(() => null);

  if (!isObject(body)) {
    throw new SteamActivityError(
      502,
      "Steam returned an invalid response.",
    );
  }

  return body;
}

export async function getRecentSteamActivity(
  steamId: string,
  count: number,
) {
  validateSteamId(steamId);

  if (
    !Number.isSafeInteger(count) ||
    count < 1 ||
    count > 100
  ) {
    throw new SteamActivityError(
      400,
      "count must be between 1 and 100.",
    );
  }

  const body = await steamRequest(
    "/IPlayerService/GetRecentlyPlayedGames/v1/",
    {
      steamid: steamId,
      count: String(count),
      format: "json",
    },
  );

  const response = isObject(body.response)
    ? body.response
    : null;

  const totalCount =
    nonNegativeInteger(response?.total_count);

  if (totalCount === null) {
    throw new SteamActivityError(
      403,
      "Steam activity is private. Make Game details public in Steam settings.",
    );
  }

  const games = (
    Array.isArray(response?.games)
      ? response.games
      : []
  )
    .map(normalizeSteamGame)
    .filter(
      (game): game is SteamGame =>
        game !== null,
    );

  return {
    totalCount,
    recentPlaytimeMinutes: games.reduce(
      (total, game) =>
        total + (game.recentPlaytimeMinutes ?? 0),
      0,
    ),
    games,
  };
}

export async function getOwnedSteamGames(
  steamId: string,
) {
  validateSteamId(steamId);

  const body = await steamRequest(
    "/IPlayerService/GetOwnedGames/v1/",
    {
      steamid: steamId,
      include_appinfo: "true",
      include_played_free_games: "true",
      format: "json",
    },
  );

  const response = isObject(body.response)
    ? body.response
    : null;

  const totalCount =
    nonNegativeInteger(response?.game_count);

  if (totalCount === null) {
    throw new SteamActivityError(
      403,
      "Steam game library is private. Make Game details public in Steam settings.",
    );
  }

  const games = (
    Array.isArray(response?.games)
      ? response.games
      : []
  )
    .map(normalizeSteamGame)
    .filter(
      (game): game is SteamGame =>
        game !== null,
    );

  return {
    totalCount,
    games,
  };
}