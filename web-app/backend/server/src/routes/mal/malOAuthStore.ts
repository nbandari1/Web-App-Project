import {
  FieldValue,
  Timestamp,
  type Firestore,
} from "firebase-admin/firestore";

import {
  MalOAuthError,
  type MalOAuthStore,
  type PendingMalAuthorization,
} from "./malOAuth";

export function createMalOAuthStore(
  db: Firestore,
): MalOAuthStore {
  const requests =
    db.collection("_malOAuthRequests");

  const credentials =
    db.collection("_malCredentials");

  const connection = (userId: string) =>
    db
      .collection("users")
      .doc(userId)
      .collection("linkedServices")
      .doc("mal");

  return {
    async createRequest(id, request) {
      await requests.doc(id).create({
        ...request,
        expiresAt: Timestamp.fromMillis(
          request.expiresAt,
        ),
      });
    },

    async consumeRequest(
      id,
      userId,
      browserHash,
      now,
    ) {
      return db.runTransaction(
        async (transaction) => {
          const ref = requests.doc(id);
          const snapshot =
            await transaction.get(ref);

          if (!snapshot.exists) {
            return null;
          }

          const data = snapshot.data();

          const expiresAt =
            data?.expiresAt instanceof Timestamp
              ? data.expiresAt.toMillis()
              : 0;

          if (
            data?.userId !== userId ||
            data.browserHash !== browserHash
          ) {
            return null;
          }

          // Valid and expired attempts are consumed once.
          transaction.delete(ref);

          if (
            expiresAt <= now ||
            typeof data.encryptedVerifier !==
              "string" ||
            typeof data.redirectUri !== "string"
          ) {
            return null;
          }

          return {
            userId,
            browserHash,
            encryptedVerifier:
              data.encryptedVerifier,
            redirectUri: data.redirectUri,
            expiresAt,
          } satisfies PendingMalAuthorization;
        },
      );
    },

    async saveConnection(
      userId,
      account,
      encryptedTokens,
      expiresAt,
    ) {
      await db.runTransaction(
        async (transaction) => {
          const user = await transaction.get(
            db.collection("users").doc(userId),
          );

          const existing =
            await transaction.get(
              connection(userId),
            );

          if (!user.exists) {
            throw new MalOAuthError(
              401,
              "Application account no longer exists. Sign in again.",
            );
          }

          // Safe metadata for the dashboard.
          transaction.set(connection(userId), {
            ...account,
            connected: true,
            connectedAt:
              existing.data()?.connectedAt ??
              FieldValue.serverTimestamp(),
            updatedAt:
              FieldValue.serverTimestamp(),
          });

          // Tokens are stored separately from profile data.
          transaction.set(
            credentials.doc(userId),
            {
              provider: "mal",
              providerUserId:
                account.providerUserId,
              encryptedTokens,
              expiresAt:
                Timestamp.fromMillis(expiresAt),
              updatedAt:
                FieldValue.serverTimestamp(),
            },
          );
        },
      );
    },

    async readCredentials(userId) {
      const data = (
        await credentials.doc(userId).get()
      ).data();

      if (
        typeof data?.encryptedTokens !==
          "string" ||
        typeof data.providerUserId !== "string"
      ) {
        return null;
      }

      return {
        encryptedTokens: data.encryptedTokens,
        providerUserId: data.providerUserId,
        ...(data.expiresAt instanceof Timestamp
          ? { expiresAt: data.expiresAt.toMillis() }
          : {}),
      };
    },

    async replaceCredentials(
      userId,
      previousCiphertext,
      encryptedTokens,
      expiresAt,
    ) {
      return db.runTransaction(
        async (transaction) => {
          const ref = credentials.doc(userId);
          const current =
            await transaction.get(ref);

          if (
            current.data()?.encryptedTokens !==
            previousCiphertext
          ) {
            return false;
          }

          transaction.update(ref, {
            encryptedTokens,
            expiresAt:
              Timestamp.fromMillis(expiresAt),
            updatedAt:
              FieldValue.serverTimestamp(),
          });

          return true;
        },
      );
    },
  };
}