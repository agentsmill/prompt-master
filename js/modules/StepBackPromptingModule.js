/**
 * StepBackPromptingModule
 * Teaches step-back prompting techniques.
 */
export class StepBackPromptingModule {
    constructor(engine) {
        this.engine = engine;
        this.ctx = engine.ctx;
        this.scenarios = [];
        this.currentScenarioIdx = 0;
        this.loaded = false;
        this.currentStep = 1; // 1: Ask step-back, 2: Use context for specific task
        this.stepBackContext = ""; // Stores the user's step-back prompt output (simulated)
        this.init();
    }

    async init() {
        const scenarioFile = "js/data/stepBackPromptingScenarios.json";
        console.log(`StepBackPromptingModule: Loading scenarios from ${scenarioFile}`);
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
            this.scenarios = [{ id: "fallback_stepback_1", title: "Fallback StepBack", description: "First ask general question, then specific.", type:"step-back-prompting", domain:"Fallback", step_back_question_hint:"General Q", specific_task:"Specific Task" }];
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
            ctx.fillText("Loading Step-Back Scenarios...", 24, 48);
            ctx.restore();
            return;
        }
        const scenario = this.scenarios[this.currentScenarioIdx];
        if (!scenario) { ctx.fillStyle = "#ff6b6b"; ctx.fillText("Error: Invalid scenario index.", 24, 48); ctx.restore(); return; }

        ctx.fillText(`Step-Back Prompting:`, 24, 48);
        ctx.fillStyle = "#44e0ff";
        ctx.fillText(scenario.title || "Untitled", 24, 80);
        
        ctx.fillStyle = "#b0b8c1";
        let description = scenario.description || "No description.";
        let descriptionEndY = this.wrapText(ctx, description, 24, 120, 432, 24);

        let promptLabelY = descriptionEndY + 30;
        
        // Modify description and prompt label based on current step
        if (this.currentStep === 1) {
            ctx.fillStyle = "#7fff6a"; // Green hint
            this.wrapText(ctx, `Step 1: Ask a general question related to: '${scenario.step_back_question_hint}'`, 24, descriptionEndY + 15, 432, 18);
            ctx.fillStyle = "#fff";
        } else { // Step 2
            ctx.fillStyle = "#ffec70"; // Yellow context
            ctx.fillText(`Context (from Step 1):`, 24, descriptionEndY + 15);
            ctx.fillStyle = "#cccccc"; 
            const contextEndY = this.wrapText(ctx, this.stepBackContext || "[No context generated]", 24, descriptionEndY + 39, 432, 18);
            descriptionEndY = contextEndY; // Update end Y for prompt label
            
            ctx.fillStyle = "#7fff6a"; // Green hint
            this.wrapText(ctx, `Step 2: Use the context above to ask for the specific task: '${scenario.specific_task}'`, 24, descriptionEndY + 15, 432, 18);
            ctx.fillStyle = "#fff";
            promptLabelY = descriptionEndY + 15 + 40; // Adjust prompt label Y
        }

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
        console.log(`(Step-Back Step ${this.currentStep}) Processing prompt for challenge: ${scenario.id}`, promptText);
        let feedbackMessage = `Evaluating Step ${this.currentStep} prompt...`;
        let score = 0;
        const promptLower = promptText.toLowerCase();
        let advanceStep = false;

        if (this.currentStep === 1) {
            // Evaluate Step 1: Check if prompt asks a general question related to hint
            if (promptLower.includes("?") && (scenario.step_back_question_hint && promptLower.includes(scenario.step_back_question_hint.toLowerCase().split(' ')[0]))) { // Simple check
                score = 5;
                feedbackMessage = "Step 1: General question asked ✔️. Preparing Step 2.";
                this.stepBackContext = `Simulated Answer: Key principles include reliability, efficiency, and integration of renewables.`; // Simulate getting context
                advanceStep = true;
            } else {
                feedbackMessage = `Step 1: Ask a general question about '${scenario.step_back_question_hint}' ❌`;
            }
        } else { // Step 2
            // Evaluate Step 2: Check if prompt uses context and asks for specific task
            const contextKeywords = this.stepBackContext.toLowerCase().split(' ').filter(w=>w.length > 4).slice(0,3);
            const taskKeywords = scenario.specific_task.toLowerCase().split(' ').filter(w=>w.length > 3).slice(0,3);
            let contextUsed = contextKeywords.every(kw => promptLower.includes(kw));
            let taskAsked = taskKeywords.every(kw => promptLower.includes(kw));
            
            if (contextUsed && taskAsked) {
                score = 10;
                feedbackMessage = "Step 2: Context used and task asked ✔️. Advancing to next challenge!";
                advanceStep = true;
            } else {
                feedbackMessage = "Step 2: Ensure prompt uses context from Step 1 and asks for the specific task ❌";
                if (!contextUsed) feedbackMessage += " (Context missing)";
                if (!taskAsked) feedbackMessage += " (Specific task missing)";
            }
        }

        this.engine.addScore(score);
        feedbackBox.textContent = feedbackMessage;

        const qualityThreshold = (this.currentStep === 1) ? 5 : 8; // Threshold per step
        if (score >= qualityThreshold && advanceStep) {
            if (this.currentStep === 1) {
                this.currentStep = 2;
                feedbackMessage += " | Proceeding to Step 2.";
                console.log(`(Step-Back) Advancing to Step 2.`);
            } else { // Completed Step 2
                this.currentStep = 1; // Reset for next scenario
                this.stepBackContext = ""; 
                this.currentScenarioIdx++;
                if (this.currentScenarioIdx >= this.scenarios.length) {
                    feedbackMessage = "Step-Back Prompting Module Complete!";
                    console.log("StepBackPromptingModule finished.");
                    this.engine.moduleCompleted(this.constructor.name);
                } else {
                   feedbackMessage += " | Advancing to next Step-Back challenge.";
                   console.log(`(Step-Back) Advancing to next challenge.`);
                }
            }
        } else {
            feedbackMessage += " | Needs improvement. Try again!";
             console.log(`(Step-Back Step ${this.currentStep}) Prompt evaluated. Score: ${score}. Needs improvement.`);
        }
         feedbackBox.textContent = feedbackMessage;
    }

    reset() {
        console.log("Resetting StepBackPromptingModule...");
        this.currentScenarioIdx = 0;
        this.currentStep = 1;
        this.stepBackContext = "";
        const feedbackBox = document.getElementById('feedback-box');
        if (feedbackBox) {
            feedbackBox.textContent = "Ready for the Step-Back Prompting challenge (Step 1)! ";
        }
    }
}
