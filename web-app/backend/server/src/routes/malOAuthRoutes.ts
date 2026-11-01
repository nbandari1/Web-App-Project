import express, {
  type Request,
  type Response,
  type RequestHandler,
} from "express";

import authMiddleware from "../middleware/authMiddleware";

import {
  MalOAuthError,
  type MalOAuthService,
} from "./malOAuth";

const COOKIE = "mal_oauth_session";

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/mal",
});

const text = (value: unknown): string =>
  typeof value === "string" ? value : "";

function browserBinding(req: Request): string {
  const value = req.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE}=`));

  return value ? value.slice(COOKIE.length + 1) : "";
}

function dashboardRedirect(): string {
  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new MalOAuthError(
      503,
      "Frontend redirect URL is not configured.",
    );
  }

  let url: URL;

  try {
    url = new URL(frontendUrl);
  } catch {
    throw new MalOAuthError(
      503,
      "Frontend redirect URL is invalid.",
    );
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
    throw new MalOAuthError(
      503,
      "Frontend redirect URL is invalid.",
    );
  }

  const dashboardUrl = new URL("/dashboard", url.origin);
  dashboardUrl.searchParams.set("mal", "connected");

  return dashboardUrl.toString();
}

function fail(res: Response, error: unknown) {
  if (error instanceof MalOAuthError) {
    return res.status(error.status).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message:
      "Could not save the MAL connection. Please start linking again.",
  });
}

export function createMalOAuthRouter(
  service: MalOAuthService,
  authenticate: RequestHandler = authMiddleware,
) {
  const router = express.Router();

  const privateResponse: RequestHandler = (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
  };

  router.get(
    "/authorize",
    privateResponse,
    authenticate,
    async (req, res) => {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      try {
        // Validate the return destination before starting OAuth.
        dashboardRedirect();

        const start = await service.begin(req.userId);

        res.cookie(COOKIE, start.browserBinding, {
          ...cookieOptions(),
          maxAge: start.lifetimeMs,
        });

        if (req.query.format === "json") {
          return res.json({
            success: true,
            authorizationUrl: start.authorizationUrl,
          });
        }

        return res.redirect(302, start.authorizationUrl);
      } catch (error) {
        return fail(res, error);
      }
    },
  );

  const callback: RequestHandler = async (req, res) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    try {
      // Validate before consuming the authorization request.
      const redirectUrl = dashboardRedirect();

      const input = req.method === "GET" ? req.query : req.body;

      await service.complete(req.userId, {
        state: text(input?.state),
        code: text(input?.code),
        error: text(input?.error),
        browserBinding: browserBinding(req),
      });

      res.clearCookie(COOKIE, cookieOptions());

      // Tokens stay on the backend.
      return res.redirect(303, redirectUrl);
    } catch (error) {
      return fail(res, error);
    }
  };

  router.get(
    "/callback",
    privateResponse,
    authenticate,
    callback,
  );

  router.post(
    "/callback",
    privateResponse,
    authenticate,
    callback,
  );

  // MAL connection status and unlink endpoints will be added here by the teammate.
  router.post(
    "/token/refresh",
    privateResponse,
    authenticate,
    async (req, res) => {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      try {
        await service.refresh(req.userId);

        return res.json({
          success: true,
          message: "MAL connection refreshed.",
        });
      } catch (error) {
        return fail(res, error);
      }
    },
  );

  return router;
}