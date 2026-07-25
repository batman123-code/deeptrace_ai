import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit as limitTo,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import type { NewAuditReport, SavedAudit, UserProfile } from "@/lib/types/firebase";

const USERS = "users";
const AUDITS = "audits";

/** Narrows the nullable `db` export, so every call site fails loudly and identically. */
function requireDb() {
  if (!isFirebaseConfigured || !db) {
    throw new Error(
      "Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* in .env.local (see .env.local.example)."
    );
  }
  return db;
}

/** Firestore returns Timestamps; the app works in Dates. */
function toDate(value: any): Date | string {
  if (value && typeof value === "object" && typeof value.toDate === "function") {
    return value.toDate();
  }
  if (value instanceof Date) return value;
  if (typeof value === "string") return value;
  return new Date();
}

/**
 * Creates or updates a user's profile document. Uses merge so repeat calls
 * refresh `lastActive` without clobbering `createdAt` or fields set elsewhere.
 */
export async function saveUserProfile(user: UserProfile): Promise<void> {
  const firestore = requireDb();
  const ref = doc(firestore, USERS, user.uid);

  await setDoc(
    ref,
    {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName ?? "",
      createdAt: user.createdAt ?? serverTimestamp(),
      lastActive: serverTimestamp(),
    },
    { merge: true }
  );
}

/** Returns the stored profile, or null when the user has no document yet. */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const firestore = requireDb();
  const snapshot = await getDoc(doc(firestore, USERS, uid));

  if (!snapshot.exists()) return null;

  const data = snapshot.data() as DocumentData;
  return {
    uid: snapshot.id,
    email: data.email ?? "",
    displayName: data.displayName ?? undefined,
    createdAt: toDate(data.createdAt),
    lastActive: toDate(data.lastActive),
  };
}

/**
 * Writes a completed audit to the top-level `audits` collection, stamped with
 * the server's clock rather than the client's. Returns the new document ID.
 */
export async function saveAuditReport(
  userId: string,
  audit: NewAuditReport
): Promise<string> {
  const firestore = requireDb();

  const payload = {
    userId,
    claimText: audit.claimText,
    mediaUrl: audit.mediaUrl ?? null,
    verdict: audit.verdict,
    confidenceScore: audit.confidenceScore,
    summary: audit.summary,
    citations: audit.citations ?? [],
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(firestore, AUDITS), payload);
  return ref.id;
}

/**
 * Returns a user's past audits, newest first.
 *
 * Requires a composite index on (userId ASC, createdAt DESC) — Firestore logs
 * a link to create it the first time this query runs.
 */
export async function getUserAuditHistory(
  userId: string,
  max = 50
): Promise<SavedAudit[]> {
  const firestore = requireDb();

  const q = query(
    collection(firestore, AUDITS),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limitTo(max)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((entry: any) => {
    const data = entry.data() as DocumentData;
    return {
      id: entry.id,
      userId: data.userId,
      claimText: data.claimText ?? "",
      mediaUrl: data.mediaUrl ?? undefined,
      verdict: data.verdict,
      confidenceScore: data.confidenceScore ?? 0,
      summary: data.summary ?? "",
      citations: data.citations ?? [],
      createdAt: toDate(data.createdAt),
    };
  });
}
