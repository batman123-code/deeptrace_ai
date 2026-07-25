import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, isFirebaseConfigured } from "@/lib/firebase";

/** Uploads submitted media and reports progress as a 0–100 percentage. */
export async function uploadVerificationMedia(
  file: File,
  userId: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!isFirebaseConfigured || !storage) {
    throw new Error(
      "Firebase Storage is not configured. Set NEXT_PUBLIC_FIREBASE_* in .env.local."
    );
  }

  // Keep the original extension so Storage serves a usable content type, but
  // drop the rest of the client-supplied name — it is untrusted input.
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "";
  const objectName = `${Date.now()}-${crypto.randomUUID()}${extension ? `.${extension}` : ""}`;
  const objectRef = ref(storage, `uploads/${userId}/${objectName}`);

  const task = uploadBytesResumable(objectRef, file, { contentType: file.type });

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot: any) => {
        if (!onProgress) return;
        const percent = snapshot.totalBytes
          ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          : 0;
        onProgress(percent);
      },
      reject,
      () => {
        getDownloadURL(task.snapshot.ref).then(resolve).catch(reject);
      }
    );
  });
}
