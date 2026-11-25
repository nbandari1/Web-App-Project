import express, { type Request, type RequestHandler } from "express";
import { createHash, randomBytes } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "../../config/firebase";
import authMiddleware from "../../middleware/authMiddleware";
import {
  getOwnedSteamGames,
  getRecentSteamActivity,
  SteamActivityError,
} from "./steamActivity";

const STEAM_OPENID_URL = "https://steamcommunity.com/openid/login";
const OPENID_NAMESPACE = "http://specs.openid.net/auth/2.0";
const STATE_LIFETIME_MS = 10 * 60 * 1000;

class SteamOpenIdError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function getBackendOrigin() {
  const value = process.env.BACKEND_URL;
  let url: URL;

  try {
    if (!value) throw new Error();
    url = new URL(value);
  } catch {
    throw new SteamOpenIdError(503, "Steam linking is not configured.");
  }

  const localHttp =
    process.env.NODE_ENV !== "production" &&
    url.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);

  if (
    (url.protocol !== "https:" && !localHttp) ||
    url.username ||
    url.password
  ) {
    throw new SteamOpenIdError(503, "Steam backend URL is invalid.");
  }

  return url.origin;
}

function getCallbackUrl(state?: string) {
  const url = new URL("/api/steam/callback", getBackendOrigin());

  if (state) url.searchParams.set("state", state);
  return url.toString();
}

function getDashboardUrl() {
  const value = process.env.FRONTEND_URL;
  let url: URL;

  try {
    if (!value) throw new Error();
    url = new URL(value);
  } catch {
    throw new SteamOpenIdError(503, "Frontend redirect URL is not configured.");
  }

  const localHttp =
    process.env.NODE_ENV !== "production" &&
    url.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);

  if (
    (url.protocol !== "https:" && !localHttp) ||
    url.username ||
    url.password
  ) {
    throw new SteamOpenIdError(503, "Frontend redirect URL is invalid.");
  }

  const dashboardUrl = new URL("/dashboard", url.origin);
  dashboardUrl.searchParams.set("steam", "connected");
  return dashboardUrl.toString();
}

function getOpenIdFields(req: Request) {
  const fields = new URLSearchParams();

  for (const [key, value] of Object.entries(req.query)) {
    if (key.startsWith("openid.") && typeof value === "string") {
      fields.set(key, value);
    }
  }

  return fields;
}

function isFreshNonce(value: string) {
  const timestamp = Date.parse(value.slice(0, 20));

  return (
    Number.isFinite(timestamp) &&
    timestamp >= Date.now() - STATE_LIFETIME_MS &&
    timestamp <= Date.now() + 60_000
  );
}

