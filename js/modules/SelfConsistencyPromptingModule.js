/**
 * SelfConsistencyPromptingModule
 * Teaches self-consistency concepts (using CoT as the base).
 */
export class SelfConsistencyPromptingModule {
    constructor(engine) {
        this.engine = engine;
        this.scenarios = [];
        this.currentScenarioIdx = 0;
        this.currentScenario = null;
        this.loaded = false;
        this.ui = {
            title: document.getElementById('challenge-title'),
            description: document.getElementById('challenge-description'),
            task: document.getElementById('challenge-task'),
            promptInput: document.getElementById('prompt-input'),
            feedbackBox: document.getElementById('feedback-box')
        };
        this.init();
    }

    async init() {
        const scenarioFile = "js/data/selfConsistencyScenarios.json";
        console.log(`SelfConsistencyPromptingModule: Loading scenarios from ${scenarioFile}`);
        try {
            const resp = await fetch(scenarioFile);
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            this.scenarios = await resp.json();
            if (!Array.isArray(this.scenarios) || this.scenarios.length === 0) {
                throw new Error('Invalid scenario data format');
            }
            this.loaded = true;
            console.log("SelfConsistencyPromptingModule scenarios loaded successfully.");
        } catch (e) {
            console.error(`Failed to load scenarios from ${scenarioFile}:`, e);
            if (this.ui.feedbackBox) this.ui.feedbackBox.textContent = `Error loading scenarios for Self-Consistency: ${e.message}`;
            this.loaded = false;
        }
    }

    startScenario(index = 0) {
        if (!this.loaded || index >= this.scenarios.length || index < 0) {
            console.error("Cannot start scenario: Self-Consistency module not loaded or index out of bounds.");
            if (this.ui.feedbackBox) this.ui.feedbackBox.textContent = "Error starting Self-Consistency scenario.";
            return;
        }
        this.currentScenarioIdx = index;
        this.currentScenario = this.scenarios[this.currentScenarioIdx];
        console.log(`Starting SelfConsistency scenario ${this.currentScenarioIdx}: ${this.currentScenario.id}`);
        this.render();
    }

    render() {
        if (!this.currentScenario || !this.ui.title) {
            console.error("Cannot render: No current Self-Consistency scenario or UI elements missing.");
             if(this.ui.feedbackBox) this.ui.feedbackBox.textContent = "Error rendering scenario details.";
            return;
        }

        // Clear previous state
        this.ui.promptInput.value = '';
        this.ui.feedbackBox.textContent = 'Perform one CoT-style reasoning run for this task.';
        this.ui.feedbackBox.className = 'feedback-box';

        // Populate UI elements
        this.ui.title.textContent = `Level ${this.currentScenario.level}: ${this.currentScenario.title || 'Self-Consistency Prompting'}`;
        this.ui.description.innerHTML = this.formatText(this.currentScenario.description || 'No description.');
        this.ui.task.innerHTML = `<strong>Your Task:</strong> ${this.formatText(this.currentScenario.task || 'No task defined.')}`;
        this.ui.promptInput.placeholder = this.currentScenario.prompt_template || 'Enter your CoT prompt here...';
    }

    formatText(text) {
        // Basic formatter, escape HTML and replace newlines
        const escaped = text.replace(/&/g, "&amp;")
                           .replace(/</g, "&lt;")
                           .replace(/>/g, "&gt;")
                           .replace(/"/g, "&quot;")
                           .replace(/'/g, "&#039;");
        return escaped.replace(/\n/g, '<br>');
    }

    handleSubmission(userPrompt) {
        if (!this.currentScenario || !this.loaded) {
            this.ui.feedbackBox.textContent = "Error: Self-Consistency module not ready or no scenario loaded.";
            this.ui.feedbackBox.className = 'feedback-box error';
            return;
        }

        console.log(`(Self-Consistency) Handling submission for scenario: ${this.currentScenario.id}`, userPrompt);
        const evaluationResult = this.evaluate(userPrompt, this.currentScenario);

        if (evaluationResult.success) {
            const score = 12; // Same complexity as CoT base
            this.ui.feedbackBox.textContent = `${this.currentScenario.success_message} (+${score} energy)`;
            this.ui.feedbackBox.className = 'feedback-box success';
            console.log(`(Self-Consistency) Scenario ${this.currentScenario.id} PASSED.`);
            this.engine.completeScenario(this.constructor.name, score); // Notify engine
        } else {
            this.ui.feedbackBox.textContent = `Evaluation: ${evaluationResult.feedback} Try again!`;
            this.ui.feedbackBox.className = 'feedback-box error';
             if (this.currentScenario.hints && this.currentScenario.hints.length > 0) {
                 const hintToShow = this.currentScenario.hints[Math.floor(Math.random() * this.currentScenario.hints.length)];
                 this.ui.feedbackBox.textContent += ` Hint: ${hintToShow}`;
             }
            console.log(`(Self-Consistency) Scenario ${this.currentScenario.id} FAILED. Feedback: ${evaluationResult.feedback}`);
        }
    }

    evaluate(userPrompt, scenario) {
        // Evaluation is similar to CoT: check for CoT instruction + task inclusion
        if (!scenario || !scenario.evaluation_logic) return { success: false, feedback: "No evaluation criteria defined." };

        const promptLower = userPrompt.toLowerCase();
        const taskLower = scenario.task?.toLowerCase() || "";
        
        // Check 1: Does the prompt ask for step-by-step reasoning?
        const cotKeywords = ["step by step", "step-by-step", "show your reasoning", "explain the steps", "think step by step", "explain why"];
        const includesCoTInstruction = cotKeywords.some(kw => promptLower.includes(kw));

        if (!includesCoTInstruction) {
            return { success: false, feedback: "Prompt should use CoT instructions (e.g., 'think step-by-step') as the basis for self-consistency runs." };
        }

        // Check 2: Does the prompt include the core task elements (email classification)?
        let includesTask = false;
        if (scenario.id === 'self-consistency-1') { 
             if (promptLower.includes('classify') && promptLower.includes('email') && (promptLower.includes('important') || promptLower.includes('not important')) && promptLower.includes('hacker')) {
                 includesTask = true;
             }
        } else {
             includesTask = true; // Assume task included for unknown scenarios
        }

        if (!includesTask) {
            return { success: false, feedback: "Prompt should include the details of the email classification task." };
        }

        // Check 3: Placeholder for LLM evaluation (if defined)
        if (scenario.evaluation_logic.type === 'llm_evaluation') {
            console.warn("(Self-Consistency Eval) LLM evaluation specified but not implemented. Checking prompt structure only.");
        }

        // If CoT instruction and task seem included
        return { success: true, feedback: "CoT structure for self-consistency run seems correct." };
    }

    reset() {
        console.log("Resetting SelfConsistencyPromptingModule...");
        this.currentScenarioIdx = 0;
        this.currentScenario = null;
        if (this.ui.feedbackBox) {
            this.ui.feedbackBox.textContent = "";
            this.ui.feedbackBox.className = 'feedback-box';
        }
        if (this.ui.promptInput) {
            this.ui.promptInput.value = '';
        }
         if (this.ui.task) {
             this.ui.task.innerHTML = '';
         }
    }
}
