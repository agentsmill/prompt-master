export class ToTPromptingModule {
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
            const resp = await fetch("js/data/totScenarios.json");
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            this.scenarios = await resp.json();
            this.loaded = true;
            this.resetStatusMessage();
        } catch (e) {
            console.error("Failed to load ToT scenarios:", e);
             this.scenarios = [{
                id: "fallback_tot_1",
                title: "Fallback ToT",
                description: "Plan complex project X. Explain ToT.",
                task_input: "Plan complex project X.",
                concept_focus: "ToT explores multiple paths.",
                evaluation_keywords: ["plan", "project", "explore", "evaluate"]
            }];
            this.loaded = true; this.currentScenarioIdx = 0;
            this.statusMessage = "Using fallback ToT scenario.";
        }
    }

     render(ctx) {
         ctx.save();
         ctx.font = '16px "Press Start 2P", monospace';
         ctx.fillStyle = "#ffe066"; ctx.textAlign = "left";

         if (!this.loaded) { ctx.fillText("Loading...", 24, 48); ctx.restore(); return; }
         const scenario = this.scenarios[this.currentScenarioIdx];
         if (!scenario) { ctx.fillStyle = "#ff6b6b"; ctx.fillText("Error: Scenario not found.", 24, 48); ctx.restore(); return; }

         ctx.fillText("Tree of Thoughts Challenge:", 24, 48);
         ctx.fillStyle = "#44e0ff"; ctx.fillText(scenario.title, 24, 80);

         ctx.fillStyle = "#b0b8c1";
         ctx.fillText(scenario.description.substring(0, 50) + "...", 24, 112);
         ctx.fillStyle = "#7fff6a";
         ctx.fillText(`Concept: ${scenario.concept_focus}`, 24, 150);

         ctx.fillStyle = "#fff";
         ctx.fillText("Prompt:", 24, 200);
         ctx.fillText("[Ask AI to explore/evaluate options]", 24, 230);

         ctx.fillStyle = "#ffec70"; ctx.fillText(this.statusMessage, 24, 300);
         ctx.restore();
    }

     processPrompt(promptText) {
         if (!this.loaded || this.scenarios.length === 0) return;
         const scenario = this.scenarios[this.currentScenarioIdx];
         const promptLower = promptText.toLowerCase().trim();
         let score = 0;
         let feedback = [];

         console.log(`(Level 9) Processing ToT prompt for: ${scenario.id}`);

         // Evaluation 1: Does the prompt ask for exploration or evaluation of paths/strategies?
         const explorationWords = ["explore", "evaluate", "assess", "compare strategies", "consider options", "pathways", "directions"];
         if (explorationWords.some(word => promptLower.includes(word))) {
             score += 7;
             feedback.push("Asks for exploration/evaluation: ✔️");
         } else {
             feedback.push(`Prompt should ask to explore or evaluate options/paths: ❌`);
         }

         // Evaluation 2: Does it define the core complex task?
        let taskKeywordsMet = 0;
         scenario.evaluation_keywords.forEach(keyword => {
             if (promptLower.includes(keyword)) {
                 taskKeywordsMet++;
             }
         });
         if (taskKeywordsMet >= 3) {
            score += 3;
            feedback.push("Clearly defined complex task: ✔️");
         } else {
             feedback.push(`Clearly define the task ('${scenario.task_input}') using relevant terms: ❌`);
         }


         this.statusMessage = feedback.join(' | ');
         const qualityThreshold = 7; // Must ask for exploration

         if (score > 0) this.engine.addScore(score);

         if (score >= qualityThreshold) {
             this.statusMessage += ` | Exploration requested! ToT would analyze multiple branches here. Advancing.`;
             this.currentScenarioIdx++;
             if (this.currentScenarioIdx >= this.scenarios.length) {
                 console.log("ToTPromptingModule finished.");
                 this.engine.moduleCompleted("ToTPromptingModule");
                 return;
             } else {
                  this.resetStatusMessage();
             }
         } else {
             this.statusMessage += " | Prompt needs revision for this exploration task. Try again!";
         }
         console.log(`Prompt evaluated. Score: ${score}.`);
    }

     reset() {
         console.log("Resetting ToTPromptingModule...");
         this.currentScenarioIdx = 0;
         this.resetStatusMessage();
     }

     resetStatusMessage() {
        this.statusMessage = this.loaded ? "Ready for a Tree of Thoughts challenge!" : "Loading...";
    }
}
