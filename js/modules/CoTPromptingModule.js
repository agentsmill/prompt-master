/**
 * CoTPromptingModule
 * Teaches Chain of Thought prompting techniques.
 */
export class CoTPromptingModule {
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
        const scenarioFile = "js/data/cotPromptingScenarios.json";
        console.log(`CoTPromptingModule: Loading scenarios from ${scenarioFile}`);
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
            this.scenarios = [{ id: "fallback_cot_1", title: "Fallback CoT Prompt", description: "Ask AI to think step-by-step.", type:"cot-prompting", domain:"Fallback", required_instruction:"step by step" }];
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
            ctx.fillText("Loading CoT Scenarios...", 24, 48);
            ctx.restore();
            return;
        }
        const scenario = this.scenarios[this.currentScenarioIdx];
        if (!scenario) { ctx.fillStyle = "#ff6b6b"; ctx.fillText("Error: Invalid scenario index.", 24, 48); ctx.restore(); return; }

        ctx.fillText(`Chain of Thought (CoT) Prompting:`, 24, 48);
        ctx.fillStyle = "#44e0ff";
        ctx.fillText(scenario.title || "Untitled", 24, 80);
        ctx.fillStyle = "#b0b8c1";
        const descriptionEndY = this.wrapText(ctx, scenario.description || "No description.", 24, 120, 432, 24);
        ctx.fillStyle = "#ffec70"; // Yellow for hint
        const hintLabelY = descriptionEndY + 15;
        ctx.fillText(`Hint: Include instruction like '${scenario.required_instruction || 'step by step'}'`, 24, hintLabelY);
        ctx.fillStyle = "#7fff6a";
        const promptLabelY = hintLabelY + 30;
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
        if (!scenario) { feedbackBox.textContent = "Error: Invalid scenario."; return; }
        console.log(`(CoT) Processing prompt for challenge: ${scenario.id}`, promptText);
        let feedbackMessage = "Evaluating CoT prompt...";
        let score = 0;
        const promptLower = promptText.toLowerCase();
        const requiredInstructionLower = scenario.required_instruction?.toLowerCase() || "step by step";

        // Basic check: Does the prompt contain the required CoT instruction?
        if (promptLower.includes(requiredInstructionLower)) {
            score += 10;
            feedbackMessage = "CoT instruction included: ✔️";
        } else {
            feedbackMessage = `Prompt should include a CoT instruction like '${scenario.required_instruction || 'step by step'}': ❌`;
        }

        this.engine.addScore(score);
        feedbackBox.textContent = feedbackMessage;

        const qualityThreshold = 8;
        if (score >= qualityThreshold) {
            console.log(`(CoT) Prompt evaluated. Score: ${score}. Advancing.`);
            feedbackMessage += " | CoT applied! Advancing.";
            this.currentScenarioIdx++;
            if (this.currentScenarioIdx >= this.scenarios.length) {
                feedbackMessage = "CoT Prompting Module Complete!";
                console.log("CoTPromptingModule finished.");
                this.engine.moduleCompleted(this.constructor.name);
            }
        } else {
            feedbackMessage += " | Needs improvement. Try again!";
            console.log(`(CoT) Prompt evaluated. Score: ${score}. Needs improvement.`);
        }
        feedbackBox.textContent = feedbackMessage;
    }

    reset() {
        console.log("Resetting CoTPromptingModule...");
        this.currentScenarioIdx = 0;
        const feedbackBox = document.getElementById('feedback-box');
        if (feedbackBox) {
            feedbackBox.textContent = "Ready for the Chain of Thought (CoT) challenge!";
        }
    }

    resetStatusMessage() {
        this.statusMessage = this.loaded ? "Ready for a Chain of Thought challenge!" : "Loading...";
    }
}
