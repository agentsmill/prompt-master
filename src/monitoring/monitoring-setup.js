/**
 * Mistrz Promptów - Comprehensive Monitoring Setup
 *
 * This file sets up various monitoring tools to track application performance,
 * user behavior, errors, and security issues.
 */

// Performance Monitoring
export const setupPerformanceMonitoring = () => {
  // Web Vitals for core performance metrics
  if (typeof window !== "undefined") {
    import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(sendToAnalytics);
      getFID(sendToAnalytics);
      getFCP(sendToAnalytics);
      getLCP(sendToAnalytics);
      getTTFB(sendToAnalytics);
    });
  }

  // Custom performance measurements
  if (typeof window !== "undefined" && window.performance) {
    // Track page load time
    window.addEventListener("load", () => {
      const pageLoadTime = performance.now();
      sendToAnalytics({ name: "page-load", value: pageLoadTime });
    });

    // Track time to interactive
    const trackTimeToInteractive = () => {
      const tti = performance.now();
      sendToAnalytics({ name: "time-to-interactive", value: tti });
      document.removeEventListener("click", trackTimeToInteractive);
    };
    document.addEventListener("click", trackTimeToInteractive);
  }
};

// Error Monitoring
export const setupErrorMonitoring = () => {
  if (typeof window !== "undefined") {
    // Global error handler
    window.addEventListener("error", (event) => {
      logError({
        type: "uncaught-error",
        message: event.message,
        stack: event.error ? event.error.stack : "",
        url: window.location.href,
      });
    });

    // Promise rejection handler
    window.addEventListener("unhandledrejection", (event) => {
      logError({
        type: "unhandled-promise-rejection",
        message: event.reason.message || "Promise rejected",
        stack: event.reason.stack || "",
        url: window.location.href,
      });
    });

    // API error tracking
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          logError({
            type: "api-error",
            status: response.status,
            url: args[0],
            method: args[1]?.method || "GET",
          });
        }
        return response;
      } catch (error) {
        logError({
          type: "fetch-error",
          message: error.message,
          url: args[0],
        });
        throw error;
      }
    };
  }
};

// User Behavior Tracking
export const setupUserBehaviorTracking = () => {
  if (typeof window !== "undefined") {
    // Page views
    trackPageView(window.location.pathname);

    // Navigation tracking
    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      trackPageView(window.location.pathname);
    };

    window.addEventListener("popstate", () => {
      trackPageView(window.location.pathname);
    });

    // Click tracking for important elements
    document.addEventListener("click", (event) => {
      const target = event.target.closest("button, a, .clickable");
      if (target) {
        const elementId = target.id || "";
        const elementClass = target.className || "";
        const elementText = target.innerText || "";
        const elementType = target.tagName.toLowerCase();

        trackEvent("click", {
          elementId,
          elementClass,
          elementText: elementText.substring(0, 50), // Truncate long text
          elementType,
          path: window.location.pathname,
        });
      }
    });

    // Form submission tracking
    document.addEventListener("submit", (event) => {
      const form = event.target;
      trackEvent("form_submit", {
        formId: form.id || "",
        formAction: form.action || "",
        path: window.location.pathname,
      });
    });

    // Session tracking
    trackSessionStart();
    window.addEventListener("beforeunload", trackSessionEnd);
  }
};

// User Feedback Collection
export const setupFeedbackCollection = () => {
  // This function would integrate with a feedback collection tool
  // or set up custom feedback collection mechanisms

  // Example: Set up a feedback button that opens a modal
  if (typeof window !== "undefined") {
    const createFeedbackButton = () => {
      const button = document.createElement("button");
      button.innerText = "Feedback";
      button.className = "feedback-button";
      button.style.position = "fixed";
      button.style.bottom = "20px";
      button.style.right = "20px";
      button.style.zIndex = "9999";
      button.style.padding = "10px 15px";
      button.style.backgroundColor = "#3498db";
      button.style.color = "white";
      button.style.border = "none";
      button.style.borderRadius = "5px";
      button.style.cursor = "pointer";

      button.addEventListener("click", openFeedbackModal);

      document.body.appendChild(button);
    };

    // Add the button when the DOM is loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", createFeedbackButton);
    } else {
      createFeedbackButton();
    }
  }
};

