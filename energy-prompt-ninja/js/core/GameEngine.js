/**
 * Energy Prompt Ninja - Modular Game Engine Core
 * Follows modular architecture per EnergyPromptNinja_Specification.md
 */
import { EnergyConversionModule } from "../modules/EnergyConversionModule.js";

export class GameEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error(
        `GameEngine: Canvas element with ID '${canvasId}' not found.`
      );
      return; // Prevent further initialization if canvas is missing
    }
    this.ctx = this.canvas.getContext("2d");
    this.lastTimestamp = 0;
    this.running = false;
    this.statusMessage = "Initializing..."; // Initial status

    // Core systems (placeholders for future expansion)
    this.modules = {};
    this.activeModule = null;
    this.playerProgress = {}; // To be expanded

    // Initialize modules
    this.initModules();
  }

  initModules() {
    // Initialize and register all game modules here
    this.modules["EnergyConversion"] = new EnergyConversionModule(this);
    // Add other modules here later (e.g., ScenarioValidator, UnitConverterUI)
    this.activeModule = this.modules["EnergyConversion"];
    this.statusMessage = this.activeModule?.statusMessage || "Ready."; // Get initial status from module if available
  }

  start() {
    if (!this.ctx) {
      console.error("GameEngine: Cannot start without a valid canvas context.");
      return;
    }
    this.running = true;
    this.lastTimestamp = performance.now(); // Use performance.now for higher precision
    window.requestAnimationFrame(this.loop.bind(this));
  }

  loop(timestamp) {
    if (!this.running) return; // Stop loop if not running

    const delta = (timestamp - this.lastTimestamp) / 1000; // Delta time in seconds
    this.lastTimestamp = timestamp;

    this.update(delta);
    this.render();

    window.requestAnimationFrame(this.loop.bind(this));
  }

  update(delta) {
    // Update the active game module
    if (this.activeModule && typeof this.activeModule.update === "function") {
      this.activeModule.update(delta);
    }
    // Update engine-level status if needed (e.g., based on module state)
    if (this.activeModule && this.activeModule.statusMessage) {
      this.statusMessage = this.activeModule.statusMessage;
    }
  }

  render() {
    if (!this.ctx) return; // Guard against missing context

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render active module
    if (this.activeModule && typeof this.activeModule.render === "function") {
      this.activeModule.render(this.ctx);
    } else {
      // Fallback rendering if no active module or render method
      this.ctx.save();
      this.ctx.font = '16px "Press Start 2P", monospace';
      this.ctx.fillStyle = "#ff6b6b"; // Error color
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        "No active module to render.",
        this.canvas.width / 2,
        this.canvas.height / 2
      );
      this.ctx.restore();
    }

    // Optionally render engine-level status (e.g., FPS, global messages)
    // For now, module handles its own status rendering within its render method
  }

  /**
   * Handles prompt text submitted by the user via the UI.
   * @param {string} promptText - The text entered by the user.
   */
  handlePrompt(promptText) {
    console.log("GameEngine received prompt:", promptText);
    this.statusMessage = `Processing prompt: "${promptText.substring(
      0,
      30
    )}..."`;

    // TODO: Pass the prompt to the active module for processing
    if (
      this.activeModule &&
      typeof this.activeModule.processPrompt === "function"
    ) {
      this.activeModule.processPrompt(promptText);
    } else {
      console.warn("GameEngine: Active module cannot process prompts.");
      this.statusMessage = "Error: Cannot process prompt.";
    }
  }

  stop() {
    this.running = false;
    console.log("GameEngine stopped.");
  }
}

// Removed the old DOMContentLoaded bootstrap logic.
// Initialization is now handled by ui.js
