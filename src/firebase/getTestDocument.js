import { db } from "./firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { decrypt } from "../utils/crypto";

/**
 * Retrieves a document from the "test" collection in Firestore.
 * Validates input, handles errors, and decrypts sensitive fields if present.
 * @param {string} docId - The document ID to retrieve.
 * @param {string} [passphrase] - Optional passphrase for decryption.
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function getTestDocument(docId, passphrase) {
  // Input validation: docId must be a non-empty alphanumeric string
  if (typeof docId !== "string" || !/^[\w-]{1,64}$/.test(docId)) {
    return { data: null, error: "Invalid document ID." };
  }
  try {
    const docRef = doc(db, "test", docId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return { data: null, error: "Document not found." };
    }
    let data = docSnap.data();

    // Decrypt sensitive fields if present and passphrase provided
    if (passphrase && data && data.sensitiveField) {
      try {
        data.sensitiveField = await decrypt(data.sensitiveField, passphrase);
      } catch (e) {
        return { data: null, error: "Failed to decrypt sensitive data." };
      }
    }

    return { data, error: null };
  } catch (err) {
    // Provide user-friendly error message
    return {
      data: null,
      error: "Failed to retrieve document. Please try again later.",
    };
  }
}
