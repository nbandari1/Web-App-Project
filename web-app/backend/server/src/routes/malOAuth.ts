import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

const AUTHORIZE_URL =
  "https://myanimelist.net/v1/oauth2/authorize";

const TOKEN_URL =
  "https://myanimelist.net/v1/oauth2/token";

const REQUEST_LIFETIME_MS = 10 * 60 * 1000;

export class MalOAuthError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export type MalTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresAt: number;
};

export type MalAccount = {
  provider: "mal";
  providerUserId: string;
  username: string;
};

export type PendingMalAuthorization = {
  userId: string;
  browserHash: string;
  encryptedVerifier: string;
  redirectUri: string;
  expiresAt: number;
};

export interface MalOAuthStore {
  createRequest(
    id: string,
    request: PendingMalAuthorization,
  ): Promise<void>;

  consumeRequest(
    id: string,
    userId: string,
    browserHash: string,
    now: number,
  ): Promise<PendingMalAuthorization | null>;

  saveConnection(
    userId: string,
    account: MalAccount,
    encryptedTokens: string,
    expiresAt: number,
  ): Promise<void>;

  readCredentials(
    userId: string,
  ): Promise<{
    encryptedTokens: string;
    providerUserId: string;
    expiresAt?: number;
  } | null>;

  replaceCredentials(
    userId: string,
    previousCiphertext: string,
    encryptedTokens: string,
    expiresAt: number,
  ): Promise<boolean>;
}

export type MalOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  encryptionKey: Buffer;
};

export function getMalOAuthConfig(): MalOAuthConfig {
  const {
    MAL_CLIENT_ID,
    MAL_CLIENT_SECRET,
    MAL_REDIRECT_URI,
    MAL_TOKEN_ENCRYPTION_KEY,
  } = process.env;

  const encryptionKey = Buffer.from(
    MAL_TOKEN_ENCRYPTION_KEY ?? "",
    "base64",
  );

  if (
    !MAL_CLIENT_ID ||
    !MAL_CLIENT_SECRET ||
    !MAL_REDIRECT_URI ||
    encryptionKey.length !== 32
  ) {
    throw new MalOAuthError(
      503,
      "MAL linking is not configured. Contact the application administrator.",
    );
  }

  let redirect: URL;

  try {
    redirect = new URL(MAL_REDIRECT_URI);
  } catch {
    throw new MalOAuthError(
      503,
      "MAL callback URL must be an absolute URL.",
    );
  }

  const allowsLocalHttp =
    process.env.NODE_ENV !== "production" &&
    redirect.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(
      redirect.hostname,
    );

  if (
    redirect.username ||
    redirect.password ||
    redirect.hash ||
    redirect.search ||
    (redirect.protocol !== "https:" && !allowsLocalHttp)
  ) {
    throw new MalOAuthError(
      503,
      "MAL callback URL must use HTTPS. HTTP loopback is allowed in development.",
    );
  }

  return {
    clientId: MAL_CLIENT_ID,
    clientSecret: MAL_CLIENT_SECRET,
    redirectUri: MAL_REDIRECT_URI,
    encryptionKey,
  };
}

