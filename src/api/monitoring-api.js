/**
 * Mistrz Promptów - Monitoring API Endpoints
 *
 * This file contains the API endpoints for handling monitoring data:
 * - Analytics data
 * - Error logs
 * - User feedback
 * - Security events
 */

// Import Firebase services
import { db } from "../firebase/firebase-config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Handles analytics data sent from the client
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleAnalyticsData = async (req, res) => {
  try {
    const analyticsData = req.body;

    // Add server timestamp and client IP
    const enrichedData = {
      ...analyticsData,
      serverTimestamp: serverTimestamp(),
      clientIp: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    };

    // Store in Firestore
    await addDoc(collection(db, "analytics"), enrichedData);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error saving analytics data:", error);
    res.status(500).json({ error: "Failed to save analytics data" });
  }
};

/**
 * Handles error logs sent from the client
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleErrorLogs = async (req, res) => {
  try {
    const errorData = req.body;

    // Add server timestamp and client IP
    const enrichedData = {
      ...errorData,
      serverTimestamp: serverTimestamp(),
      clientIp: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    };

    // Store in Firestore
    await addDoc(collection(db, "errors"), enrichedData);

    // For critical errors, you might want to send notifications
    if (errorData.type === "uncaught-error" || errorData.type === "api-error") {
      // sendErrorNotification(enrichedData); // Implement this function if needed
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error saving error log:", error);
    res.status(500).json({ error: "Failed to save error log" });
  }
};

/**
 * Handles user feedback submissions
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleFeedback = async (req, res) => {
  try {
    const feedbackData = req.body;

    // Validate feedback data
    if (!feedbackData.feedback || !feedbackData.rating) {
      return res
        .status(400)
        .json({ error: "Missing required feedback fields" });
    }

    // Add server timestamp and client IP
    const enrichedData = {
      ...feedbackData,
      serverTimestamp: serverTimestamp(),
      clientIp: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    };

    // Store in Firestore
    await addDoc(collection(db, "feedback"), enrichedData);

    // For low ratings (1-2), you might want to flag for review
    if (parseInt(feedbackData.rating) <= 2) {
      // flagFeedbackForReview(enrichedData); // Implement this function if needed
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ error: "Failed to save feedback" });
  }
};

/**
 * Handles security events sent from the client
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleSecurityEvent = async (req, res) => {
  try {
    const securityData = req.body;

    // Add server timestamp and client IP
    const enrichedData = {
      ...securityData,
      serverTimestamp: serverTimestamp(),
      clientIp: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    };

    // Store in Firestore
    await addDoc(collection(db, "security_events"), enrichedData);

    // For serious security events, send immediate notifications
    if (
      securityData.type === "xss-attempt" ||
      securityData.type === "suspicious-input"
    ) {
      // sendSecurityAlert(enrichedData); // Implement this function if needed
    }

    // Return success but don't provide details to potential attackers
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error logging security event:", error);
    // Still return 200 to not give information to potential attackers
    res.status(200).json({ success: true });
  }
};

/**
 * Registers all monitoring API routes with the Express app
 *
 * @param {Object} app - Express application instance
 */
export const registerMonitoringRoutes = (app) => {
  app.post("/api/analytics", handleAnalyticsData);
  app.post("/api/errors", handleErrorLogs);
  app.post("/api/feedback", handleFeedback);
  app.post("/api/security", handleSecurityEvent);

  console.log("Monitoring API routes registered");
};

export default registerMonitoringRoutes;
