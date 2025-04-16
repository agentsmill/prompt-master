/**
 * UI Interaction Handler
 * Initializes the GameEngine and connects UI elements (prompt input) to it.
 */
import { GameEngine } from "./GameEngine.js";

// Wait for the DOM to be fully loaded before initializing
window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing UI and Game Engine...");

  // --- Get UI Element References ---
  const promptInput = document.getElementById("prompt-input");
  const submitButton = document.getElementById("submit-prompt");
  const canvasElement = document.getElementById("game-canvas"); // Needed for engine

  // --- Basic Validation ---
  if (!promptInput || !submitButton || !canvasElement) {
    console.error(
      "UI Error: Required elements (prompt-input, submit-prompt, or game-canvas) not found in the DOM."
    );
    // Display an error message to the user?
    const errorContainer =
      document.getElementById("game-container") || document.body;
    const errorMsg = document.createElement("p");
    errorMsg.textContent =
      "Error: UI components failed to load. Please refresh.";
    errorMsg.style.color = "red";
    errorMsg.style.marginTop = "10px";
    errorContainer.appendChild(errorMsg);
    return; // Stop initialization
  }

  // --- Initialize Game Engine ---
  console.log("Instantiating GameEngine...");
  const engine = new GameEngine("game-canvas"); // Pass canvas ID
  if (engine && engine.ctx) {
    // Check if engine initialized correctly (found canvas)
    console.log("GameEngine started.");
    engine.start();
  } else {
    console.error(
      "Failed to initialize GameEngine properly. Check console for details."
    );
    // Potentially display another error message in the UI
    return;
  }

  // --- Event Listener for Prompt Submission ---
  submitButton.addEventListener("click", () => {
    const promptText = promptInput.value.trim(); // Get and trim the input

    if (promptText) {
      console.log(`UI: Submit button clicked. Prompt: "${promptText}"`);
      // Pass the prompt to the engine
      engine.handlePrompt(promptText);

      // Clear the input field after submission
      promptInput.value = "";
    } else {
      console.log("UI: Submit button clicked, but prompt input is empty.");
      // Optionally provide feedback to the user (e.g., shake the input box?)
    }
  });

  // Optional: Add listener for 'Enter' key in textarea (Shift+Enter for newline)
  promptInput.addEventListener("keydown", (event) => {
    // Check if Enter is pressed without the Shift key
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent default newline insertion
      submitButton.click(); // Trigger the button click handler
    }
  });

  console.log("UI initialization complete. Event listeners attached.");
});
