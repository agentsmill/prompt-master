/**
 * EnergyConversionModule
 * Teaches zero-shot prompting for energy conversion challenges.
 * Loads scenarios from data/energyScenarios.json (data-driven, not hardcoded).
 */
// Constants for energy conversion
const UNIT_MULTIPLIERS = {
  J: 1,
  KJ: 1000,
  MJ: 1e6,
  GJ: 1e9,
  WH: 3600,
  KWH: 3.6e6,
  MWH: 3.6e9,
  GWH: 3.6e12,
  BTU: 1055.05585, // International Table BTU
  THERM: 105505585, // Approx. 100,000 BTU (US definition varies slightly)
  // Add other units as needed
};

const ERROR_TYPES = {
  INVALID_VALUE: "INVALID_VALUE",
  UNKNOWN_UNIT: "UNKNOWN_UNIT",
  CONVERSION_FAILED: "CONVERSION_FAILED",
};

export { ERROR_TYPES }; // Export for use in tests

export class EnergyConversionModule {
  constructor(engine) {
    this.engine = engine;
    this.ctx = engine.ctx;
    this.scenarios = [];
    this.currentScenarioIdx = 0;
    this.loaded = false;
    this.statusMessage = "";
    this.init();
  }

  async init() {
    // Load different scenarios based on engine level
    const scenarioFile = this.engine.playerLevel === 1 ? "js/data/energyScenarios.json" : "js/data/fewShotScenarios.json"; // Assumes level 2 uses few-shot
    console.log(`EnergyConversionModule (Level ${this.engine.playerLevel}): Loading scenarios from ${scenarioFile}`);

    try {
      const resp = await fetch(scenarioFile);
      if (!resp.ok) { // Check if the fetch was successful
          throw new Error(`HTTP error! status: ${resp.status} for ${scenarioFile}`);
      }
      this.scenarios = await resp.json();
      this.loaded = true;
      this.resetStatusMessage(); // Set initial status message
    } catch (e) {
      console.error(`Failed to load scenarios from ${scenarioFile}:`, e);
      // Hardcode simple scenarios as fallback if fetch fails, tailored to level
      if (this.engine.playerLevel === 1) {
          this.scenarios = [
              { id: "fallback_zero_1", title: "Fallback Zero-Shot", description: "Convert 100 kWh to Joules.", type: "zero-shot", domain: "General", energyValues: [{ value: 100, unit: "kWh" }] }
          ];
          this.statusMessage = "Using fallback zero-shot scenario.";
      } else {
           this.scenarios = [
              { 
                  id: "fallback_few_1", title: "Fallback Few-Shot", type: "few-shot", domain: "Optimization", 
                  description: "Optimize solar panel tilt angle. Example Input: Location: London, UK. Output: Optimal Tilt: 35 degrees. Now process: Location: Cairo, Egypt.", 
                  examples: [ { input: "Location: London, UK.", output: "Optimal Tilt: 35 degrees." } ],
                  task_input: "Location: Cairo, Egypt."
              }
          ];
           this.statusMessage = "Using fallback few-shot scenario.";
      }
      this.loaded = true; // Mark as loaded even with fallback
      this.currentScenarioIdx = 0;
    }
  }

  update(delta) {
    // Placeholder for future logic (e.g., input handling, challenge progression)
  }

