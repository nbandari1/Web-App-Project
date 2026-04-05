import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "../server/src/routes/userRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