// Security Monitoring
export const setupSecurityMonitoring = () => {
  if (typeof window !== "undefined") {
    // Monitor for XSS attempts
    const detectXssAttempt = (value) => {
      const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+=/gi,
        /data:text\/html/gi,
      ];

      return xssPatterns.some((pattern) => pattern.test(value));
    };

    // Check URL parameters for XSS attempts
    const checkUrlForXss = () => {
      const url = window.location.href;
      const params = new URLSearchParams(window.location.search);

      params.forEach((value) => {
        if (detectXssAttempt(value)) {
          logSecurityEvent({
            type: "xss-attempt",
            value,
            url,
          });
        }
      });
    };

    // Check on page load and URL changes
    checkUrlForXss();
    window.addEventListener("popstate", checkUrlForXss);

    // Monitor for suspicious form inputs
    document.addEventListener("submit", (event) => {
      const form = event.target;
      const formInputs = form.querySelectorAll("input, textarea");

      formInputs.forEach((input) => {
        if (detectXssAttempt(input.value)) {
          logSecurityEvent({
            type: "suspicious-input",
            element: input.name || input.id || "unnamed-input",
            form: form.id || form.action || "unnamed-form",
          });
        }
      });
    });

    // Check for CSRF token on sensitive requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0];
      const options = args[1] || {};

      // Check if this is a sensitive request (POST, PUT, DELETE)
      if (
        options.method &&
        ["POST", "PUT", "DELETE"].includes(options.method.toUpperCase())
      ) {
        // Check if CSRF token is included
        const hasCSRFToken =
          options.headers &&
          (options.headers["X-CSRF-Token"] || options.headers["csrf-token"]);

        if (!hasCSRFToken) {
          logSecurityEvent({
            type: "missing-csrf-token",
            url,
            method: options.method,
          });
        }
      }

      return originalFetch(...args);
    };
  }
};

// Helper functions for sending data to analytics services
const sendToAnalytics = (metric) => {
  // In a real implementation, this would send data to your analytics service
  // Example: Google Analytics, Mixpanel, custom backend, etc.
  console.log("Analytics:", metric);

  // Send to backend API
  if (process.env.NODE_ENV === "production") {
    fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metric),
    }).catch((err) => console.error("Failed to send analytics:", err));
  }
};

const logError = (error) => {
  // In a real implementation, this would send errors to your error tracking service
  // Example: Sentry, LogRocket, custom backend, etc.
  console.error("Error logged:", error);

  // Send to backend API
  if (process.env.NODE_ENV === "production") {
    fetch("/api/errors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...error,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      }),
    }).catch((err) => console.error("Failed to log error:", err));
  }
};

const trackPageView = (path) => {
  sendToAnalytics({
    type: "pageview",
    path,
    timestamp: new Date().toISOString(),
  });
};

const trackEvent = (eventName, eventData) => {
  sendToAnalytics({
    type: "event",
    name: eventName,
    data: eventData,
    timestamp: new Date().toISOString(),
  });
};

const trackSessionStart = () => {
  const sessionId = generateSessionId();
  localStorage.setItem("session_id", sessionId);
  localStorage.setItem("session_start", new Date().toISOString());

  sendToAnalytics({
    type: "session_start",
    sessionId,
    timestamp: new Date().toISOString(),
  });
};

const trackSessionEnd = () => {
  const sessionId = localStorage.getItem("session_id");
  const sessionStart = localStorage.getItem("session_start");

  if (sessionId && sessionStart) {
    const sessionDuration = new Date() - new Date(sessionStart);

    sendToAnalytics({
      type: "session_end",
      sessionId,
      duration: sessionDuration,
      timestamp: new Date().toISOString(),
    });
  }
};

