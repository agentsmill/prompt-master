/**
 * ContextualPromptingModule
 * Teaches contextual prompting techniques.
 */
export class ContextualPromptingModule {
    constructor(engine) {
        this.engine = engine;
        this.ctx = engine.ctx;
        this.scenarios = [];
        this.currentScenarioIdx = 0;
        this.loaded = false;
        this.init();
    }

    async init() {
        const scenarioFile = "js/data/contextualPromptingScenarios.json";
        console.log(`ContextualPromptingModule: Loading scenarios from ${scenarioFile}`);
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
            this.scenarios = [{ id: "fallback_context_1", title: "Fallback Context Prompt", description: "Incorporate provided context.", type:"contextual-prompting", domain:"Fallback", context:"Sample context." }];
            this.loaded = true;
            this.reset();
        }
    }

    update(delta) {}

    render(ctx) {
        ctx.save();
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillStyle = "#ffe066"; // Yellow title
        ctx.textAlign = "left";

        if (!this.loaded || this.scenarios.length === 0) {
            ctx.fillText("Loading Context Scenarios...", 24, 48);
            ctx.restore();
            return;
        }
        const scenario = this.scenarios[this.currentScenarioIdx];
        if (!scenario) {
            ctx.fillStyle = "#ff6b6b"; // Error color
            ctx.fillText("Error: Invalid scenario index.", 24, 48);
            ctx.restore();
            return;
        }

        ctx.fillText(`Contextual Prompting:`, 24, 48);
        ctx.fillStyle = "#44e0ff"; // Blue subtitle
        ctx.fillText(scenario.title || "Untitled", 24, 80);
        ctx.fillStyle = "#b0b8c1"; // Light gray description
        const descriptionEndY = this.wrapText(ctx, scenario.description || "No description.", 24, 120, 432, 24);
        
        // Display the Context
        ctx.fillStyle = "#ffec70"; // Yellow for context label
        const contextLabelY = descriptionEndY + 15; 
        ctx.fillText(`Context to Include:`, 24, contextLabelY);
        ctx.fillStyle = "#cccccc"; // Lighter gray for context text
        const contextEndY = this.wrapText(ctx, scenario.context || "No context provided.", 24, contextLabelY + 24, 432, 18); // Slightly smaller line height for context
        
        ctx.fillStyle = "#7fff6a"; // Green for prompt label
        const promptLabelY = contextEndY + 30;
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
        console.log(`(Contextual) Processing prompt for challenge: ${scenario.id}`, promptText);
        let feedbackMessage = "Evaluating contextual prompt...";
        let score = 0;
        const promptLower = promptText.toLowerCase();
        const contextLower = scenario.context?.toLowerCase() || "";
        // Get some non-trivial keywords from context to check for inclusion
        const contextKeywords = contextLower.split(' ').filter(w => w.length > 4).slice(0, 4); 

        // Basic check: Does the prompt contain some keywords from the context?
        if (contextKeywords.length > 0 && contextKeywords.some(kw => promptLower.includes(kw))) {
            score += 10;
            feedbackMessage = "Context included/referenced: ✔️";
        } else if (contextKeywords.length > 0) {
            feedbackMessage = `Prompt should reference the provided context ('${scenario.context.substring(0, 30)}...'): ❌`;
        } else {
            feedbackMessage = "No specific context provided for this scenario.";
            score = 10; // Auto-pass if no context
        }

        this.engine.addScore(score);
        feedbackBox.textContent = feedbackMessage;

        const qualityThreshold = 8;
        if (score >= qualityThreshold) {
            console.log(`(Contextual) Prompt evaluated. Score: ${score}. Advancing.`);
            feedbackMessage += " | Context used effectively! Advancing.";
            this.currentScenarioIdx++;
            if (this.currentScenarioIdx >= this.scenarios.length) {
                feedbackMessage = "Contextual Prompting Module Complete!";
                console.log("ContextualPromptingModule finished.");
                this.engine.moduleCompleted(this.constructor.name);
            }
        } else {
            feedbackMessage += " | Needs improvement. Try again!";
            console.log(`(Contextual) Prompt evaluated. Score: ${score}. Needs improvement.`);
        }
        feedbackBox.textContent = feedbackMessage;
    }

    reset() {
        console.log("Resetting ContextualPromptingModule...");
        this.currentScenarioIdx = 0;
        const feedbackBox = document.getElementById('feedback-box');
        if (feedbackBox) {
            feedbackBox.textContent = "Ready for the Contextual Prompting challenge!";
        }
    }
}
