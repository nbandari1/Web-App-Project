import express, { Request, Response } from "express";
import { db } from "../config/firebase";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const newUserRef = db.collection("users").doc();

    await newUserRef.set({
      id: newUserRef.id,
      email,
      password,
      createdAt: new Date(),
    });

    return res.status(201).json({
      message: "User stored successfully.",
      user: {
        id: newUserRef.id,
        email,
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
    const users = snapshot.docs.map((doc) => doc.data());

    return res.status(200).json(users);
  } catch (error) {
    console.error("GET ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch users." });
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
