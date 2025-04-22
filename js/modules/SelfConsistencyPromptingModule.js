/**
 * SelfConsistencyPromptingModule
 * Teaches Self-Consistency prompting concepts.
 */
export class SelfConsistencyPromptingModule {
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
        const scenarioFile = "js/data/selfConsistencyScenarios.json";
        console.log(`SelfConsistencyPromptingModule: Loading scenarios from ${scenarioFile}`);
        try {
            const resp = await fetch(scenarioFile);
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            this.scenarios = await resp.json();
            if (!Array.isArray(this.scenarios) || this.scenarios.length === 0) {
                throw new Error('Invalid scenario data format');
            }
            this.loaded = true;
            this.reset();
        } catch (e) {
            console.error(`Failed to load scenarios from ${scenarioFile}:`, e);
            this.scenarios = [{ id: "fallback_sc_1", title: "Fallback Self-Consistency", description: "Concept: Run prompt multiple times, take majority answer.", type:"self-consistency-prompting", domain:"Conceptual", task_input:"Classify complex text."}];
            this.loaded = true;
            this.reset();
        }
    }

    update(delta) {}

    render(ctx) {
        ctx.save();
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillStyle = "#ffe066";
        ctx.textAlign = "left";

        if (!this.loaded || this.scenarios.length === 0) {
            ctx.fillText("Loading Self-Consistency Scenarios...", 24, 48);
            ctx.restore();
            return;
        }
        const scenario = this.scenarios[this.currentScenarioIdx];
        if (!scenario) { ctx.fillStyle = "#ff6b6b"; ctx.fillText("Error: Invalid scenario index.", 24, 48); ctx.restore(); return; }

        ctx.fillText(`Self-Consistency Prompting:`, 24, 48);
        ctx.fillStyle = "#44e0ff";
        ctx.fillText(scenario.title || "Untitled", 24, 80);
        ctx.fillStyle = "#b0b8c1";
        const descriptionEndY = this.wrapText(ctx, scenario.description || "No description.", 24, 120, 432, 24);
        ctx.fillStyle = "#ffec70"; // Yellow hint
        const hintLabelY = descriptionEndY + 15;
        ctx.fillText(`Concept: Write a single good prompt (often CoT).`, 24, hintLabelY);
        ctx.fillStyle = "#7fff6a";
        const promptLabelY = hintLabelY + 30;
        ctx.fillText("Your Prompt (for simulated multiple runs):", 24, promptLabelY);
        ctx.restore();
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(" ");
        let line = "";
        let currentY = y;
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + " ";
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + " ";
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
        return currentY + lineHeight;
    }

    processPrompt(promptText) {
        const feedbackBox = document.getElementById('feedback-box');
        if (!this.loaded || !feedbackBox) return;
        const scenario = this.scenarios[this.currentScenarioIdx];
        if (!scenario) { feedbackBox.textContent = "Error: Invalid scenario."; return; }
        console.log(`(Self-Consistency) Processing prompt for challenge: ${scenario.id}`, promptText);
        let feedbackMessage = "Evaluating prompt for Self-Consistency concept...";
        let score = 0;
        const promptLower = promptText.toLowerCase();

        // Check if prompt asks for reasoning (good practice for self-consistency)
        if (promptLower.includes("step by step") || promptLower.includes("explain why")) {
            score += 10;
            feedbackMessage = "Good! Prompt asks for reasoning, suitable for self-consistency. ✔️";
        } else {
            feedbackMessage = "Consider asking for reasoning (e.g., 'step by step') to improve self-consistency. 🤔";
            score += 5; // Still give some points for attempting
        }
        
         // Simulate results
         feedbackMessage += ` | Simulation: Prompt ran 3 times. Results: ['Answer A', 'Answer B', 'Answer A']. Majority answer: 'Answer A'.`;

        this.engine.addScore(score);
        feedbackBox.textContent = feedbackMessage;

        const qualityThreshold = 5; // Lower threshold as it's conceptual
         if (score >= qualityThreshold) {
           console.log(`(Self-Consistency) Prompt evaluated. Score: ${score}. Advancing.`);
           feedbackMessage += " | Advancing."; // Keep feedback simple
           this.currentScenarioIdx++;
           if (this.currentScenarioIdx >= this.scenarios.length) {
             feedbackMessage = "Self-Consistency Module Complete!";
             console.log("SelfConsistencyPromptingModule finished.");
             this.engine.moduleCompleted(this.constructor.name);
           }
         } else {
             // This case might not be reached with current scoring
             feedbackMessage += " | Try again!";
             console.log(`(Self-Consistency) Prompt evaluated. Score: ${score}. Needs improvement.`);
         }
         feedbackBox.textContent = feedbackMessage;
    }

    reset() {
        console.log("Resetting SelfConsistencyPromptingModule...");
        this.currentScenarioIdx = 0;
        const feedbackBox = document.getElementById('feedback-box');
        if (feedbackBox) {
            feedbackBox.textContent = "Ready for the Self-Consistency challenge! Write one good prompt.";
        }
    }

    resetStatusMessage() {
        this.statusMessage = this.loaded ? "Ready for a Self-Consistency challenge!" : "Loading...";
    }
}
