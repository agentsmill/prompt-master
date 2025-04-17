export class RolePromptingModule {
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
            const resp = await fetch("js/data/rolePromptingScenarios.json");
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            this.scenarios = await resp.json();
            this.loaded = true;
            this.resetStatusMessage();
        } catch (e) {
            console.error("Failed to load role prompting scenarios:", e);
            // Add fallback scenario
            this.scenarios = [{
                id: "fallback_role_1",
                title: "Fallback Role Prompt",
                description: "Adopt the role 'Energy Expert' and explain solar power.",
                required_role: "Energy Expert",
                task_input: "Explain solar power."
            }];
            this.loaded = true;
            this.currentScenarioIdx = 0;
            this.statusMessage = "Using fallback role scenario.";
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

        ctx.fillText("Role Prompting Challenge:", 24, 48);
        ctx.fillStyle = "#44e0ff"; // Blue subtitle
        ctx.fillText(scenario.title, 24, 80);

        ctx.fillStyle = "#b0b8c1"; // Gray description
        // Simplified rendering without wrapText for brevity
        ctx.fillText(scenario.description.substring(0, 50) + "...", 24, 112); // Show part of desc

        ctx.fillStyle = "#7fff6a"; // Green required role
        ctx.fillText(`Required Role: ${scenario.required_role}`, 24, 150);

        ctx.fillStyle = "#fff"; // White prompt indicator
        ctx.fillText("Prompt:", 24, 200);
        ctx.fillText("[Type prompt below, starting with the role]", 24, 230);


        ctx.fillStyle = "#ffec70"; // Yellow status
        ctx.fillText(this.statusMessage, 24, 300);
        ctx.restore();
    }

    processPrompt(promptText) {
        if (!this.loaded || this.scenarios.length === 0) return;
        const scenario = this.scenarios[this.currentScenarioIdx];
        const promptLower = promptText.toLowerCase().trim();
        const requiredRoleLower = scenario.required_role.toLowerCase();
        let score = 0;
        let feedback = [];

        console.log(`(Level 3) Processing role prompt for: ${scenario.id}`);

        // Evaluation 1: Does the prompt start by declaring the role?
        // Allow variations like "Act as a...", "I am a...", "Role: ..." or just the role name.
        if (promptLower.startsWith(requiredRoleLower) ||
            promptLower.startsWith(`act as ${requiredRoleLower}`) ||
            promptLower.startsWith(`i am ${requiredRoleLower}`) ||
            promptLower.startsWith(`role: ${requiredRoleLower}`)
           ) {
            score += 7;
            feedback.push("Role adopted: ✔️");
        } else {
            feedback.push(`Start prompt with the role ('${scenario.required_role}'): ❌`);
        }

        // Evaluation 2: Does the prompt address the task input? (Simple check)
        const taskWords = scenario.task_input.toLowerCase().split(' ').slice(0, 3); // Check first few words
        if (taskWords.every(word => promptLower.includes(word))) {
            score += 3;
            feedback.push("Addresses task: ✔️");
        } else {
            feedback.push(`Address the specific task ('${scenario.task_input}'): ❌`);
        }

        this.statusMessage = feedback.join(' | ');
        const qualityThreshold = 7; // Needs to get the role correct at minimum

        if (score > 0) this.engine.addScore(score);

        if (score >= qualityThreshold) {
            this.statusMessage += " | Role effective! Advancing.";
            this.currentScenarioIdx++;
            if (this.currentScenarioIdx >= this.scenarios.length) {
                console.log("RolePromptingModule finished.");
                this.engine.moduleCompleted("RolePromptingModule"); // Use the specific name
                return;
            } else {
                 this.resetStatusMessage(); // Prepare for next scenario in this module
            }
        } else {
            this.statusMessage += " | Prompt needs revision. Try again!";
        }
        console.log(`Prompt evaluated. Score: ${score}.`);
    }

    reset() {
        console.log("Resetting RolePromptingModule...");
        this.currentScenarioIdx = 0;
        this.resetStatusMessage();
    }

    resetStatusMessage() {
        this.statusMessage = this.loaded ? "Ready for a role prompting challenge!" : "Loading...";
    }
}
