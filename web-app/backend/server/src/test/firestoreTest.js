const { db } = require("../config/firebase");

async function testFirestore() {
  try {
    const userId = "test-user-001";

    await db.collection("users").doc(userId).set({
      displayName: "Ryan",
      email: "ryan@example.com",
      createdAt: new Date(),
      avatarUrl: null,
      themePreference: "dark",
      timeZone: "America/Toronto",
    });

    await db.collection("users").doc(userId).collection("tasks").doc("task1").set({
      title: "Finish setup",
      description: "Confirm Firestore structure works",
      status: "todo",
      priority: "high",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.collection("users").doc(userId).collection("notes").doc("note1").set({
      title: "Dashboard idea",
      content: "Add Steam widget on right side",
      pinned: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      color: "#FFD966",
    });

    await db.collection("users").doc(userId).collection("timers").doc("timer1").set({
      label: "Pomodoro Session",
      startedAt: new Date(),
      endedAt: null,
      durationMinutes: 25,
      status: "completed",
      linkedTaskId: "task1",
    });

    await db.collection("users").doc(userId).collection("linkedServices").doc("steam1").set({
      serviceType: "steam",
      displayName: "ryan_plays",
      externalUserId: "76561198000000000",
      linkedAt: new Date(),
      scopes: ["read_profile"],
      lastSyncedAt: null,
      isActive: true,
    });

    console.log("Firestore structure created successfully.");
  } catch (error) {
    console.error("Firestore test failed:", error);
  }
}

testFirestore();