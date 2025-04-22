/**
 * Energy Prompt Ninja - Modular Game Engine Core
 * Follows modular architecture per EnergyPromptNinja_Specification.md
 */
import { EnergyConversionModule } from "../modules/EnergyConversionModule.js";
// TODO: Import other modules when created
import { RolePromptingModule } from "../modules/RolePromptingModule.js";
import { SystemPromptingModule } from "../modules/SystemPromptingModule.js";
import { ContextualPromptingModule } from "../modules/ContextualPromptingModule.js";
import { StepBackPromptingModule } from "../modules/StepBackPromptingModule.js";
import { CoTPromptingModule } from "../modules/CoTPromptingModule.js";
import { SelfConsistencyPromptingModule } from "../modules/SelfConsistencyPromptingModule.js";
import { ToTPromptingModule } from "../modules/ToTPromptingModule.js";
import { APEModule } from "../modules/APEModule.js"; // Assuming filename is APEModule.js
import { CodePromptingModule } from "../modules/CodePromptingModule.js";
import { LLMService } from '../services/LLMService.js'; // Import LLMService

export class GameEngine {
  constructor(canvasId, onGameOver) {
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
    this.score = 0; // Initialize score
    this.onGameOver = onGameOver; // Store the callback
    this.playerLevel = 1; // Start at level 1
    this.completedModules = new Set(); // Track completed module names
    this.playerEnergy = 0;
    this.totalEnergyEarned = 0;
    this.completedScenarios = new Set(); // Keep track of completed scenario IDs
    this.apiKey = null; // Store API Key - **Handle Securely!**
    this.llmService = new LLMService(); // Instantiate the LLM Service

    // Core systems (placeholders for future expansion)
    this.modules = {};
    this.activeModule = null;
    this.playerProgress = {}; // To be expanded

    // Initialize modules
    this.initModules();
  }

