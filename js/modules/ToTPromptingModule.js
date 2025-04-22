/**
 * ToTPromptingModule
 * Teaches Tree of Thoughts prompting concepts.
 */
export class ToTPromptingModule {
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
        const scenarioFile = "js/data/totScenarios.json";
        console.log(`ToTPromptingModule: Loading scenarios from ${scenarioFile}`);
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
            this.scenarios = [{ id: "fallback_tot_1", title: "Fallback ToT", description: "Concept: Explore multiple reasoning paths.", type:"tot-prompting", domain:"Conceptual", task_input:"Design complex system."}];
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
            ctx.fillText("Loading ToT Scenarios...", 24, 48);
            ctx.restore();
            return;
        }
        const scenario = this.scenarios[this.currentScenarioIdx];
        if (!scenario) { ctx.fillStyle = "#ff6b6b"; ctx.fillText("Error: Invalid scenario index.", 24, 48); ctx.restore(); return; }

        ctx.fillText(`Tree of Thoughts (ToT) Prompting:`, 24, 48);
        ctx.fillStyle = "#44e0ff";
        ctx.fillText(scenario.title || "Untitled", 24, 80);
        ctx.fillStyle = "#b0b8c1";
        const descriptionEndY = this.wrapText(ctx, scenario.description || "No description.", 24, 120, 432, 24);
        ctx.fillStyle = "#ffec70"; // Yellow hint
        const hintLabelY = descriptionEndY + 15;
        ctx.fillText(`Hint: Ask AI to explore options or evaluate alternatives.`, 24, hintLabelY);
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
        console.log(`(ToT) Processing prompt for challenge: ${scenario.id}`, promptText);
        let feedbackMessage = "Evaluating ToT prompt concept...";
        let score = 0;
        const promptLower = promptText.toLowerCase();
        const explorationKeywords = ["explore", "options", "alternatives", "evaluate", "compare paths", "consider different"];

        // Check if prompt encourages exploration
        if (explorationKeywords.some(kw => promptLower.includes(kw))) {
            score += 10;
            feedbackMessage = "Good! Prompt encourages exploration, suitable for ToT. ✔️";
        } else {
            feedbackMessage = "Consider asking the AI to explore options or evaluate alternatives. 🤔";
            score += 5; // Partial credit
        }

        this.engine.addScore(score);
        feedbackBox.textContent = feedbackMessage;

        const qualityThreshold = 5; // Conceptual threshold
        if (score >= qualityThreshold) {
            console.log(`(ToT) Prompt evaluated. Score: ${score}. Advancing.`);
            feedbackMessage += " | Advancing.";
            this.currentScenarioIdx++;
            if (this.currentScenarioIdx >= this.scenarios.length) {
                feedbackMessage = "Tree of Thoughts (ToT) Module Complete!";
                console.log("ToTPromptingModule finished.");
                this.engine.moduleCompleted(this.constructor.name);
            }
        } else {
            feedbackMessage += " | Try again!";
            console.log(`(ToT) Prompt evaluated. Score: ${score}. Needs improvement.`);
        }
        feedbackBox.textContent = feedbackMessage;
    }

    reset() {
        console.log("Resetting ToTPromptingModule...");
        this.currentScenarioIdx = 0;
        const feedbackBox = document.getElementById('feedback-box');
        if (feedbackBox) {
            feedbackBox.textContent = "Ready for the Tree of Thoughts (ToT) challenge!";
        }
    }

    resetStatusMessage() {
        this.statusMessage = this.loaded ? "Ready for a Tree of Thoughts challenge!" : "Loading...";
    }
}
