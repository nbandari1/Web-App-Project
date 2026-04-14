import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const googleCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!admin.apps.length) {
  if (googleCredentials) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } else {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Missing Firebase environment variables.");
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
}

export const db = admin.firestore();
