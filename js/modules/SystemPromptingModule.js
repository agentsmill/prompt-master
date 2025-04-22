/**
 * SystemPromptingModule
 * Teaches system prompting techniques.
 */
export class SystemPromptingModule {
    constructor(engine) {
        this.engine = engine;
        this.ctx = engine.ctx;
        this.scenarios = [];
        this.currentScenarioIdx = 0;
        this.loaded = false;
        this.init();
    }

    async init() {
        const scenarioFile = "js/data/systemPromptingScenarios.json";
        console.log(`SystemPromptingModule: Loading scenarios from ${scenarioFile}`);
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
            this.scenarios = [{ id: "fallback_system_1", title: "Fallback System Prompt", description: "Define system constraints.", type:"system-prompting", domain:"Fallback" }];
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
            ctx.fillText("Loading System Scenarios...", 24, 48);
            ctx.restore();
            return;
        }
        const scenario = this.scenarios[this.currentScenarioIdx];
        if (!scenario) {
            ctx.fillStyle = "#ff6b6b";
            ctx.fillText("Error: Invalid scenario index.", 24, 48);
            ctx.restore();
            return;
        }

        ctx.fillText(`System Prompting Challenge:`, 24, 48);
        ctx.fillStyle = "#44e0ff";
        ctx.fillText(scenario.title || "Untitled", 24, 80);
        ctx.fillStyle = "#b0b8c1";
        const descriptionEndY = this.wrapText(ctx, scenario.description || "No description.", 24, 120, 432, 24);
        ctx.fillStyle = "#ffec70"; // Yellow for constraint
        const constraintLabelY = descriptionEndY + 15;
        ctx.fillText(`Required Constraint: ${scenario.system_constraint || 'None specified'}`, 24, constraintLabelY);
        ctx.fillStyle = "#7fff6a";
        const promptLabelY = constraintLabelY + 30;
        ctx.fillText("Your Prompt:", 24, promptLabelY);
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
        if (!scenario) {
            feedbackBox.textContent = "Error: Invalid scenario.";
            return;
        }
        console.log(`(System Prompting) Processing prompt for challenge: ${scenario.id}`, promptText);
        let feedbackMessage = "Evaluating system prompt...";
        let score = 0;
        const promptLower = promptText.toLowerCase();
        const constraintLower = scenario.system_constraint?.toLowerCase() || "";

        // Basic check: Does the prompt contain the essence of the constraint?
        // More robust checking would involve NLP or stricter keyword matching.
        if (constraintLower && promptLower.includes(constraintLower.substring(0, 20))) { // Check for first part of constraint
            score += 10;
            feedbackMessage = "System constraint included: ✔️";
        } else if (constraintLower) {
            feedbackMessage = `Prompt should include the system constraint ('${scenario.system_constraint}'): ❌`;
        } else {
            feedbackMessage = "No specific constraint required for this scenario.";
            score = 10; // Auto-pass if no constraint
        }

        this.engine.addScore(score);
        feedbackBox.textContent = feedbackMessage;

        const qualityThreshold = 8;
        if (score >= qualityThreshold) {
            console.log(`(System Prompting) Prompt evaluated. Score: ${score}. Advancing.`);
            feedbackMessage += " | Constraint applied! Advancing.";
            this.currentScenarioIdx++;
            if (this.currentScenarioIdx >= this.scenarios.length) {
                feedbackMessage = "System Prompting Module Complete!";
                console.log("SystemPromptingModule finished.");
                this.engine.moduleCompleted(this.constructor.name);
            }
        } else {
            feedbackMessage += " | Needs improvement. Try again!";
            console.log(`(System Prompting) Prompt evaluated. Score: ${score}. Needs improvement.`);
        }
        feedbackBox.textContent = feedbackMessage;
    }

    reset() {
        console.log("Resetting SystemPromptingModule...");
        this.currentScenarioIdx = 0;
        const feedbackBox = document.getElementById('feedback-box');
        if (feedbackBox) {
            feedbackBox.textContent = "Ready for the System Prompting challenge!";
        }
    }
}