async function verifyAssertion(fields: URLSearchParams) {
  const signedFields = fields.get("openid.signed")?.split(",") ?? [];
  const requiredSignedFields = [
    "op_endpoint",
    "claimed_id",
    "identity",
    "return_to",
    "response_nonce",
  ];

  if (
    requiredSignedFields.some((field) => !signedFields.includes(field)) ||
    fields.get("openid.ns") !== OPENID_NAMESPACE ||
    fields.get("openid.mode") !== "id_res" ||
    fields.get("openid.op_endpoint") !== STEAM_OPENID_URL
  ) {
    throw new SteamOpenIdError(400, "Steam identity verification failed.");
  }

  const nonce = fields.get("openid.response_nonce");
  if (!nonce || !isFreshNonce(nonce)) {
    throw new SteamOpenIdError(400, "Steam identity verification expired. Start linking again.");
  }

  const verification = new URLSearchParams(fields);
  verification.set("openid.mode", "check_authentication");

  let response: Response;
  try {
    response = await fetch(STEAM_OPENID_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verification,
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new SteamOpenIdError(502, "Steam could not verify the sign-in. Please try again.");
  }

  const body = await response.text();
  if (!response.ok || !/(?:^|\r?\n)is_valid:true(?:\r?\n|$)/.test(body)) {
    throw new SteamOpenIdError(401, "Steam identity verification failed.");
  }

  const claimedId = fields.get("openid.claimed_id") ?? "";
  const identity = fields.get("openid.identity") ?? "";
  const steamIdMatch = /^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/.exec(claimedId);
  const steamId = steamIdMatch?.[1];

  if (!steamId || identity !== claimedId) {
    throw new SteamOpenIdError(400, "Steam returned an invalid account identity.");
  }

  return steamId;
}

async function getSteamProfile(steamId: string) {
  const apiKey = process.env.STEAM_WEB_API_KEY;
  if (!apiKey) {
    throw new SteamOpenIdError(503, "Steam Web API is not configured.");
  }

  const params = new URLSearchParams({
    key: apiKey,
    steamids: steamId,
  });

  let response: Response;
  try {
    response = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?${params}`,
      { signal: AbortSignal.timeout(10_000) },
    );
  } catch {
    throw new SteamOpenIdError(502, "Steam profile could not be loaded. Please try again.");
  }

  if (!response.ok) {
    throw new SteamOpenIdError(502, "Steam profile could not be loaded. Please try again.");
  }

  const body = await response.json().catch(() => null) as {
    response?: { players?: Array<Record<string, unknown>> };
  } | null;
  const player = body?.response?.players?.find(
    (item) => item.steamid === steamId && typeof item.personaname === "string",
  );

  if (!player || typeof player.personaname !== "string") {
    throw new SteamOpenIdError(502, "Steam profile could not be loaded. Please try again.");
  }

  return {
    displayName: player.personaname,
    ...(typeof player.avatarfull === "string" ? { avatarUrl: player.avatarfull } : {}),
  };
}

async function consumeState(state: string, userId: string) {
  return db.runTransaction(async (transaction) => {
    const requestRef = db.collection("_steamOpenIdRequests").doc(digest(state));
    const snapshot = await transaction.get(requestRef);

    if (!snapshot.exists) return false;

    const data = snapshot.data();
    const expiresAt =
      data?.expiresAt instanceof Timestamp ? data.expiresAt.toMillis() : 0;

    if (data?.userId !== userId || expiresAt <= Date.now()) {
      if (data?.userId === userId) transaction.delete(requestRef);
      return false;
    }

    transaction.delete(requestRef);
    return true;
  });
}

async function saveConnection(
  userId: string,
  steamId: string,
  profile: { displayName: string; avatarUrl?: string },
) {
  const userRef = db.collection("users").doc(userId);
  const connectionRef = userRef.collection("linkedServices").doc("steam");

  await db.runTransaction(async (transaction) => {
    const [user, existing] = await Promise.all([
      transaction.get(userRef),
      transaction.get(connectionRef),
    ]);

    if (!user.exists) {
      throw new SteamOpenIdError(401, "Application account no longer exists. Sign in again.");
    }

    transaction.set(connectionRef, {
      provider: "steam",
      providerUserId: steamId,
      profileUrl: `https://steamcommunity.com/profiles/${steamId}`,
      displayName: profile.displayName,
      ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
      connected: true,
      connectedAt: existing.data()?.connectedAt ?? FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}

function fail(res: express.Response, error: unknown) {
  if (error instanceof SteamOpenIdError) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  return res.status(500).json({
    success: false,
    message: "Could not save the Steam connection. Please start linking again.",
  });
}

const privateResponse: RequestHandler = (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
};

const router = express.Router();

router.get("/authorize", privateResponse, authMiddleware, async (req, res) => {
  if (!req.userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    getDashboardUrl();
    const state = randomBytes(32).toString("base64url");
    const expiresAt = Date.now() + STATE_LIFETIME_MS;

    await db.collection("_steamOpenIdRequests").doc(digest(state)).create({
      userId: req.userId,
      expiresAt: Timestamp.fromMillis(expiresAt),
    });

    const callbackUrl = getCallbackUrl(state);
    const authorizationUrl = new URL(STEAM_OPENID_URL);
    authorizationUrl.searchParams.set("openid.ns", OPENID_NAMESPACE);
    authorizationUrl.searchParams.set("openid.mode", "checkid_setup");
    authorizationUrl.searchParams.set("openid.return_to", callbackUrl);
    authorizationUrl.searchParams.set("openid.realm", `${getBackendOrigin()}/`);
    authorizationUrl.searchParams.set(
      "openid.identity",
      "http://specs.openid.net/auth/2.0/identifier_select",
    );
    authorizationUrl.searchParams.set(
      "openid.claimed_id",
      "http://specs.openid.net/auth/2.0/identifier_select",
    );

    return res.redirect(302, authorizationUrl.toString());
  } catch (error) {
    return fail(res, error);
  }
});

router.get("/callback", privateResponse, authMiddleware, async (req, res) => {
  if (!req.userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const state = typeof req.query.state === "string" ? req.query.state : "";
    const fields = getOpenIdFields(req);
    const expectedReturnTo = getCallbackUrl(state);

    if (
      !state ||
      fields.get("openid.return_to") !== expectedReturnTo ||
      !/^[A-Za-z0-9_-]{43}$/.test(state)
    ) {
      throw new SteamOpenIdError(400, "Steam sign-in request is invalid or expired. Start linking again.");
    }

    const steamId = await verifyAssertion(fields);
    const profile = await getSteamProfile(steamId);
    if (!(await consumeState(state, req.userId))) {
      throw new SteamOpenIdError(400, "Steam sign-in request is invalid or expired. Start linking again.");
    }

    await saveConnection(req.userId, steamId, profile);
    return res.redirect(303, getDashboardUrl());
  } catch (error) {
    return fail(res, error);
  }
});

router.get("/status", privateResponse, authMiddleware, async (req, res) => {
  if (!req.userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const connection = await db.collection("users").doc(req.userId)
      .collection("linkedServices").doc("steam").get();
    return res.json({ connected: connection.data()?.connected === true });
  } catch {
    return res.status(503).json({ success: false, message: "Connection status unavailable" });
  }
});
async function getLinkedSteamId(userId: string) {
  const connection = await db
    .collection("users")
    .doc(userId)
    .collection("linkedServices")
    .doc("steam")
    .get();

  const data = connection.data();
  const steamId = data?.providerUserId;

  if (
    data?.connected !== true ||
    typeof steamId !== "string" ||
    !/^\d{17}$/.test(steamId)
  ) {
    throw new SteamActivityError(
      409,
      "Connect a Steam account first.",
    );
  }

  return steamId;
}

function queryNumber(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
  name: string,
) {
  if (value === undefined) {
    return fallback;
  }

  if (
    typeof value !== "string" ||
    !/^\d+$/.test(value)
  ) {
    throw new SteamActivityError(
      400,
      `${name} must be between ${minimum} and ${maximum}.`,
    );
  }

  const number = Number(value);

  if (
    !Number.isSafeInteger(number) ||
    number < minimum ||
    number > maximum
  ) {
    throw new SteamActivityError(
      400,
      `${name} must be between ${minimum} and ${maximum}.`,
    );
  }

  return number;
}

function activityError(
  res: express.Response,
  error: unknown,
) {
  if (error instanceof SteamActivityError) {
    return res.status(error.status).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Steam activity could not be loaded.",
  });
}

router.get(
  "/activity",
  privateResponse,
  authMiddleware,
  async (req, res) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    try {
      const count = queryNumber(
        req.query.count,
        10,
        1,
        100,
        "count",
      );

      const steamId =
        await getLinkedSteamId(req.userId);

      const activity =
        await getRecentSteamActivity(
          steamId,
          count,
        );

      return res.json({
        success: true,
        source: "steam",
        kind: "measured",
        windowDays: 14,
        summary: {
          totalGameCount:
            activity.totalCount,
          returnedGameCount:
            activity.games.length,
          playtimeMinutes:
            activity.recentPlaytimeMinutes,
          complete:
            activity.games.length >=
            activity.totalCount,
        },
        games: activity.games,
      });
    } catch (error) {
      return activityError(res, error);
    }
  },
);

