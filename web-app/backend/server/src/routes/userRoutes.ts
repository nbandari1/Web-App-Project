import express, { Request, Response } from "express";
import { db } from "../config/firebase";

const router = express.Router();

async function createUserAccount(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const usersRef = db.collection("users");
    const existingUser = await usersRef.where("email", "==", email).limit(1).get();

    if (!existingUser.empty) {
      return res.status(409).json({ message: "Email already in use." });
    }

    const newUserRef = usersRef.doc();

    await newUserRef.set({
      id: newUserRef.id,
      email,
      password,
      createdAt: new Date(),
    });

    return res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: newUserRef.id,
        email,
      },
    });
  } catch (error) {
    console.error("CREATE ERROR:", error);
    return res.status(500).json({ message: "Failed to create user." });
  }
}

router.post("/", createUserAccount);
router.post("/register", createUserAccount);

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const usersRef = db.collection("users");
    const snapshot = await usersRef
      .where("email", "==", email)
      .where("password", "==", password)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res
        .status(401)
        .json({ message: "Invalid email or password." });
    }

    const userDoc = snapshot.docs[0];
    if (!userDoc) {
      return res
        .status(401)
        .json({ message: "Invalid email or password." });
    }

    const userData = userDoc.data();

    return res.status(200).json({
      message: "Login successful.",
      user: userData,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Failed to login." });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    const usersRef = db.collection("users");

    if (email && typeof email === "string") {
      const snapshot = await usersRef.where("email", "==", email).get();
      const users = snapshot.docs.map((doc) => doc.data());
      return res.status(200).json(users);
    }

    const snapshot = await usersRef.get();
    const users = snapshot.docs.map((doc) => doc.data());

    return res.status(200).json(users);
  } catch (error) {
    console.error("GET ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch users." });
  }
});

// TODO: create a Firestore collection named "settings" to store user settings.
router.get("/settings/:userId", async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "User id is required." });
    }

    const settingsDoc = await db.collection("settings").doc(userId).get();
    if (!settingsDoc.exists) {
      return res.status(200).json({ userId, darkMode: false, accountSettings: {}, signedOut: false });
    }

    return res.status(200).json(settingsDoc.data());
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch settings." });
  }
});

router.put("/settings/:userId", async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "User id is required." });
    }

    const settings = req.body;
    await db.collection("settings").doc(userId).set(settings, { merge: true });

    return res.status(200).json({ message: "Settings updated successfully." });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);
    return res.status(500).json({ message: "Failed to update settings." });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      return res.status(400).json({ message: "User id is required." });
    }

    const doc = await db.collection("users").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(doc.data());
  } catch (error) {
    console.error("GET BY ID ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch user." });
  }
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
