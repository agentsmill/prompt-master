/**
 * Utility functions for encrypting and decrypting sensitive data using Web Crypto API.
 * NOTE: In production, use a secure key management strategy and never hardcode secrets.
 */

const ENCRYPTION_KEY_NAME = "mistrz-promptow-key";

/**
 * Derives a crypto key from a passphrase.
 * @param {string} passphrase
 * @returns {Promise<CryptoKey>}
 */
async function getKey(passphrase) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(ENCRYPTION_KEY_NAME),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a string.
 * @param {string} plaintext
 * @param {string} passphrase
 * @returns {Promise<string>} Base64-encoded ciphertext
 */
export async function encrypt(plaintext, passphrase) {
  const key = await getKey(passphrase);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );
  // Combine IV and ciphertext for storage
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts a string.
 * @param {string} ciphertextBase64
 * @param {string} passphrase
 * @returns {Promise<string>}
 */
export async function decrypt(ciphertextBase64, passphrase) {
  const combined = Uint8Array.from(atob(ciphertextBase64), (c) =>
    c.charCodeAt(0)
  );
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const key = await getKey(passphrase);
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
}
