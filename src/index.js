import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";

// Register service worker for offline capabilities
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Get the base URL from the current path to handle GitHub Pages correctly
    const baseUrl = window.location.pathname.includes("/mistrz-promptow")
      ? "/mistrz-promptow"
      : "";

    navigator.serviceWorker
      .register(`${baseUrl}/service-worker.js`)
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope
        );
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
