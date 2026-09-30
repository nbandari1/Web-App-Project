import express, { Request, Response } from "express";
import { db } from "../config/firebase";

const router = express.Router();

type FirestoreUser = {
  id: string;
  name: string | undefined;
  email: string | undefined;
  password: string | undefined;
  createdAt: string | null;
};

function serializeUser(
  doc:
    | FirebaseFirestore.QueryDocumentSnapshot
    | FirebaseFirestore.DocumentSnapshot,
): FirestoreUser {
  const data = doc.data() ?? {};
  const createdAtValue = data.createdAt;
  const createdAt =
    createdAtValue && typeof createdAtValue.toDate === "function"
      ? createdAtValue.toDate().toISOString()
      : null;

  return {
    id: typeof data.id === "string" && data.id ? data.id : doc.id,
    name: typeof data.name === "string" ? data.name : undefined,
    email: typeof data.email === "string" ? data.email : undefined,
    password: typeof data.password === "string" ? data.password : undefined,
    createdAt,
  };
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUserSnapshot = await db
      .collection("users")
      .where("email", "==", normalizedEmail)
      .limit(1)
      .get();

    if (!existingUserSnapshot.empty) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    const newUserRef = db.collection("users").doc();

    await newUserRef.set({
      id: newUserRef.id,
      name: String(name).trim(),
      email: normalizedEmail,
      password,
      createdAt: new Date(),
    });

    return res.status(201).json({
      message: "User stored successfully.",
      user: {
        id: newUserRef.id,
        name: String(name).trim(),
        email: normalizedEmail,
      },
    });
  } catch (error) {
    console.error("CREATE ERROR:", error);
    return res.status(500).json({ message: "Failed to create user." });
  }
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => serializeUser(doc));

    return res.status(200).json(users);
  } catch (error) {
    console.error("GET ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch users." });
  }
});

router.get("/stream/:id", (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!id) {
    return res.status(400).json({ message: "User id is required." });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const unsubscribe = db.collection("users").doc(id).onSnapshot(
    (snapshot) => {
      const user = snapshot.exists ? serializeUser(snapshot) : null;
      res.write(`data: ${JSON.stringify(user)}\n\n`);
    },
    (error) => {
      console.error("STREAM ERROR:", error);
      res.write(
        `event: error\ndata: ${JSON.stringify({
          message: "Failed to stream users.",
        })}\n\n`,
      );
    },
  );

  const heartbeat = setInterval(() => {
    res.write(": keep-alive\n\n");
  }, 30000);

  req.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
    res.end();
  });

  return undefined;
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      return res.status(400).json({ message: "User id is required." });
    }

    await db.collection("users").doc(id).update(req.body);

    return res.status(200).json({ message: "User updated successfully." });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    return res.status(500).json({ message: "Failed to update user." });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      return res.status(400).json({ message: "User id is required." });
    }

    await db.collection("users").doc(id).delete();

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return res.status(500).json({ message: "Failed to delete user." });
  }
});

export default router;
