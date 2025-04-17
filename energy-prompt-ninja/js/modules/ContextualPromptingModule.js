export class ContextualPromptingModule {
    constructor(engine) {
        this.engine = engine;
        this.scenarios = [];
        this.currentScenarioIdx = 0;
        this.loaded = false;
        this.statusMessage = "";
        this.init();
    }

    async init() {
        try {
            const resp = await fetch("js/data/contextualPromptingScenarios.json");
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            this.scenarios = await resp.json();
            this.loaded = true;
            this.resetStatusMessage();
        } catch (e) {
            console.error("Failed to load contextual prompting scenarios:", e);
            this.scenarios = [{
                id: "fallback_context_1",
                title: "Fallback Context Prompt",
                description: "Explain geothermal energy. Context: Focus on residential use.",
                context: "Focus on residential use.",
                task_input: "Explain geothermal energy."
            }];
            this.loaded = true;
            this.currentScenarioIdx = 0;
            this.statusMessage = "Using fallback contextual scenario.";
        }
    }

    render(ctx) {
        ctx.save();
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillStyle = "#ffe066"; // Yellow title
        ctx.textAlign = "left";

        if (!this.loaded) { ctx.fillText("Loading...", 24, 48); ctx.restore(); return; }
        const scenario = this.scenarios[this.currentScenarioIdx];
        if (!scenario) { ctx.fillStyle = "#ff6b6b"; ctx.fillText("Error: Scenario not found.", 24, 48); ctx.restore(); return; }

        ctx.fillText("Contextual Prompting Challenge:", 24, 48);
        ctx.fillStyle = "#44e0ff"; ctx.fillText(scenario.title, 24, 80);

        ctx.fillStyle = "#b0b8c1";
        ctx.fillText(scenario.description.substring(0, 50) + "...", 24, 112);

        ctx.fillStyle = "#7fff6a"; // Green required context
        ctx.fillText(`Required Context: ${scenario.context}`, 24, 150);

        ctx.fillStyle = "#fff";
        ctx.fillText("Prompt:", 24, 200);
        ctx.fillText("[Type prompt below, include the context]", 24, 230);

        ctx.fillStyle = "#ffec70"; ctx.fillText(this.statusMessage, 24, 300);
        ctx.restore();
    }

    processPrompt(promptText) {
        if (!this.loaded || this.scenarios.length === 0) return;
        const scenario = this.scenarios[this.currentScenarioIdx];
        const promptLower = promptText.toLowerCase().trim();
        let score = 0;
        let feedback = [];

        console.log(`(Level 5) Processing contextual prompt for: ${scenario.id}`);

        // Evaluation 1: Does the prompt include the core context? (Simplified check)
        // Check for a significant portion of the context string
        const contextCore = scenario.context.toLowerCase().substring(0, 25); // Check first 25 chars
        if (promptLower.includes(contextCore) || promptLower.includes("context:")) {
            score += 7;
            feedback.push("Includes context: ✔️");
        } else {
            feedback.push(`Prompt should include the context ('${scenario.context}'): ❌`);
        }

        // Evaluation 2: Does the prompt address the core task?
        const taskWords = scenario.task_input.toLowerCase().split(' ').slice(0, 3);
        if (taskWords.every(word => promptLower.includes(word))) {
            score += 3;
            feedback.push("Addresses core task: ✔️");
        } else {
            feedback.push(`Address the specific task ('${scenario.task_input}'): ❌`);
        }


        this.statusMessage = feedback.join(' | ');
        const qualityThreshold = 7; // Needs context included

        if (score > 0) this.engine.addScore(score);

        if (score >= qualityThreshold) {
            this.statusMessage += " | Context applied! Advancing.";
            this.currentScenarioIdx++;
            if (this.currentScenarioIdx >= this.scenarios.length) {
                console.log("ContextualPromptingModule finished.");
                this.engine.moduleCompleted("ContextualPromptingModule");
                return;
            } else {
                this.resetStatusMessage();
            }
        } else {
            this.statusMessage += " | Prompt needs revision. Try again!";
        }
        console.log(`Prompt evaluated. Score: ${score}.`);
    }

    reset() {
        console.log("Resetting ContextualPromptingModule...");
        this.currentScenarioIdx = 0;
        this.resetStatusMessage();
    }

     resetStatusMessage() {
         this.statusMessage = this.loaded ? "Ready for a contextual prompting challenge!" : "Loading...";
     }
}