  initModules() {
    console.log(`Initializing modules for player level: ${this.playerLevel}`);
    // Initialize all potentially available modules
    this.modules = {}; 
    this.modules["EnergyConversion"] = new EnergyConversionModule(this); // Covers Level 1 & 2 
    this.modules["RolePrompting"] = new RolePromptingModule(this); // Level 3
    this.modules["SystemPrompting"] = new SystemPromptingModule(this); // Level 4
    this.modules["ContextualPrompting"] = new ContextualPromptingModule(this); // Level 5
    this.modules["StepBackPrompting"] = new StepBackPromptingModule(this); // Level 6
    this.modules["CoTPrompting"] = new CoTPromptingModule(this); // Level 7
    this.modules["SelfConsistencyPrompting"] = new SelfConsistencyPromptingModule(this); // Level 8
    this.modules["ToTPrompting"] = new ToTPromptingModule(this); // Level 9
    this.modules["APE"] = new APEModule(this); // Level 10
    this.modules["CodePrompting"] = new CodePromptingModule(this); // Level 11

    // Set the active module based on player level or progression
    this.activeModule = null; // Reset before selecting
    let targetModuleName = null;
    let statusIfNotImplemented = "Module Not Implemented Yet";

    switch (this.playerLevel) {
        case 1:
             if (!this.completedModules.has("EnergyConversionModule")) targetModuleName = "EnergyConversion";
             statusIfNotImplemented = "Energy Conversion Module (Level 1)";
             break;
        case 2:
             // Level 2 uses Few-Shot, handled by EnergyConversionModule for now
             if (!this.completedModules.has("FewShotModule")) targetModuleName = "EnergyConversion"; 
             statusIfNotImplemented = "Few-Shot Prompting Module (Level 2)";
             break;
        case 3:
            if (!this.completedModules.has("RolePromptingModule")) targetModuleName = "RolePrompting";
            statusIfNotImplemented = "Role Prompting Module (Level 3)";
            break;
        case 4:
             if (!this.completedModules.has("SystemPromptingModule")) targetModuleName = "SystemPrompting";
             statusIfNotImplemented = "System Prompting Module (Level 4)";
            break;
        case 5:
             if (!this.completedModules.has("ContextualPromptingModule")) targetModuleName = "ContextualPrompting";
             statusIfNotImplemented = "Contextual Prompting Module (Level 5)";
            break;
        case 6:
             if (!this.completedModules.has("StepBackPromptingModule")) targetModuleName = "StepBackPrompting";
              statusIfNotImplemented = "Step-Back Prompting Module (Level 6)";
            break;
        case 7:
             if (!this.completedModules.has("CoTPromptingModule")) targetModuleName = "CoTPrompting";
             statusIfNotImplemented = "Chain of Thought Module (Level 7)";
            break;
        case 8:
            if (!this.completedModules.has("SelfConsistencyPromptingModule")) targetModuleName = "SelfConsistencyPrompting";
             statusIfNotImplemented = "Self-Consistency Module (Level 8)";
            break;
        case 9:
            if (!this.completedModules.has("ToTPromptingModule")) targetModuleName = "ToTPrompting";
            statusIfNotImplemented = "Tree of Thoughts Module (Level 9)";
            break;
        case 10:
            if (!this.completedModules.has("APEModule")) targetModuleName = "APE";
            statusIfNotImplemented = "APE Module (Level 10)";
            break;
        case 11:
             if (!this.completedModules.has("CodePromptingModule")) targetModuleName = "CodePrompting";
             statusIfNotImplemented = "Code Prompting Module (Level 11)";
             break;
        default:
            console.log(`Player level ${this.playerLevel} not recognized or all modules completed.`);
            // Check if *all* implemented modules are done
            if (this.allModulesCompleted()) {
                 this.statusMessage = "Congratulations! All current challenges completed!";
             } else {
                 this.statusMessage = `Error: Level ${this.playerLevel} has no module defined.`;
             }
             targetModuleName = null; // Ensure no module is selected
            break;
    }

    if (targetModuleName && this.modules[targetModuleName]) {
        this.activeModule = this.modules[targetModuleName];
        // Special handling for level 2 still within EnergyConversion module
        if (this.playerLevel === 2 && this.activeModule instanceof EnergyConversionModule) {
             if (this.activeModule) this.activeModule.init(); // Re-init EnergyConversion for level 2 scenarios
        }
    } else if (targetModuleName) {
        // Module should be active but isn't implemented/instantiated yet
        console.log(`Attempting to activate ${targetModuleName} module (Level ${this.playerLevel}).`);
        this.statusMessage = statusIfNotImplemented; 
        this.activeModule = null; // Ensure no module is active
    } else {
        // Fallback or all modules completed
        console.log("No specific module found for current level/state, falling back or ending.");
        if (this.allModulesCompleted()) { // Check if all defined modules are done
             console.log("All implemented modules completed.");
             this.statusMessage = "Congratulations! All current challenges completed!";
             // this.gameOver(); // Optionally end game here
         } else {
            // Fallback to first module if something went wrong
            this.activeModule = this.modules["EnergyConversion"];
         }
    }

    if (this.activeModule) {
        this.statusMessage = this.activeModule?.statusMessage || "Ready.";
        console.log(`Active module set to: ${this.activeModule.constructor.name}`);
        // Ensure the newly activated module is also reset if needed
        if (typeof this.activeModule.reset === "function") {
            this.activeModule.reset();
        }
    } else {
        this.statusMessage = "Error: No active module found!";
        console.error("Could not set an active module.");
    }
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

    if (this.running) { // Only request next frame if still running
        window.requestAnimationFrame(this.loop.bind(this));
    }
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

    // Render Score and Timer
    this.ctx.save();
    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillStyle = "var(--text-white)";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`Score: ${this.score}`, 10, 20);
    this.ctx.restore();

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

  // Method to add points to the score
  addScore(points) {
    this.score += points;
    console.log(`Score updated: ${this.score}`);
    // Potentially update a score display element if needed immediately
  }

  // Reset game state for a new game
  reset() {
    console.log("Resetting GameEngine state...");
    this.score = 0;
    this.statusMessage = "Ready.";
    this.running = false; // Ensure it's stopped before restarting
    // TODO: Reset active module state as well
    if (this.activeModule && typeof this.activeModule.reset === "function") {
      this.activeModule.reset();
    } else {
      // If no reset, re-initialize modules (simpler approach)
      this.initModules();
    }
    console.log("GameEngine reset complete.");
  }

  // Handle game over logic
  gameOver() {
    console.log("Game Over!");
    this.stop(); // Stop the game loop
    // Call the callback provided by ui.js
    if (typeof this.onGameOver === "function") {
      this.onGameOver(this.score);
    }
  }

