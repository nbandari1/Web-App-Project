import express, { Request, Response } from "express";
import { db } from "../config/firebase";

const router = express.Router({ mergeParams: true });

function getUserId(req: Request) {
  return Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
}

function serializeTask(
  doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot,
) {
  const data = doc.data() ?? {};
  const createdAtValue = data.createdAt;
  const dueDateValue = data.dueDate;
  const updatedAtValue = data.updatedAt;

  const serializeDate = (value: unknown) =>
    value && typeof value === "object" && "toDate" in value
      ? (value as FirebaseFirestore.Timestamp).toDate().toISOString()
      : typeof value === "string"
        ? value
        : null;

  return {
    id: doc.id,
    title: typeof data.title === "string" ? data.title : "",
    description: typeof data.description === "string" ? data.description : "",
    status: ["completed", "in_progress"].includes(data.status) ? data.status : "todo",
    priority: ["low", "high"].includes(data.priority) ? data.priority : "medium",
    dueDate: serializeDate(dueDateValue),
    createdAt: serializeDate(createdAtValue),
    updatedAt: serializeDate(updatedAtValue),
  };
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(400).json({ message: "User id is required." });

    const snapshot = await db.collection("users").doc(userId).collection("tasks").get();
    return res.status(200).json(snapshot.docs.map((doc) => serializeTask(doc)));
  } catch (error) {
    console.error("TASK GET ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch tasks." });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { title, description, dueDate, priority } = req.body as {
      priority?: string;
      title?: string;
      description?: string;
      dueDate?: string;
    };

    if (!userId) return res.status(400).json({ message: "User id is required." });
    if (!title?.trim()) return res.status(400).json({ message: "Task title is required." });

    if (priority !== undefined && !["low", "medium", "high"].includes(priority)) return res.status(400).json({ message: "Invalid priority." });
    const tasksRef = db.collection("users").doc(userId).collection("tasks");
    const taskRef = tasksRef.doc();
    const now = new Date();
    await taskRef.set({
      title: title.trim(),
      description: description?.trim() || "",
      status: "todo",
      priority: priority ?? "medium",
      dueDate: dueDate?.trim() || null,
      createdAt: now,
      updatedAt: now,
    });

    const task = await taskRef.get();
    return res.status(201).json({ message: "Task created successfully.", task: serializeTask(task) });
  } catch (error) {
    console.error("TASK CREATE ERROR:", error);
    return res.status(500).json({ message: "Failed to create task." });
  }
});

router.patch("/:taskId", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
    const { status } = req.body as { status?: string };

    if (!userId || !taskId) return res.status(400).json({ message: "User id and task id are required." });
    if (!["todo", "in_progress", "completed"].includes(status ?? "")) {
      return res.status(400).json({ message: "Invalid task status." });
    }

    await db.collection("users").doc(userId).collection("tasks").doc(taskId).update({
      status,
      updatedAt: new Date(),
    });
    return res.status(200).json({ message: "Task updated successfully." });
  } catch (error) {
    console.error("TASK UPDATE ERROR:", error);
    return res.status(500).json({ message: "Failed to update task." });
  }
});

router.delete("/:taskId", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
    if (!userId || !taskId) return res.status(400).json({ message: "User id and task id are required." });

    await db.collection("users").doc(userId).collection("tasks").doc(taskId).delete();
    return res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("TASK DELETE ERROR:", error);
    return res.status(500).json({ message: "Failed to delete task." });
  }
});

router.get("/stream", (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(400).json({ message: "User id is required." });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const unsubscribe = db.collection("users").doc(userId).collection("tasks").onSnapshot(
    (snapshot) => res.write(`data: ${JSON.stringify(snapshot.docs.map((doc) => serializeTask(doc)))}\n\n`),
    (error) => {
      console.error("TASK STREAM ERROR:", error);
      res.write(`event: error\ndata: ${JSON.stringify({ message: "Failed to stream tasks." })}\n\n`);
    },
  );

  const heartbeat = setInterval(() => res.write(": keep-alive\n\n"), 30000);
  req.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
    res.end();
  });
  return undefined;
});

export default router;