router.get(
  "/games",
  privateResponse,
  authMiddleware,
  async (req, res) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    try {
      const limit = queryNumber(
        req.query.limit,
        50,
        1,
        100,
        "limit",
      );

      const offset = queryNumber(
        req.query.offset,
        0,
        0,
        100000,
        "offset",
      );

      const steamId =
        await getLinkedSteamId(req.userId);

      const library =
        await getOwnedSteamGames(steamId);

      return res.json({
        success: true,
        totalCount: library.totalCount,
        limit,
        offset,
        games: library.games.slice(
          offset,
          offset + limit,
        ),
      });
    } catch (error) {
      return activityError(res, error);
    }
  },
);

router.delete("/connection", privateResponse, authMiddleware, async (req, res) => {
  if (!req.userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const requestOrigin = req.get("origin");
  let frontendOrigin: string;
  try {
    frontendOrigin = new URL(process.env.FRONTEND_URL ?? "").origin;
  } catch {
    return res.status(503).json({ success: false, message: "Steam linking is not configured." });
  }

  if (requestOrigin !== frontendOrigin) {
    return res.status(403).json({ success: false, message: "Origin is not allowed." });
  }

  try {
    await db.collection("users").doc(req.userId)
      .collection("linkedServices").doc("steam").delete();
    return res.json({ connected: false });
  } catch {
    return res.status(503).json({ success: false, message: "Could not disconnect Steam" });
  }
});

export default router;