  /**
   * Called by modules when they are completed.
   * Handles level progression and switching active modules.
   * @param {string} moduleName - The name (or class name) of the completed module.
   */
  moduleCompleted(moduleName) {
    console.log(`Module reported as completed: ${moduleName}`);
    this.completedModules.add(moduleName);

    // --- Level Progression Logic --- 
    // Level up after completing the first module (Zero-Shot)
    if (moduleName === "EnergyConversionModule" && this.playerLevel === 1) {
        this.playerLevel = 2;
        console.log(`Player leveled up to Level ${this.playerLevel}! Now focusing on Few-Shot.`);
    // Level up after completing the second module (Few-Shot)
    } else if (moduleName === "FewShotModule" && this.playerLevel === 2) {
        this.playerLevel = 3;
        console.log(`Player leveled up to Level ${this.playerLevel}! Now focusing on Role Prompting.`);
    } else if (moduleName === "RolePromptingModule" && this.playerLevel === 3) {
        this.playerLevel = 4;
        console.log(`Player leveled up to Level ${this.playerLevel}! Now focusing on System Prompting.`);
    } else if (moduleName === "SystemPromptingModule" && this.playerLevel === 4) {
        this.playerLevel = 5;
        console.log(`Player leveled up to Level ${this.playerLevel}! Now focusing on Contextual Prompting.`);
    } else if (moduleName === "ContextualPromptingModule" && this.playerLevel === 5) {
        this.playerLevel = 6;
        console.log(`Player leveled up to Level ${this.playerLevel}! Now focusing on Step-Back Prompting.`);
    } else if (moduleName === "StepBackPromptingModule" && this.playerLevel === 6) {
        this.playerLevel = 7;
        console.log(`Player leveled up to Level ${this.playerLevel}! Now focusing on Chain of Thought.`);
    } else if (moduleName === "CoTPromptingModule" && this.playerLevel === 7) {
        this.playerLevel = 8;
        console.log(`Player leveled up to Level ${this.playerLevel}! Now focusing on Self-Consistency.`);
    } else if (moduleName === "SelfConsistencyPromptingModule" && this.playerLevel === 8) {
        this.playerLevel = 9;
        console.log(`Player leveled up to Level ${this.playerLevel}! Now focusing on Tree of Thoughts.`);
    } else if (moduleName === "ToTPromptingModule" && this.playerLevel === 9) {
        console.log("Player completed the final level!");
        // Potentially set a flag or different state instead of just incrementing level
    } else if (moduleName === "APEModule" && this.playerLevel === 10) {
        console.log("Player completed the final level!");
        // Potentially set a flag or different state instead of just incrementing level
    } else if (moduleName === "CodePromptingModule" && this.playerLevel === 11) {
        console.log("Player completed the final level!");
        // Potentially set a flag or different state instead of just incrementing level
    }
    // Add more level-up conditions here

    // --- Switch Active Module --- 
    // Re-run initModules to select the next appropriate module based on the new level/completion status
    this.initModules(); 

    // If initModules failed to set an active module (e.g., no more modules)
    if (!this.activeModule) {
        console.log("All available modules completed or no suitable module found.");
        // Trigger game over or show a final completion message?
        this.statusMessage = "Congratulations! All current challenges completed!";
        // Optionally trigger the game over sequence
        this.gameOver(); 
    }
  }

  // Helper to check if all defined modules are marked complete
  allModulesCompleted() {
      const definedModules = [
          "EnergyConversionModule", 
          "FewShotModule", 
          "RolePromptingModule",
          "SystemPromptingModule",
          "ContextualPromptingModule",
          "StepBackPromptingModule",
          "CoTPromptingModule",
          "SelfConsistencyPromptingModule",
          "ToTPromptingModule",
          "APEModule",
          "CodePromptingModule"
      ];
      // Check if every module in the list exists in the completedModules set
      return definedModules.every(moduleName => this.completedModules.has(moduleName));
  }

  // --- API Key Management ---
  setApiKey(key) {
    // Basic storage. In a real app, consider more secure options if possible.
    this.apiKey = key;
    console.log("API Key has been set in GameEngine.");
    // TODO: Optionally save to localStorage if persistence is desired (still insecure)
    // localStorage.setItem('openai_api_key', key);
  }

  getApiKey() {
    // TODO: Optionally load from localStorage if persistence is desired
    // if (!this.apiKey) {
    //    this.apiKey = localStorage.getItem('openai_api_key');
    // }
    return this.apiKey;
  }
}

// Removed the old DOMContentLoaded bootstrap logic.
// Initialization is now handled by ui.js
