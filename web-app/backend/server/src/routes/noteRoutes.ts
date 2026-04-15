import express, { Request, Response } from "express";
import { db } from "../config/firebase";

const router = express.Router({ mergeParams: true });

type FirestoreNote = {
  id: string;
  title: string;
  content: string;
  createdAt: string | null;
};

function getUserId(req: Request) {
  return Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
}

function serializeNote(
  doc:
    | FirebaseFirestore.QueryDocumentSnapshot
    | FirebaseFirestore.DocumentSnapshot,
): FirestoreNote {
  const data = doc.data() ?? {};
  const createdAtValue = data.createdAt;
  const createdAt =
    createdAtValue && typeof createdAtValue.toDate === "function"
      ? createdAtValue.toDate().toISOString()
      : null;

  return {
    id: doc.id,
    title: typeof data.title === "string" ? data.title : "",
    content: typeof data.content === "string" ? data.content : "",
    createdAt,
  };
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { title, content } = req.body as {
      title?: string;
      content?: string;
    };

    if (!userId) {
      return res.status(400).json({ message: "User id is required." });
    }

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    const notesRef = db.collection("users").doc(userId).collection("notes");
    const newNoteRef = notesRef.doc();

    await newNoteRef.set({
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date(),
    });

    return res.status(201).json({
      message: "Note created successfully.",
      note: {
        id: newNoteRef.id,
        title: title.trim(),
        content: content.trim(),
      },
    });
  } catch (error) {
    console.error("NOTE CREATE ERROR:", error);
    return res.status(500).json({ message: "Failed to create note." });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(400).json({ message: "User id is required." });
    }

    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("notes")
      .orderBy("createdAt", "desc")
      .get();

    return res.status(200).json(snapshot.docs.map((doc) => serializeNote(doc)));
  } catch (error) {
    console.error("NOTE GET ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch notes." });
  }
});

router.get("/stream", (req: Request, res: Response) => {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(400).json({ message: "User id is required." });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const unsubscribe = db
    .collection("users")
    .doc(userId)
    .collection("notes")
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        const notes = snapshot.docs.map((doc) => serializeNote(doc));
        res.write(`data: ${JSON.stringify(notes)}\n\n`);
      },
      (error) => {
        console.error("NOTE STREAM ERROR:", error);
        res.write(
          `event: error\ndata: ${JSON.stringify({
            message: "Failed to stream notes.",
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

router.delete("/:noteId", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const noteId = Array.isArray(req.params.noteId)
      ? req.params.noteId[0]
      : req.params.noteId;

    if (!userId || !noteId) {
      return res.status(400).json({ message: "User id and note id are required." });
    }

    await db.collection("users").doc(userId).collection("notes").doc(noteId).delete();

    return res.status(200).json({ message: "Note deleted successfully." });
  } catch (error) {
    console.error("NOTE DELETE ERROR:", error);
    return res.status(500).json({ message: "Failed to delete note." });
  }
});

export default router;