  render(ctx) {
    ctx.save();
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillStyle = "#ffe066";
    ctx.textAlign = "left";

    if (!this.loaded) {
      ctx.fillText("Loading scenarios...", 24, 48);
      ctx.restore();
      return;
    }

    // Determine challenge type based on level
    const challengeType = this.engine.playerLevel === 1 ? "Zero-Shot" : "Few-Shot";

    // Render current scenario
    const rawScenario = this.scenarios[this.currentScenarioIdx];
    const scenario = this.parseChallenge(rawScenario); // Use the parser

    // Add basic error handling in case parsing fails
    if (!scenario) {
      ctx.fillStyle = "#ff6b6b"; // Use an error color
      ctx.fillText("Error: Could not load scenario data.", 24, 48);
      ctx.restore();
      return;
    }
    ctx.fillText(`${challengeType} Challenge:`, 24, 48); // Dynamic title
    ctx.fillStyle = "#44e0ff";
    ctx.fillText(scenario.title, 24, 80);

    ctx.fillStyle = "#b0b8c1";
    this.wrapText(ctx, scenario.description, 24, 112, 432, 24);

    ctx.fillStyle = "#7fff6a";
    ctx.fillText("Prompt:", 24, 180);
    ctx.fillStyle = "#fff";
    ctx.fillText("[Type your prompt in the UI below]", 24, 210);

    ctx.fillStyle = "#ffec70";
    ctx.fillText(this.statusMessage, 24, 300);

    ctx.restore();
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    // Utility for multi-line scenario descriptions
    const words = text.split(" ");
    let line = "";
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  /**
   * Parses a raw scenario object, extracting basic fields and identifying
   * energy values with units within the description using regex.
   * @param {object} scenario - The raw scenario object from energyScenarios.json.
   * @returns {object|null} - Structured challenge data { id, title, description, type, domain, parameters, energyValues } or null if parsing fails.
   */
  parseChallenge(scenario) {
    if (!scenario || typeof scenario.description !== "string") {
      console.error(
        "EnergyConversionModule: Cannot parse scenario or description is missing/invalid.",
        scenario
      );
      return null;
    }

    // Regex to find numbers followed by common energy units
    // Handles integers and decimals, optional space, and specific units.
    const energyRegex =
      /(\d+(?:\.\d+)?)\s*(J|kJ|MJ|GJ|Wh|kWh|MWh|GWh|BTU|therm)\b/gi;

    const energyValues = [];
    let match;
    // Use regex.exec in a loop to find all matches in the description
    while ((match = energyRegex.exec(scenario.description)) !== null) {
      energyValues.push({
        value: parseFloat(match[1]), // Convert matched number string to float
        unit: match[2], // The captured unit
        raw: match[0], // The full matched string e.g., "100 kWh"
      });
    }

    // Basic parsing - extract relevant fields.
    const parsedData = {
      id: scenario.id,
      title: scenario.title,
      description: scenario.description,
      type: scenario.type,
      domain: scenario.domain,
      parameters: scenario.parameters || {}, // Ensure parameters object exists
      energyValues: energyValues, // Add the extracted energy values
    };

    // Log extracted values for debugging if needed
    // if (energyValues.length > 0) {
    //   console.log(`Extracted energy values for scenario ${scenario.id}:`, energyValues);
    // }

    return parsedData;
  }

  /**
   * Normalizes different unit representations to a standard key used in UNIT_MULTIPLIERS.
   * Handles case-insensitivity and common variations.
   * @param {string} unit - The input unit string (e.g., "kWh", "joules", "BTU").
   * @returns {string|null} The standardized unit key (e.g., "KWH", "J", "BTU") or null if not recognized.
   * @private // Using JS private class field syntax
   */
  #normalizeUnit(unit) {
    if (typeof unit !== "string" || unit.trim() === "") {
      return null;
    }
    const upperUnit = unit.toUpperCase().trim();

    // Direct mapping for standard abbreviations
    if (UNIT_MULTIPLIERS[upperUnit]) {
      return upperUnit;
    }

    // Handle variations (add more as needed)
    switch (upperUnit) {
      case "JOULE":
      case "JOULES":
        return "J";
      case "KILOJOULE":
      case "KILOJOULES":
        return "KJ";
      case "MEGAJOULE":
      case "MEGAJOULES":
        return "MJ";
      case "GIGAJOULE":
      case "GIGAJOULES":
        return "GJ";
      case "WATT-HOUR":
      case "WATT HOUR":
      case "WATTHOUR":
        return "WH";
      case "KILOWATT-HOUR":
      case "KILOWATT HOUR":
      case "KILOWATTHOUR":
        return "KWH";
      case "MEGAWATT-HOUR":
      case "MEGAWATT HOUR":
      case "MEGAWATTHOUR":
        return "MWH";
      case "GIGAWATT-HOUR":
      case "GIGAWATT HOUR":
      case "GIGAWATTHOUR":
        return "GWH";
      case "BRITISH THERMAL UNIT":
      case "BRITISH THERMAL UNITS":
        return "BTU";
      case "THERMS":
        return "THERM";
      default:
        return null; // Unit not recognized
    }
  }

  /**
   * Converts a given energy value from its unit to Joules.
   * @param {number} value - The numerical value to convert.
   * @param {string} unit - The unit of the input value (e.g., "kWh", "BTU").
   * @returns {{value: number|null, error: string|null}} - An object containing the value in Joules or an error type.
   */
  convertToJoules(value, unit) {
    if (typeof value !== "number" || !isFinite(value)) {
      return { value: null, error: ERROR_TYPES.INVALID_VALUE };
    }

    const normalizedUnit = this.#normalizeUnit(unit);
    if (!normalizedUnit) {
      return { value: null, error: ERROR_TYPES.UNKNOWN_UNIT };
    }

    const multiplier = UNIT_MULTIPLIERS[normalizedUnit];
    if (multiplier === undefined) {
      // This case should theoretically not happen if #normalizeUnit works correctly
      console.error(
        `EnergyConversionModule: Missing multiplier for normalized unit ${normalizedUnit}`
      );
      return { value: null, error: ERROR_TYPES.UNKNOWN_UNIT };
    }

    return { value: value * multiplier, error: null };
  }

