<<<<<<< HEAD
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "../server/src/routes/userRoutes";

dotenv.config();
=======
const express = require("express");
const cors = require("cors");
const { db } = require("./src/config/firebase");
>>>>>>> 2b78214e08aef135bf58e4d37711edb04a7f061a

const app = express();
const PORT = process.env.PORT || 5000;

<<<<<<< HEAD
app.use(
  cors({
    origin: "http://localhost:3000", // Vite frontend
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Backend is running");
});

app.use("/api/users", userRoutes);
=======
app.use(cors());
app.use(express.json());

app.get("/", (req: any, res: any) => {
  res.send("Backend is running");
});

// POST /auth/login
// Checks whether the provided email exists in the Firestore `users` collection.
app.post("/auth/login", async (req: any, res: any) => {
  const { email } = req.body as { email?: string };

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required." });
    return;
  }

  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).limit(1).get();

    if (snapshot.empty) {
      res.status(401).json({ success: false, message: "Email not recognized." });
      return;
    }

    const userData = snapshot.docs[0]?.data();

    // TODO: Add session/token logic here once frontend auth flow is finalized.

    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    console.error("Auth check failed:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});
>>>>>>> 2b78214e08aef135bf58e4d37711edb04a7f061a

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