export function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function seal(
  value: string,
  key: Buffer,
  context: string,
): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  cipher.setAAD(Buffer.from(context));

  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  return [
    "v1",
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function unseal(
  value: string,
  key: Buffer,
  context: string,
): string {
  const [version, iv, tag, ciphertext, extra] =
    value.split(".");

  if (
    version !== "v1" ||
    !iv ||
    !tag ||
    !ciphertext ||
    extra !== undefined
  ) {
    throw new Error("Invalid encrypted MAL credentials");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "base64url"),
  );

  decipher.setAAD(Buffer.from(context));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function object(
  value: unknown,
): Record<string, unknown> {
  if (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return {};
}

export class MalOAuthService {
  private readonly getConfig: () => MalOAuthConfig;
  private readonly request: typeof fetch;
  private readonly now: () => number;

  constructor(
    private readonly store: MalOAuthStore,
    options: {
      getConfig?: () => MalOAuthConfig;
      fetch?: typeof fetch;
      now?: () => number;
    } = {},
  ) {
    this.getConfig =
      options.getConfig ?? getMalOAuthConfig;
    this.request = options.fetch ?? fetch;
    this.now = options.now ?? Date.now;
  }

  async begin(userId: string) {
    const config = this.getConfig();

    const state = randomBytes(32).toString("base64url");
    const browserBinding =
      randomBytes(32).toString("base64url");
    const verifier =
      randomBytes(64).toString("base64url");

    const id = digest(state);

    await this.store.createRequest(id, {
      userId,
      browserHash: digest(browserBinding),
      encryptedVerifier: seal(
        verifier,
        config.encryptionKey,
        `mal:${userId}:${id}:pkce`,
      ),
      redirectUri: config.redirectUri,
      expiresAt: this.now() + REQUEST_LIFETIME_MS,
    });

    const url = new URL(AUTHORIZE_URL);

    url.search = new URLSearchParams({
      response_type: "code",
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      state,
      code_challenge: verifier,
      code_challenge_method: "plain",
    }).toString();

    return {
      authorizationUrl: url.toString(),
      browserBinding,
      lifetimeMs: REQUEST_LIFETIME_MS,
    };
  }

  async complete(
    userId: string,
    input: {
      state: string;
      code: string;
      error: string;
      browserBinding: string;
    },
  ): Promise<MalAccount> {
    const config = this.getConfig();

    const validState =
      /^[A-Za-z0-9_-]{43}$/.test(input.state);

    const validBinding =
      /^[A-Za-z0-9_-]{43}$/.test(input.browserBinding);

    if (!validState || !validBinding) {
      throw new MalOAuthError(
        400,
        "Invalid or missing MAL authorization state. Start linking again.",
      );
    }

    const id = digest(input.state);

    const pending = await this.store.consumeRequest(
      id,
      userId,
      digest(input.browserBinding),
      this.now(),
    );

    if (!pending) {
      throw new MalOAuthError(
        400,
        "MAL authorization is invalid, expired, or already used. Start linking again.",
      );
    }

    if (input.error) {
      throw new MalOAuthError(
        400,
        "MAL authorization was cancelled or denied. Start linking again.",
      );
    }

    if (!input.code || input.code.length > 4096) {
      throw new MalOAuthError(
        400,
        "MAL authorization code is missing or invalid. Start linking again.",
      );
    }

    const verifier = unseal(
      pending.encryptedVerifier,
      config.encryptionKey,
      `mal:${userId}:${id}:pkce`,
    );

    const tokens = await this.exchange(
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: pending.redirectUri,
        code: input.code,
        code_verifier: verifier,
      }),
    );

    const profile = object(
      await this.fetchJson(
        "https://api.myanimelist.net/v2/users/@me",
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        },
      ),
    );

    if (
      typeof profile.id !== "number" ||
      !Number.isSafeInteger(profile.id) ||
      profile.id <= 0 ||
      typeof profile.name !== "string" ||
      !profile.name.trim()
    ) {
      throw new MalOAuthError(
        502,
        "MAL returned an invalid account profile. Start linking again.",
      );
    }

    const account: MalAccount = {
      provider: "mal",
      providerUserId: String(profile.id),
      username: profile.name,
    };

    await this.store.saveConnection(
      userId,
      account,
      seal(
        JSON.stringify(tokens),
        config.encryptionKey,
        `mal:${userId}:tokens`,
      ),
      tokens.expiresAt,
    );

    return account;
  }

  async getAccessToken(userId: string): Promise<string> {
    const current =
      await this.store.readCredentials(userId);

    if (!current) {
      throw new MalOAuthError(
        404,
        "No MAL account is linked.",
      );
    }

    let oldTokens: MalTokens;

    try {
      const config = this.getConfig();
      oldTokens = JSON.parse(
        unseal(
          current.encryptedTokens,
          config.encryptionKey,
          `mal:${userId}:tokens`,
        ),
      ) as MalTokens;
    } catch {
      throw new MalOAuthError(
        401,
        "The MAL connection needs to be reconnected.",
      );
    }

    if (
      typeof oldTokens.accessToken !== "string" ||
      !oldTokens.accessToken ||
      typeof oldTokens.refreshToken !== "string" ||
      !oldTokens.refreshToken ||
      oldTokens.tokenType !== "Bearer" ||
      typeof oldTokens.expiresAt !== "number" ||
      !Number.isSafeInteger(oldTokens.expiresAt)
    ) {
      throw new MalOAuthError(
        401,
        "The MAL connection needs to be reconnected.",
      );
    }

    const expiresAt =
      current.expiresAt ?? oldTokens.expiresAt;

    if (
      typeof expiresAt === "number" &&
      expiresAt > this.now() + 5 * 60 * 1000
    ) {
      return oldTokens.accessToken;
    }

    return (await this.refreshTokens(
      userId,
      current,
      oldTokens,
    )).accessToken;
  }

  async refresh(userId: string): Promise<void> {
    await this.refreshTokens(
      userId,
      await this.store.readCredentials(userId),
    );
  }

  private async refreshTokens(
    userId: string,
    current: Awaited<ReturnType<MalOAuthStore["readCredentials"]>>,
    oldTokens?: MalTokens,
  ): Promise<MalTokens> {
    const config = this.getConfig();

    if (!current) {
      throw new MalOAuthError(
        404,
        "No MAL account is linked.",
      );
    }

    if (!oldTokens) {
      try {
        oldTokens = JSON.parse(
          unseal(
            current.encryptedTokens,
            config.encryptionKey,
            `mal:${userId}:tokens`,
          ),
        ) as MalTokens;
      } catch {
        throw new MalOAuthError(
          401,
          "The MAL connection needs to be reconnected.",
        );
      }
    }

    if (
      typeof oldTokens.refreshToken !== "string" ||
      !oldTokens.refreshToken
    ) {
      throw new MalOAuthError(
        401,
        "The MAL connection needs to be reconnected.",
      );
    }

    const tokens = await this.exchange(
      new URLSearchParams({
        grant_type: "refresh_token",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: oldTokens.refreshToken,
      }),
      oldTokens.refreshToken,
    );

    const replaced =
      await this.store.replaceCredentials(
        userId,
        current.encryptedTokens,
        seal(
          JSON.stringify(tokens),
          config.encryptionKey,
          `mal:${userId}:tokens`,
        ),
        tokens.expiresAt,
      );

    if (!replaced) {
      throw new MalOAuthError(
        409,
        "MAL connection changed. Retry the request.",
      );
    }

    return tokens;
  }

  private async exchange(
    body: URLSearchParams,
    fallbackRefreshToken?: string,
  ): Promise<MalTokens> {
    const data = object(
      await this.fetchJson(TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body,
      }, Boolean(fallbackRefreshToken)),
    );

    const refreshToken =
      data.refresh_token ?? fallbackRefreshToken;

    if (
      typeof data.access_token !== "string" ||
      !data.access_token ||
      typeof refreshToken !== "string" ||
      !refreshToken ||
      typeof data.token_type !== "string" ||
      data.token_type.toLowerCase() !== "bearer" ||
      typeof data.expires_in !== "number" ||
      !Number.isSafeInteger(data.expires_in) ||
      data.expires_in <= 0 ||
      data.expires_in > 365 * 24 * 60 * 60
    ) {
      throw new MalOAuthError(
        502,
        "MAL returned an invalid token response. Start linking again.",
      );
    }

    return {
      accessToken: data.access_token,
      refreshToken,
      tokenType: "Bearer",
      expiresAt:
        this.now() + data.expires_in * 1000,
    };
  }

  private async fetchJson(
    url: string,
    options: RequestInit,
    refreshTokenRequest = false,
  ): Promise<unknown> {
    try {
      const response = await this.request(url, {
        ...options,
        signal: AbortSignal.timeout(10000),
        redirect: "error",
      });

      if (!response.ok) {
        if (
          refreshTokenRequest &&
          [400, 401, 403].includes(response.status)
        ) {
          throw new MalOAuthError(
            401,
            "The MAL connection has expired. Reconnect MAL and try again.",
          );
        }
        throw new Error("Provider rejected request");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof MalOAuthError) {
        throw error;
      }
      throw new MalOAuthError(
        502,
        "MAL authorization request failed. Please try linking again.",
      );
    }
  }
}