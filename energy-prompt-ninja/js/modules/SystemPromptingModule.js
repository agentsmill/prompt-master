export class SystemPromptingModule {
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
            const resp = await fetch("js/data/systemPromptingScenarios.json");
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            this.scenarios = await resp.json();
            this.loaded = true;
            this.resetStatusMessage();
        } catch (e) {
            console.error("Failed to load system prompting scenarios:", e);
            this.scenarios = [{
                id: "fallback_system_1",
                title: "Fallback System Prompt",
                description: "Instruct AI to output JSON: { value: 100 } for input '100'.",
                task_input: "100",
                system_constraint: "output JSON: { value: 100 }"
            }];
            this.loaded = true;
            this.currentScenarioIdx = 0;
            this.statusMessage = "Using fallback system scenario.";
        }
    }

    render(ctx) {
        ctx.save();
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillStyle = "#ffe066"; // Yellow title
        ctx.textAlign = "left";

        if (!this.loaded) {
            ctx.fillText("Loading...", 24, 48);
            ctx.restore();
            return;
        }
        const scenario = this.scenarios[this.currentScenarioIdx];
        if (!scenario) {
            ctx.fillStyle = "#ff6b6b";
            ctx.fillText("Error: Scenario not found.", 24, 48);
            ctx.restore();
            return;
        }

        ctx.fillText("System Prompting Challenge:", 24, 48);
        ctx.fillStyle = "#44e0ff"; // Blue subtitle
        ctx.fillText(scenario.title, 24, 80);

        ctx.fillStyle = "#b0b8c1"; // Gray description
        // Simplified rendering
        ctx.fillText(scenario.description.substring(0, 50) + "...", 24, 112);

        ctx.fillStyle = "#7fff6a"; // Green required constraint
        ctx.fillText(`Required Constraint: ${scenario.system_constraint}`, 24, 150);

        ctx.fillStyle = "#fff"; // White prompt indicator
        ctx.fillText("Prompt:", 24, 200);
        ctx.fillText("[Type prompt below, include the constraint]", 24, 230);

        ctx.fillStyle = "#ffec70"; // Yellow status
        ctx.fillText(this.statusMessage, 24, 300);
        ctx.restore();
    }

    processPrompt(promptText) {
        if (!this.loaded || this.scenarios.length === 0) return;
        const scenario = this.scenarios[this.currentScenarioIdx];
        const promptLower = promptText.toLowerCase().trim();
        let score = 0;
        let feedback = [];

        console.log(`(Level 4) Processing system prompt for: ${scenario.id}`);

        // Evaluation 1: Does the prompt include keywords related to the system constraint?
        // This is a simplified check. Real evaluation might need more sophisticated parsing.
        let constraintMet = false;
        if (scenario.system_constraint.includes("JSON") && promptLower.includes("json")) {
             constraintMet = true;
        } else if (scenario.system_constraint.includes("formal") && promptLower.includes("formal")) {
             constraintMet = true;
        } else if (scenario.system_constraint.includes("safety") && (promptLower.includes("safety") || promptLower.includes("warning"))) {
             constraintMet = true;
        } else if (promptLower.includes(scenario.system_constraint.toLowerCase().substring(0,15))) { // Check if start of constraint is included
            constraintMet = true;
        }


        if (constraintMet) {
            score += 7;
            feedback.push("Includes system constraint instruction: ✔️");
        } else {
            feedback.push(`Prompt should include instruction for constraint ('${scenario.system_constraint}'): ❌`);
        }

        // Evaluation 2: Does the prompt address the core task? (Simple check)
         const taskWords = scenario.task_input.toLowerCase().split(' ').slice(0, 3);
         if (taskWords.every(word => promptLower.includes(word))) {
             score += 3;
             feedback.push("Addresses core task: ✔️");
         } else {
             feedback.push(`Address the specific task ('${scenario.task_input}'): ❌`);
         }


        this.statusMessage = feedback.join(' | ');
        const qualityThreshold = 7; // Needs to include the constraint instruction

        if (score > 0) this.engine.addScore(score);

        if (score >= qualityThreshold) {
            this.statusMessage += " | Constraint applied! Advancing.";
            this.currentScenarioIdx++;
            if (this.currentScenarioIdx >= this.scenarios.length) {
                console.log("SystemPromptingModule finished.");
                this.engine.moduleCompleted("SystemPromptingModule"); // Use the specific name
                return;
            } else {
                 this.resetStatusMessage(); // Prepare for next scenario
            }
        } else {
            this.statusMessage += " | Prompt needs revision. Try again!";
        }
        console.log(`Prompt evaluated. Score: ${score}.`);
    }

    reset() {
        console.log("Resetting SystemPromptingModule...");
        this.currentScenarioIdx = 0;
        this.resetStatusMessage();
    }

    resetStatusMessage() {
        this.statusMessage = this.loaded ? "Ready for a system prompting challenge!" : "Loading...";
    }
}