const generateSessionId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const openFeedbackModal = () => {
  // Create modal container
  const modal = document.createElement("div");
  modal.className = "feedback-modal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "10000";

  // Create modal content
  const content = document.createElement("div");
  content.className = "feedback-modal-content";
  content.style.backgroundColor = "white";
  content.style.padding = "20px";
  content.style.borderRadius = "5px";
  content.style.maxWidth = "500px";
  content.style.width = "90%";

  // Create close button
  const closeButton = document.createElement("button");
  closeButton.innerText = "X";
  closeButton.style.float = "right";
  closeButton.style.border = "none";
  closeButton.style.background = "none";
  closeButton.style.fontSize = "20px";
  closeButton.style.cursor = "pointer";
  closeButton.addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  // Create form
  const form = document.createElement("form");
  form.innerHTML = `
    <h2 style="color: #333; margin-top: 0;">Twoja opinia</h2>
    <p style="color: #666;">Pomóż nam ulepszyć aplikację Mistrz Promptów!</p>
    
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px; color: #333;">Jak oceniasz aplikację?</label>
      <div style="display: flex; justify-content: space-between;">
        <label style="display: flex; align-items: center;">
          <input type="radio" name="rating" value="1" style="margin-right: 5px;">
          1 (Słabo)
        </label>
        <label style="display: flex; align-items: center;">
          <input type="radio" name="rating" value="2" style="margin-right: 5px;">
          2
        </label>
        <label style="display: flex; align-items: center;">
          <input type="radio" name="rating" value="3" style="margin-right: 5px;">
          3
        </label>
        <label style="display: flex; align-items: center;">
          <input type="radio" name="rating" value="4" style="margin-right: 5px;">
          4
        </label>
        <label style="display: flex; align-items: center;">
          <input type="radio" name="rating" value="5" style="margin-right: 5px;">
          5 (Świetnie)
        </label>
      </div>
    </div>
    
    <div style="margin-bottom: 15px;">
      <label for="feedback-text" style="display: block; margin-bottom: 5px; color: #333;">Twoje uwagi:</label>
      <textarea id="feedback-text" name="feedback" rows="4" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
    </div>
    
    <div style="margin-bottom: 15px;">
      <label for="feedback-email" style="display: block; margin-bottom: 5px; color: #333;">Email (opcjonalnie):</label>
      <input type="email" id="feedback-email" name="email" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
    </div>
    
    <button type="submit" style="background-color: #3498db; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer;">Wyślij opinię</button>
  `;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const feedbackData = {
      rating: formData.get("rating"),
      feedback: formData.get("feedback"),
      email: formData.get("email"),
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    // Send feedback to backend
    fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedbackData),
    })
      .then((response) => {
        if (response.ok) {
          // Show success message
          content.innerHTML = `
          <h2 style="color: #333; margin-top: 0;">Dziękujemy!</h2>
          <p style="color: #666;">Twoja opinia jest dla nas bardzo cenna.</p>
          <button id="close-feedback" style="background-color: #3498db; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer;">Zamknij</button>
        `;

          document
            .getElementById("close-feedback")
            .addEventListener("click", () => {
              document.body.removeChild(modal);
            });
        } else {
          throw new Error("Failed to submit feedback");
        }
      })
      .catch((error) => {
        // Show error message
        content.innerHTML = `
        <h2 style="color: #333; margin-top: 0;">Wystąpił błąd</h2>
        <p style="color: #666;">Nie udało się wysłać opinii. Spróbuj ponownie później.</p>
        <button id="close-feedback" style="background-color: #3498db; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer;">Zamknij</button>
      `;

        document
          .getElementById("close-feedback")
          .addEventListener("click", () => {
            document.body.removeChild(modal);
          });

        console.error("Feedback submission error:", error);
      });
  });

  // Assemble modal
  content.appendChild(closeButton);
  content.appendChild(form);
  modal.appendChild(content);

  // Add to DOM
  document.body.appendChild(modal);
};

const logSecurityEvent = (event) => {
  // In a real implementation, this would send security events to your security monitoring service
  console.warn("Security event:", event);

  // Send to backend API
  if (process.env.NODE_ENV === "production") {
    fetch("/api/security", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...event,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ip: "{{server_will_add_ip}}", // The server will add the actual IP
      }),
    }).catch((err) => console.error("Failed to log security event:", err));
  }
};

// Initialize all monitoring systems
export const initializeMonitoring = () => {
  setupPerformanceMonitoring();
  setupErrorMonitoring();
  setupUserBehaviorTracking();
  setupFeedbackCollection();
  setupSecurityMonitoring();

  console.log("Monitoring systems initialized");
};

export default initializeMonitoring;
