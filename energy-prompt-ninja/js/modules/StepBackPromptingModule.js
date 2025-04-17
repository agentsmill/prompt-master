export class StepBackPromptingModule {
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
            const resp = await fetch("js/data/stepBackPromptingScenarios.json");
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            this.scenarios = await resp.json();
            this.loaded = true;
            this.resetStatusMessage();
        } catch (e) {
            console.error("Failed to load step-back prompting scenarios:", e);
            this.scenarios = [{
                id: "fallback_stepback_1",
                title: "Fallback Step-Back",
                description: "Propose solar tech. Step-back: Principles of solar energy?",
                step_back_question_hint: "Principles of solar energy?",
                specific_task: "Propose solar tech.",
                evaluation_keywords: ["solar", "photovoltaic", "efficiency", "principles"]
            }];
            this.loaded = true;
            this.currentScenarioIdx = 0;
            this.statusMessage = "Using fallback step-back scenario.";
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

        ctx.fillText("Step-Back Prompting Challenge:", 24, 48);
        ctx.fillStyle = "#44e0ff"; ctx.fillText(scenario.title, 24, 80);

        ctx.fillStyle = "#b0b8c1";
        ctx.fillText(scenario.description.substring(0, 50) + "...", 24, 112);

        ctx.fillStyle = "#7fff6a"; // Green hint
        ctx.fillText(`Hint: Consider Step-Back Question: ${scenario.step_back_question_hint}`, 24, 150);
        ctx.fillText(`Then address Specific Task: ${scenario.specific_task}`, 24, 170);


        ctx.fillStyle = "#fff";
        ctx.fillText("Prompt:", 24, 220);
        ctx.fillText("[Incorporate step-back thinking]", 24, 250);

        ctx.fillStyle = "#ffec70"; ctx.fillText(this.statusMessage, 24, 300);
        ctx.restore();
    }

    processPrompt(promptText) {
        if (!this.loaded || this.scenarios.length === 0) return;
        const scenario = this.scenarios[this.currentScenarioIdx];
        const promptLower = promptText.toLowerCase().trim();
        let score = 0;
        let feedback = [];

        console.log(`(Level 6) Processing step-back prompt for: ${scenario.id}`);

        // Evaluation 1: Does the prompt show evidence of considering the step-back idea?
        // Check for keywords related to principles, barriers, fundamentals, or the hint itself.
        const stepBackKeywords = ["principle", "barrier", "fundamental", "consider", "based on", "key aspect"];
        const hintWords = scenario.step_back_question_hint.toLowerCase().split(' ').slice(1, 3); // Check some hint words
        if (stepBackKeywords.some(word => promptLower.includes(word)) || hintWords.some(word => promptLower.includes(word))) {
            score += 5;
            feedback.push("Shows step-back thinking: ✔️");
        } else {
            feedback.push(`Incorporate the step-back idea (e.g., principles/barriers): ❌`);
        }

        // Evaluation 2: Does the prompt address the specific task using relevant keywords?
        let taskKeywordsMet = 0;
        scenario.evaluation_keywords.forEach(keyword => {
            if (promptLower.includes(keyword)) {
                taskKeywordsMet++;
            }
        });
        if (taskKeywordsMet >= 2) { // Check if at least 2 task-related keywords are present
            score += 5;
            feedback.push("Addresses specific task: ✔️");
        } else {
             feedback.push(`Address the specific task ('${scenario.specific_task}') using relevant terms: ❌`);
        }


        this.statusMessage = feedback.join(' | ');
        const qualityThreshold = 7; // Needs some evidence of step-back and task focus

        if (score > 0) this.engine.addScore(score);

        if (score >= qualityThreshold) {
            this.statusMessage += " | Step-back approach applied! Advancing.";
            this.currentScenarioIdx++;
            if (this.currentScenarioIdx >= this.scenarios.length) {
                console.log("StepBackPromptingModule finished.");
                this.engine.moduleCompleted("StepBackPromptingModule");
                return;
            } else {
                 this.resetStatusMessage();
            }
        } else {
            this.statusMessage += " | Prompt needs revision. Try again!";
        }
        console.log(`Prompt evaluated. Score: ${score}. Task Keywords Met: ${taskKeywordsMet}`);
    }

    reset() {
        console.log("Resetting StepBackPromptingModule...");
        this.currentScenarioIdx = 0;
        this.resetStatusMessage();
    }

     resetStatusMessage() {
        this.statusMessage = this.loaded ? "Ready for a step-back prompting challenge!" : "Loading...";
    }
}
