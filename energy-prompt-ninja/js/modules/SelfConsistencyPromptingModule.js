export class SelfConsistencyPromptingModule {
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
            const resp = await fetch("js/data/selfConsistencyScenarios.json");
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            this.scenarios = await resp.json();
            this.loaded = true;
            this.resetStatusMessage();
        } catch (e) {
            console.error("Failed to load Self-Consistency scenarios:", e);
            this.scenarios = [{
                id: "fallback_selfcons_1",
                title: "Fallback Self-Consistency",
                description: "Analyze impact of policy X. Explain Self-Consistency.",
                task_input: "Analyze impact of policy X.",
                 concept_focus: "Self-Consistency uses multiple paths.",
                 evaluation_keywords: ["analyze", "impact", "policy"]
            }];
            this.loaded = true; this.currentScenarioIdx = 0;
            this.statusMessage = "Using fallback Self-Consistency scenario.";
        }
    }

     render(ctx) {
         ctx.save();
         ctx.font = '16px "Press Start 2P", monospace';
         ctx.fillStyle = "#ffe066"; ctx.textAlign = "left";

         if (!this.loaded) { ctx.fillText("Loading...", 24, 48); ctx.restore(); return; }
         const scenario = this.scenarios[this.currentScenarioIdx];
         if (!scenario) { ctx.fillStyle = "#ff6b6b"; ctx.fillText("Error: Scenario not found.", 24, 48); ctx.restore(); return; }

         ctx.fillText("Self-Consistency Challenge:", 24, 48);
         ctx.fillStyle = "#44e0ff"; ctx.fillText(scenario.title, 24, 80);

         ctx.fillStyle = "#b0b8c1"; // Gray description
         // Simplified rendering
         ctx.fillText(scenario.description.substring(0, 50) + "...", 24, 112);
         ctx.fillStyle = "#7fff6a"; // Green concept focus
         ctx.fillText(`Concept: ${scenario.concept_focus}`, 24, 150);


         ctx.fillStyle = "#fff";
         ctx.fillText("Prompt:", 24, 200);
         ctx.fillText("[Define the complex question clearly]", 24, 230);

         ctx.fillStyle = "#ffec70"; ctx.fillText(this.statusMessage, 24, 300);
         ctx.restore();
    }

     processPrompt(promptText) {
        if (!this.loaded || this.scenarios.length === 0) return;
        const scenario = this.scenarios[this.currentScenarioIdx];
        const promptLower = promptText.toLowerCase().trim();
        let score = 0;
        let feedback = [];

        console.log(`(Level 8) Processing Self-Consistency prompt for: ${scenario.id}`);

        // Evaluation 1: Does the prompt clearly state the complex question/task?
        let taskKeywordsMet = 0;
        scenario.evaluation_keywords.forEach(keyword => {
             if (promptLower.includes(keyword)) {
                 taskKeywordsMet++;
             }
         });
         if (taskKeywordsMet >= 3) { // Needs reasonable amount of keywords for complex task
             score += 7;
             feedback.push("Clearly defined complex task: ✔️");
         } else {
             feedback.push(`Clearly define the task ('${scenario.task_input}') using relevant terms: ❌`);
         }

        // Evaluation 2: Does it hint at robustness or multiple possibilities? (Optional bonus)
        const robustnessWords = ["likely", "probable", "consider scenarios", "most common", "robust", "analyze impact"];
        if (robustnessWords.some(word => promptLower.includes(word))) {
            score += 3;
            feedback.push("Hints at robustness/multiple outcomes: ✔️");
        } else {
             feedback.push("Consider phrasing for robustness (e.g., 'likely impact', 'probable outcome'): Optional");
        }

        this.statusMessage = feedback.join(' | ');
        const qualityThreshold = 7; // Must define task clearly

        if (score > 0) this.engine.addScore(score);

        if (score >= qualityThreshold) {
            this.statusMessage += ` | Good prompt definition! Self-Consistency would generate & compare multiple CoTs here. Advancing.`;
            this.currentScenarioIdx++;
            if (this.currentScenarioIdx >= this.scenarios.length) {
                console.log("SelfConsistencyPromptingModule finished.");
                this.engine.moduleCompleted("SelfConsistencyPromptingModule");
                return;
            } else {
                 this.resetStatusMessage();
            }
        } else {
            this.statusMessage += " | Prompt needs more clarity for this complex task. Try again!";
        }
        console.log(`Prompt evaluated. Score: ${score}.`);
    }

     reset() {
        console.log("Resetting SelfConsistencyPromptingModule...");
        this.currentScenarioIdx = 0;
        this.resetStatusMessage();
    }

     resetStatusMessage() {
         this.statusMessage = this.loaded ? "Ready for a Self-Consistency challenge!" : "Loading...";
    }
}