  /**
   * Converts an energy value from one unit to another.
   * @param {number} value - The numerical value to convert.
   * @param {string} fromUnit - The unit of the input value.
   * @param {string} toUnit - The target unit to convert to.
   * @returns {{value: number|null, error: string|null}} - An object containing the converted value or an error type.
   */
  convert(value, fromUnit, toUnit) {
    const joulesResult = this.convertToJoules(value, fromUnit);
    if (joulesResult.error) {
      return joulesResult; // Propagate error (INVALID_VALUE or UNKNOWN_UNIT for fromUnit)
    }

    const joulesValue = joulesResult.value;

    const normalizedToUnit = this.#normalizeUnit(toUnit);
    if (!normalizedToUnit) {
      return { value: null, error: ERROR_TYPES.UNKNOWN_UNIT }; // Error for toUnit
    }

    const toMultiplier = UNIT_MULTIPLIERS[normalizedToUnit];
    if (toMultiplier === undefined || toMultiplier === 0) {
      // Handle missing multiplier or division by zero
      console.error(
        `EnergyConversionModule: Missing or invalid multiplier for target unit ${normalizedToUnit}`
      );
      return { value: null, error: ERROR_TYPES.CONVERSION_FAILED };
    }

    const finalValue = joulesValue / toMultiplier;
    return { value: finalValue, error: null };
  }

  /**
   * Processes the user's prompt, attempts to extract an answer, checks it,
   * updates status, and potentially awards points.
   * @param {string} promptText
   */
  processPrompt(promptText) {
    if (!this.loaded || this.scenarios.length === 0) {
      this.statusMessage = "Error: Scenarios not loaded.";
      return;
    }

    const currentChallenge = this.parseChallenge(
      this.scenarios[this.currentScenarioIdx]
    );
    if (!currentChallenge || !currentChallenge.energyValues || currentChallenge.energyValues.length === 0) {
      this.statusMessage = "Error processing current challenge data.";
      // Attempt to advance to prevent getting stuck, or log error
      console.error("Scenario data invalid or missing energyValues:", currentChallenge);
      this.currentScenarioIdx = (this.currentScenarioIdx + 1) % this.scenarios.length;
      return;
    }

    // Call level-specific processing
    if (this.engine.playerLevel === 1) {
        this.processZeroShotPrompt(promptText, currentChallenge);
    } else {
        this.processFewShotPrompt(promptText, currentChallenge);
    }
  }

