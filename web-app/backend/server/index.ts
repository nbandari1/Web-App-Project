import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { db } from "./src/config/firebase";
import noteRoutes from "./src/routes/noteRoutes";
import userRoutes from "./src/routes/userRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
    "https://web-app-project-qly4.onrender.com/",
    "http://localhost:3000"
    ],
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Backend is running");
});

app.use("/api/users", userRoutes);
app.use("/api/users/:userId/notes", noteRoutes);
app.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res
      .status(400)
      .json({ success: false, message: "Email and password are required." });
    return;
  }

  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef
      .where("email", "==", email.trim().toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) {
      res.status(401).json({ success: false, message: "Invalid email or password." });
      return;
    }

    const userData = snapshot.docs[0]?.data() as
      | { id?: string; name?: string; email?: string; password?: string }
      | undefined;

    if (!userData || userData.password !== password) {
      res.status(401).json({ success: false, message: "Invalid email or password." });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: userData.id ?? snapshot.docs[0]?.id,
        name: userData.name,
        email: userData.email,
      },
    });
  } catch (error) {
    console.error("Auth check failed:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
