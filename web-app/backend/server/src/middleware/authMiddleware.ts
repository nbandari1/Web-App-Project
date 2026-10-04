import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const AUTH_COOKIE_NAME = "auth_token";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

function getCookieValue(cookieHeader: string | undefined, cookieName: string) {
  if (!cookieHeader) {
    return undefined;
  }

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const matchingCookie = cookies.find((cookie) => cookie.startsWith(`${cookieName}=`));

  if (!matchingCookie) {
    return undefined;
  }

  return decodeURIComponent(matchingCookie.split("=").slice(1).join("="));
}

export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = getCookieValue(req.headers.cookie, AUTH_COOKIE_NAME);

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, secret) as { userId?: string };

    if (!decoded.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    req.userId = decoded.userId;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}