  // --- Level 1: Zero-Shot Processing --- 
  processZeroShotPrompt(promptText, currentChallenge) {
     // Assume the first energy value found is the one to convert for this simple module
     const { value: inputValue, unit: inputUnit } = currentChallenge.energyValues[0];
     // For this example, let's assume the implicit target is Joules unless specified.
     const targetUnit = "J"; // Could be made dynamic later

     console.log(
      `(Level 1) Processing zero-shot prompt for challenge: ${currentChallenge.id}`,
      promptText
    );
     this.statusMessage = "Analyzing your zero-shot prompt...";

     // --- Prompt Evaluation Logic (Zero-Shot) --- 
     let score = 0;
     let feedback = [];
     const promptLower = promptText.toLowerCase();

     // Criterion 1: Includes Input Value?
     if (promptLower.includes(inputValue.toString())) {
       score += 3;
       feedback.push("Includes input value: ✔️");
     } else {
       feedback.push(`Missing input value (${inputValue}): ❌`);
     }

     // Criterion 2: Includes Input Unit?
     // Be lenient with unit matching (e.g., allow "kwh" or "kilowatt-hour")
     if (promptLower.includes(inputUnit.toLowerCase()) || promptLower.includes(this.#normalizeUnit(inputUnit).toLowerCase())) {
       score += 3;
        feedback.push(`Includes input unit (${inputUnit}): ✔️`);
     } else {
        feedback.push(`Missing input unit (${inputUnit}): ❌`);
     }

     // Criterion 3: Specifies Action?
     const actionWords = ["convert", "calculate", "what is", "how many", "compute"];
     if (actionWords.some(word => promptLower.includes(word))) {
       score += 2;
       feedback.push("Specifies action: ✔️");
     } else {
       feedback.push("Doesn't clearly specify action (e.g., 'convert'): ❌");
     }

     // Criterion 4: Specifies Target Unit? (Bonus)
     const targetUnitLower = targetUnit.toLowerCase();
     if (promptLower.includes(targetUnitLower) || promptLower.includes("joules")) { // Be lenient
       score += 2;
       feedback.push(`Specifies target unit (${targetUnit}): ✔️`);
     } else {
       feedback.push(`Doesn't specify target unit (${targetUnit}): Optional but good practice!`);
     }

     // --- Feedback and Progression (Zero-Shot) ---
     this.statusMessage = feedback.join(' | '); // Combine feedback messages

     const qualityThreshold = 5; // Minimum score needed to be considered "successful" enough to advance

     if (score > 0) {
         this.engine.addScore(score);
     }

     if (score >= qualityThreshold) {
       this.statusMessage += " | Good prompt! Advancing to next challenge.";
       console.log(`(Level 1) Prompt evaluated. Score: ${score}. Advancing.`);

       // Move to the next scenario
       this.currentScenarioIdx++;
       if (this.currentScenarioIdx >= this.scenarios.length) {
         // --- MODULE COMPLETE --- 
         this.statusMessage = "Zero-Shot Module Complete!";
         console.log("EnergyConversionModule (Level 1) finished.");
         this.engine.moduleCompleted(this.constructor.name); // Notify engine
         // Don't reset index here, engine will switch module or end game
         return; // Stop further processing in this call
       }
     } else {
         this.statusMessage += " | Prompt needs improvement. Try again!";
         console.log(`(Level 1) Prompt evaluated. Score: ${score}. Needs improvement.`);
         // Player stays on the same challenge
     }
     // --- End Evaluation Logic (Zero-Shot) ---
  }

  // --- Level 2: Few-Shot Processing (Placeholder) --- 
  processFewShotPrompt(promptText, currentChallenge) {
       console.log(
        `(Level 2) Processing few-shot prompt for challenge: ${currentChallenge.id}`,
        promptText
      );
       this.statusMessage = "Analyzing your few-shot prompt...";

       // --- Prompt Evaluation Logic (Few-Shot) --- 
       let score = 0;
       let feedback = [];
       const promptLower = promptText.toLowerCase();

       // Criterion 1: Includes Examples? (Very basic check)
       // A real check would parse the prompt structure for example markers (e.g., "EXAMPLE:", input/output pairs)
       const exampleKeywords = ["example:", "input:", "output:", "e.g."];
       if (exampleKeywords.some(word => promptLower.includes(word)) && promptLower.split(exampleKeywords[0]).length > 1) { // Crude check for >1 example section
            score += 5;
            feedback.push("Includes examples: ✔️");
       } else {
            feedback.push("Prompt should include at least one example (Input/Output pair): ❌");
       }

        // Criterion 2: Includes Task Input? (Check if the final task part is in the prompt)
        if (currentChallenge.task_input && promptLower.includes(currentChallenge.task_input.toLowerCase())) {
            score += 5;
            feedback.push("Includes task input: ✔️");
        } else {
            feedback.push(`Missing task input ('${currentChallenge.task_input}'): ❌`);
        }
        // Add other relevant checks: e.g., clarity of examples, consistency

       // --- Feedback and Progression (Few-Shot) --- 
       this.statusMessage = feedback.join(' | ');
       const qualityThreshold = 7; // Higher bar for few-shot

       if (score > 0) {
           this.engine.addScore(score);
       }

       if (score >= qualityThreshold) {
           this.statusMessage += " | Good few-shot prompt! Advancing.";
           console.log(`(Level 2) Prompt evaluated. Score: ${score}. Advancing.`);
           this.currentScenarioIdx++;
           if (this.currentScenarioIdx >= this.scenarios.length) {
               // --- MODULE COMPLETE (Level 2) --- 
               this.statusMessage = "Few-Shot Module Complete!";
               console.log("EnergyConversionModule (Level 2) finished.");
               this.engine.moduleCompleted("FewShotModule"); // Use a different name for progression
               return; 
           }
       } else {
           this.statusMessage += " | Few-shot prompt needs improvement. Try again!";
           console.log(`(Level 2) Prompt evaluated. Score: ${score}. Needs improvement.`);
       }
       // --- End Evaluation Logic (Few-Shot) --- 
  }

  // Reset module state
  reset() {
    console.log(`Resetting EnergyConversionModule (Level ${this.engine.playerLevel})...`);
    this.currentScenarioIdx = 0;
    this.resetStatusMessage();
    // No score reset here, engine handles score reset.
    console.log(`EnergyConversionModule (Level ${this.engine.playerLevel}) reset.`);
  }

  // Helper to set initial status message based on level
  resetStatusMessage() {
     if (!this.loaded) {
         this.statusMessage = "Loading scenarios...";
         return;
     }
     if (this.engine.playerLevel === 1) {
         this.statusMessage = "Ready for your first zero-shot challenge!";
     } else {
         this.statusMessage = "Ready for your first few-shot challenge!";
     }
  }
}
