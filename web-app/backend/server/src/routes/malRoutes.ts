import express, { Request, Response } from "express";

const router = express.Router();
const MAL_API_URL = "https://api.myanimelist.net/v2";
const MAL_TOKEN_URL = "https://myanimelist.net/v1/oauth2/token";

function getMalClientId() {
  const clientId = process.env.MAL_CLIENT_ID;

  if (!clientId) {
    throw new Error("MAL_CLIENT_ID is not configured");
  }

  return clientId;
}

async function malApiRequest(path: string) {
  const response = await fetch(`${MAL_API_URL}${path}`, {
    headers: { "X-MAL-CLIENT-ID": getMalClientId() },
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `MAL API request failed (${response.status})`);
  }

  return data;
}

// #TBD: Subject to change. This basic refresh method does not yet store tokens or handle expiration automatically.
// #TBD: Subject to change. OAuth state validation and secure token storage are not implemented yet.
async function exchangeMalAuthorizationCode(code: string, codeVerifier?: string) {
  const clientId = getMalClientId();
  const clientSecret = process.env.MAL_CLIENT_SECRET;
  const redirectUri = process.env.MAL_REDIRECT_URI;

  if (!clientSecret || !redirectUri) {
    throw new Error("MAL_CLIENT_SECRET and MAL_REDIRECT_URI must be configured");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });

  // #TBD: Subject to change; token exchange and PKCE fields may be revised.
  if (codeVerifier) {
    body.set("code_verifier", codeVerifier);
  }

  const response = await fetch(MAL_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error_description || data?.error || `MAL authorization failed (${response.status})`);
  }

  return data as {
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token?: string;
  };
}

async function refreshMalAccessToken(refreshToken: string) {
  const clientId = getMalClientId();
  const clientSecret = process.env.MAL_CLIENT_SECRET;

  if (!clientSecret) {
    throw new Error("MAL_CLIENT_SECRET is not configured");
  }

  const response = await fetch(MAL_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error_description || data?.error || `MAL token refresh failed (${response.status})`);
  }

  return data as {
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token?: string;
  };
}

async function handleMalCallback(req: Request, res: Response) {
  try {
    const code = typeof req.query.code === "string"
      ? req.query.code.trim()
      : typeof req.body?.code === "string" ? req.body.code.trim() : "";
    const codeVerifier = typeof req.query.code_verifier === "string"
      ? req.query.code_verifier.trim()
      : typeof req.body?.codeVerifier === "string" ? req.body.codeVerifier.trim() : undefined;

    if (!code) {
      return res.status(400).json({ success: false, message: "code is required" });
    }

    // #TBD: Subject to change; store tokens and validate OAuth state in a later implementation.
    const data = await exchangeMalAuthorizationCode(code, codeVerifier);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to complete MAL authorization";
    return res.status(502).json({ success: false, message });
  }
}

// OAuth redirects should use this route as MAL_REDIRECT_URI.
router.get("/callback", handleMalCallback);
router.post("/callback", handleMalCallback);

router.post("/token/refresh", async (req: Request, res: Response) => {
  try {
    const refreshToken = typeof req.body?.refreshToken === "string"
      ? req.body.refreshToken.trim()
      : "";

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "refreshToken is required" });
    }

    // #TBD: Subject to change; replace this direct request flow with persistent per-user token management later.
    const data = await refreshMalAccessToken(refreshToken);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to refresh MAL access token";
    return res.status(502).json({ success: false, message });
  }
});

router.get("/anime", async (req: Request, res: Response) => {
  try {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const rawLimit = typeof req.query.limit === "string" ? Number(req.query.limit) : 10;
    const rawOffset = typeof req.query.offset === "string" ? Number(req.query.offset) : 0;
    const limit = Number.isInteger(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 10;
    const offset = Number.isInteger(rawOffset) ? Math.max(rawOffset, 0) : 0;

    if (!query) {
      return res.status(400).json({ success: false, message: "q is required" });
    }

    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
      offset: String(offset),
      fields: "id,title,main_picture,synopsis,status,num_episodes,start_date,end_date,mean,genres",
    });

    const data = await malApiRequest(`/anime?${params.toString()}`);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to search anime";
    return res.status(502).json({ success: false, message });
  }
});

router.get("/anime/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ success: false, message: "A valid anime id is required" });
    }

    const fields = "id,title,main_picture,alternative_titles,synopsis,status,num_episodes,start_date,end_date,mean,rank,popularity,num_list_users,num_scoring_users,genres,studios,rating,pictures,related_anime,recommendations";
    const data = await malApiRequest(`/anime/${numericId}?fields=${encodeURIComponent(fields)}`);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch anime";
    return res.status(502).json({ success: false, message });
  }
});

router.get("/users/:username", async (req: Request, res: Response) => {
  try {
    const username = Array.isArray(req.params.username) ? req.params.username[0] : req.params.username;

    if (!username) {
      return res.status(400).json({ success: false, message: "A username is required" });
    }

    // #TBD: User-specific endpoints that require a user's OAuth token should be implemented later.
    const data = await malApiRequest(`/users/${encodeURIComponent(username)}?fields=anime_statistics`);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch MAL user";
    return res.status(502).json({ success: false, message });
  }
});

router.get("/users/:username/animelist", async (req: Request, res: Response) => {
  try {
    const username = Array.isArray(req.params.username) ? req.params.username[0] : req.params.username;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const rawLimit = typeof req.query.limit === "string" ? Number(req.query.limit) : 100;
    const rawOffset = typeof req.query.offset === "string" ? Number(req.query.offset) : 0;
    const limit = Number.isInteger(rawLimit) ? Math.min(Math.max(rawLimit, 1), 1000) : 100;
    const offset = Number.isInteger(rawOffset) ? Math.max(rawOffset, 0) : 0;

    if (!username) {
      return res.status(400).json({ success: false, message: "A username is required" });
    }

    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      fields: "list_status{status,score,num_episodes_watched,is_rewatching,updated_at,tags}",
    });

    if (status) {
      params.set("status", status);
    }

    // #TBD: Add OAuth access/refresh-token handling later before depending on private user-list data.
    const data = await malApiRequest(`/users/${encodeURIComponent(username)}/animelist?${params.toString()}`);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch MAL anime list";
    return res.status(502).json({ success: false, message });
  }
});

export default router;