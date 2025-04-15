/**
 * Energy Prompt Ninja - Modular Game Engine Core
 * Follows modular architecture per EnergyPromptNinja_Specification.md
 */
import { EnergyConversionModule } from "../modules/EnergyConversionModule.js";

export class GameEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.lastTimestamp = 0;
    this.running = false;

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
    this.activeModule = this.modules["EnergyConversion"];
  }

  start() {
    this.running = true;
    window.requestAnimationFrame(this.loop.bind(this));
  }

  loop(timestamp) {
    const delta = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    this.update(delta);
    this.render();

    if (this.running) {
      window.requestAnimationFrame(this.loop.bind(this));
    }
  }

  update(delta) {
    if (this.activeModule && typeof this.activeModule.update === "function") {
      this.activeModule.update(delta);
    }
  }

  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render active module
    if (this.activeModule && typeof this.activeModule.render === "function") {
      this.activeModule.render(this.ctx);
    }
  }
}

// Bootstrap the game when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  const engine = new GameEngine("game-canvas");
  engine.start();
});
