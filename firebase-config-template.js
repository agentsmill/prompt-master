/**
 * Firebase Configuration for Mistrz Promptów
 *
 * This file provides a secure configuration for Firebase services.
 * Environment variables are used to keep sensitive information out of the codebase.
 *
 * For local development:
 * 1. Create a .env file with your Firebase configuration
 * 2. Use a tool like dotenv-webpack to inject these variables during build
 *
 * For production:
 * 1. Set environment variables in your CI/CD pipeline (GitHub Actions)
 * 2. These will be injected during the build process
 */

// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getAnalytics, isSupported } from "firebase/analytics";

/**
 * Firebase configuration object
 * Values are loaded from environment variables
 */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

/**
 * Initialize Firebase with environment-specific configuration
 */
const app = initializeApp(firebaseConfig);

/**
 * Initialize Firestore
 */
const db = getFirestore(app);

/**
 * Initialize Authentication
 */
const auth = getAuth(app);

/**
 * Initialize Cloud Functions
 */
const functions = getFunctions(app);

/**
 * Initialize Analytics if supported
 */
let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

/**
 * Connect to emulators in development environment
 */
if (process.env.NODE_ENV === "development") {
  // Check if we should connect to emulators
  const useEmulators = process.env.USE_FIREBASE_EMULATORS === "true";

  if (useEmulators) {
    // Connect to Auth emulator
    connectAuthEmulator(auth, "http://localhost:9099", {
      disableWarnings: true,
    });

    // Connect to Firestore emulator
    connectFirestoreEmulator(db, "localhost", 8080);

    // Connect to Functions emulator
    connectFunctionsEmulator(functions, "localhost", 5001);

    console.log("Connected to Firebase emulators");
  }
}

/**
 * Configure persistence for offline support
 */
const configurePersistence = async () => {
  try {
    const { enableIndexedDbPersistence } = await import("firebase/firestore");
    await enableIndexedDbPersistence(db);
    console.log("Firestore persistence enabled");
  } catch (error) {
    if (error.code === "failed-precondition") {
      console.warn("Firestore persistence failed: Multiple tabs open");
    } else if (error.code === "unimplemented") {
      console.warn("Firestore persistence not supported in this browser");
    } else {
      console.error("Firestore persistence error:", error);
    }
  }
};

// Enable persistence for offline support
configurePersistence();

/**
 * Export initialized Firebase services
 */
export { app, db, auth, functions, analytics };

/**
 * Export a function to get the current environment
 */
export const getEnvironment = () => {
  return process.env.NODE_ENV || "production";
};

/**
 * Export a function to check if analytics is available
 */
export const isAnalyticsAvailable = () => {
  return analytics !== null;
};

/**
 * Export a function to log events to analytics if available
 */
export const logEvent = (eventName, eventParams) => {
  if (analytics) {
    const { logEvent: firebaseLogEvent } = require("firebase/analytics");
    firebaseLogEvent(analytics, eventName, eventParams);
    return true;
  }
  return false;
};
