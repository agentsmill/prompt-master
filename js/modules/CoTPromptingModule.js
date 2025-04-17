export class CoTPromptingModule {
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
            const resp = await fetch("js/data/cotPromptingScenarios.json");
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            this.scenarios = await resp.json();
            this.loaded = true;
            this.resetStatusMessage();
        } catch (e) {
            console.error("Failed to load CoT prompting scenarios:", e);
            this.scenarios = [{
                id: "fallback_cot_1",
                title: "Fallback CoT Prompt",
                description: "Calculate 5 * 6 + 3. Use step-by-step thinking.",
                task_input: "5 * 6 + 3",
                required_instruction: "step by step",
                evaluation_keywords: ["step", "multiply", "add", "result"]
            }];
            this.loaded = true;
            this.currentScenarioIdx = 0;
            this.statusMessage = "Using fallback CoT scenario.";
        }
    }

    render(ctx) {
         ctx.save();
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillStyle = "#ffe066"; ctx.textAlign = "left";

        if (!this.loaded) { ctx.fillText("Loading...", 24, 48); ctx.restore(); return; }
        const scenario = this.scenarios[this.currentScenarioIdx];
        if (!scenario) { ctx.fillStyle = "#ff6b6b"; ctx.fillText("Error: Scenario not found.", 24, 48); ctx.restore(); return; }

        ctx.fillText("Chain of Thought Challenge:", 24, 48);
        ctx.fillStyle = "#44e0ff"; ctx.fillText(scenario.title, 24, 80);

        ctx.fillStyle = "#b0b8c1";
        ctx.fillText(scenario.description.substring(0, 50) + "...", 24, 112);

        ctx.fillStyle = "#7fff6a"; // Green required instruction
        ctx.fillText(`Required Instruction: Include '${scenario.required_instruction}'`, 24, 150);

        ctx.fillStyle = "#fff";
        ctx.fillText("Prompt:", 24, 200);
        ctx.fillText("[Instruct the AI to show its reasoning]", 24, 230);

        ctx.fillStyle = "#ffec70"; ctx.fillText(this.statusMessage, 24, 300);
        ctx.restore();
    }

    processPrompt(promptText) {
        if (!this.loaded || this.scenarios.length === 0) return;
        const scenario = this.scenarios[this.currentScenarioIdx];
        const promptLower = promptText.toLowerCase().trim();
        let score = 0;
        let feedback = [];

        console.log(`(Level 7) Processing CoT prompt for: ${scenario.id}`);

        // Evaluation 1: Does the prompt include the required CoT instruction?
        if (promptLower.includes(scenario.required_instruction.toLowerCase()) || promptLower.includes("step by step")) {
            score += 7;
            feedback.push("Includes CoT instruction: ✔️");
        } else {
            feedback.push(`Prompt should ask for step-by-step reasoning ('${scenario.required_instruction}'): ❌`);
        }

        // Evaluation 2: Does the prompt include keywords related to the task?
        let taskKeywordsMet = 0;
         scenario.evaluation_keywords.forEach(keyword => {
             if (promptLower.includes(keyword)) {
                 taskKeywordsMet++;
             }
         });
        if (taskKeywordsMet >= 2) {
             score += 3;
            feedback.push("Addresses specific task: ✔️");
        } else {
             feedback.push(`Address the specific task using relevant terms: ❌`);
        }

        this.statusMessage = feedback.join(' | ');
        const qualityThreshold = 7; // Must ask for CoT

        if (score > 0) this.engine.addScore(score);

        if (score >= qualityThreshold) {
            this.statusMessage += " | Reasoning requested! Advancing.";
            this.currentScenarioIdx++;
            if (this.currentScenarioIdx >= this.scenarios.length) {
                console.log("CoTPromptingModule finished.");
                this.engine.moduleCompleted("CoTPromptingModule");
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
        console.log("Resetting CoTPromptingModule...");
        this.currentScenarioIdx = 0;
        this.resetStatusMessage();
    }

     resetStatusMessage() {
        this.statusMessage = this.loaded ? "Ready for a Chain of Thought challenge!" : "Loading...";
    }
}
