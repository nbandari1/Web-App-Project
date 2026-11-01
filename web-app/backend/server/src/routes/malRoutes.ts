import express, {
  Request,
  Response,
} from "express";

import { db } from "../config/firebase";
import { createMalOAuthRouter } from "./malOAuthRoutes";
import { MalOAuthService } from "../routes/malOAuth";
import { createMalOAuthStore } from "./malOAuthStore";

const router = express.Router();

const MAL_API_URL =
  "https://api.myanimelist.net/v2";

router.use(
  createMalOAuthRouter(
    new MalOAuthService(
      createMalOAuthStore(db),
    ),
  ),
);

function getMalClientId() {
  const clientId = process.env.MAL_CLIENT_ID;

  if (!clientId) {
    throw new Error(
      "MAL_CLIENT_ID is not configured",
    );
  }

  return clientId;
}

async function malApiRequest(path: string) {
  const response = await fetch(
    `${MAL_API_URL}${path}`,
    {
      headers: {
        "X-MAL-CLIENT-ID": getMalClientId(),
      },
    },
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `MAL API request failed (${response.status})`,
    );
  }

  return data;
}

router.get(
  "/anime",
  async (req: Request, res: Response) => {
    try {
      const query =
        typeof req.query.q === "string"
          ? req.query.q.trim()
          : "";

      const rawLimit =
        typeof req.query.limit === "string"
          ? Number(req.query.limit)
          : 10;

      const rawOffset =
        typeof req.query.offset === "string"
          ? Number(req.query.offset)
          : 0;

      const limit = Number.isInteger(rawLimit)
        ? Math.min(Math.max(rawLimit, 1), 100)
        : 10;

      const offset = Number.isInteger(rawOffset)
        ? Math.max(rawOffset, 0)
        : 0;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: "q is required",
        });
      }

      const params = new URLSearchParams({
        q: query,
        limit: String(limit),
        offset: String(offset),
        fields:
          "id,title,main_picture,synopsis,status,num_episodes,start_date,end_date,mean,genres",
      });

      const data = await malApiRequest(
        `/anime?${params.toString()}`,
      );

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to search anime";

      return res.status(502).json({
        success: false,
        message,
      });
    }
  },
);

router.get(
  "/anime/:id",
  async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const numericId = Number(id);

      if (
        !Number.isInteger(numericId) ||
        numericId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A valid anime id is required",
        });
      }

      const fields =
        "id,title,main_picture,alternative_titles,synopsis,status,num_episodes,start_date,end_date,mean,rank,popularity,num_list_users,num_scoring_users,genres,studios,rating,pictures,related_anime,recommendations";

      const data = await malApiRequest(
        `/anime/${numericId}?fields=${encodeURIComponent(fields)}`,
      );

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch anime";

      return res.status(502).json({
        success: false,
        message,
      });
    }
  },
);

router.get(
  "/users/:username",
  async (req: Request, res: Response) => {
    try {
      const username = Array.isArray(
        req.params.username,
      )
        ? req.params.username[0]
        : req.params.username;

      if (!username) {
        return res.status(400).json({
          success: false,
          message: "A username is required",
        });
      }

      // Existing data endpoint; private-user
      // data integration remains separate work.
      const data = await malApiRequest(
        `/users/${encodeURIComponent(username)}?fields=anime_statistics`,
      );

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch MAL user";

      return res.status(502).json({
        success: false,
        message,
      });
    }
  },
);

router.get(
  "/users/:username/animelist",
  async (req: Request, res: Response) => {
    try {
      const username = Array.isArray(
        req.params.username,
      )
        ? req.params.username[0]
        : req.params.username;

      const status =
        typeof req.query.status === "string"
          ? req.query.status
          : undefined;

      const rawLimit =
        typeof req.query.limit === "string"
          ? Number(req.query.limit)
          : 100;

      const rawOffset =
        typeof req.query.offset === "string"
          ? Number(req.query.offset)
          : 0;

      const limit = Number.isInteger(rawLimit)
        ? Math.min(
            Math.max(rawLimit, 1),
            1000,
          )
        : 100;

      const offset = Number.isInteger(rawOffset)
        ? Math.max(rawOffset, 0)
        : 0;

      if (!username) {
        return res.status(400).json({
          success: false,
          message: "A username is required",
        });
      }

      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
        fields:
          "list_status{status,score,num_episodes_watched,is_rewatching,updated_at,tags}",
      });

      if (status) {
        params.set("status", status);
      }

      const data = await malApiRequest(
        `/users/${encodeURIComponent(username)}/animelist?${params.toString()}`,
      );

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch MAL anime list";

      return res.status(502).json({
        success: false,
        message,
      });
    }
  },
);

export default router;