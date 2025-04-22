/**
 * RolePromptingModule
 * Teaches role prompting techniques.
 */
export class RolePromptingModule {
    constructor(engine) {
        this.engine = engine;
        this.ctx = engine.ctx;
        this.scenarios = [];
        this.currentScenarioIdx = 0;
        this.loaded = false;
        this.init();
    }

    async init() {
        const scenarioFile = "js/data/rolePromptingScenarios.json";
        console.log(`RolePromptingModule: Loading scenarios from ${scenarioFile}`);
        try {
            const resp = await fetch(scenarioFile);
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            this.scenarios = await resp.json();
            if (!Array.isArray(this.scenarios) || this.scenarios.length === 0) {
                console.error('Loaded scenarios are not a valid array or empty:', this.scenarios);
                throw new Error('Invalid scenario data format');
            }
            this.loaded = true;
            this.reset();
        } catch (e) {
            console.error(`Failed to load scenarios from ${scenarioFile}:`, e);
            // Add fallback scenario
            this.scenarios = [{ id: "fallback_role_1", title: "Fallback Role Prompt", description: "Define a role for the AI.", type:"role-prompting", domain:"Fallback" }];
            this.loaded = true;
            this.reset();
        }
    }

    update(delta) {}

    render(ctx) {
        ctx.save();
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillStyle = "#ffe066"; // Yellow
        ctx.textAlign = "left";

        if (!this.loaded || this.scenarios.length === 0) {
            ctx.fillText("Loading Role Scenarios...", 24, 48);
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

        ctx.fillText(`Role Prompting Challenge:`, 24, 48);
        ctx.fillStyle = "#44e0ff"; // Blue
        ctx.fillText(scenario.title || "Untitled Scenario", 24, 80);

        ctx.fillStyle = "#b0b8c1"; // Light gray
        const descriptionEndY = this.wrapText(ctx, scenario.description || "No description.", 24, 120, 432, 24);

        ctx.fillStyle = "#7fff6a"; // Green
        const promptLabelY = descriptionEndY + 30;
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
        if (!this.loaded || this.scenarios.length === 0) {
            if(feedbackBox) feedbackBox.textContent = "Error: Scenarios not loaded.";
            return;
        }
        const scenario = this.scenarios[this.currentScenarioIdx];
        if (!scenario) {
            if(feedbackBox) feedbackBox.textContent = "Error: Invalid scenario.";
            return;
        }

        console.log(`(Role Prompting) Processing prompt for challenge: ${scenario.id}`, promptText);
        let feedbackMessage = "Evaluating role prompt...";
        let score = 0;
        const promptLower = promptText.toLowerCase();

        // Basic Evaluation: Does it contain role assignment keywords?
        const roleKeywords = ["act as", "you are a", "role:", "persona:"];
        if (roleKeywords.some(kw => promptLower.includes(kw))) {
            score += 5;
            feedbackMessage = "Role assigned: ✔️";
        } else {
            feedbackMessage = "Prompt should assign a role (e.g., 'Act as a...'): ❌";
        }
        
        // Optional: Check if specific required role is mentioned
        if (scenario.required_role && promptLower.includes(scenario.required_role.toLowerCase())) {
            score += 5;
            feedbackMessage += " | Correct role mentioned: ✔️";
        } else if (scenario.required_role) {
            feedbackMessage += ` | Specific role '${scenario.required_role}' not clearly mentioned: Optional but good.`;
        }

        this.engine.addScore(score);
        if(feedbackBox) feedbackBox.textContent = feedbackMessage;

        // Progression Logic
        const qualityThreshold = 5; // Simple threshold for now
        if (score >= qualityThreshold) {
            console.log(`(Role Prompting) Prompt evaluated. Score: ${score}. Advancing.`);
            feedbackMessage += " | Good prompt! Advancing.";
            this.currentScenarioIdx++;
            if (this.currentScenarioIdx >= this.scenarios.length) {
                feedbackMessage = "Role Prompting Module Complete!";
                console.log("RolePromptingModule finished.");
                this.engine.moduleCompleted(this.constructor.name);
            }
        } else {
            feedbackMessage += " | Needs improvement. Try again!";
            console.log(`(Role Prompting) Prompt evaluated. Score: ${score}. Needs improvement.`);
        }
        if(feedbackBox) feedbackBox.textContent = feedbackMessage; // Update again with progression info
    }

    reset() {
        console.log("Resetting RolePromptingModule...");
        this.currentScenarioIdx = 0;
        const feedbackBox = document.getElementById('feedback-box');
        if (feedbackBox) {
            feedbackBox.textContent = "Ready for the Role Prompting challenge!";
        }
    }
}
