/**
 * CoTPromptingModule
 * Teaches Chain of Thought (CoT) prompting.
 */
export class CoTPromptingModule {
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
        const scenarioFile = "js/data/cotPromptingScenarios.json";
        console.log(`CoTPromptingModule: Loading scenarios from ${scenarioFile}`);
        try {
            const resp = await fetch(scenarioFile);
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            this.scenarios = await resp.json();
            if (!Array.isArray(this.scenarios) || this.scenarios.length === 0) {
                throw new Error('Invalid scenario data format');
            }
            this.loaded = true;
            console.log("CoTPromptingModule scenarios loaded successfully.");
        } catch (e) {
            console.error(`Failed to load scenarios from ${scenarioFile}:`, e);
            if (this.ui.feedbackBox) this.ui.feedbackBox.textContent = `Error loading scenarios for CoT Prompting: ${e.message}`;
            this.loaded = false;
        }
    }

    startScenario(index = 0) {
        if (!this.loaded || index >= this.scenarios.length || index < 0) {
            console.error("Cannot start scenario: CoT module not loaded or index out of bounds.");
            if (this.ui.feedbackBox) this.ui.feedbackBox.textContent = "Error starting CoT scenario.";
            return;
        }
        this.currentScenarioIdx = index;
        this.currentScenario = this.scenarios[this.currentScenarioIdx];
        console.log(`Starting CoTPrompting scenario ${this.currentScenarioIdx}: ${this.currentScenario.id}`);
        this.render();
    }

    render() {
        if (!this.currentScenario || !this.ui.title) {
            console.error("Cannot render: No current CoT scenario or UI elements missing.");
             if(this.ui.feedbackBox) this.ui.feedbackBox.textContent = "Error rendering scenario details.";
            return;
        }

        // Clear previous state
        this.ui.promptInput.value = '';
        this.ui.feedbackBox.textContent = 'Instruct the model to think step-by-step.';
        this.ui.feedbackBox.className = 'feedback-box';

        // Populate UI elements
        this.ui.title.textContent = `Level ${this.currentScenario.level}: ${this.currentScenario.title || 'Chain of Thought Prompting'}`;
        this.ui.description.innerHTML = this.formatText(this.currentScenario.description || 'No description.');
        this.ui.task.innerHTML = `<strong>Your Task:</strong> ${this.formatText(this.currentScenario.task || 'No task defined.')}`;
        this.ui.promptInput.placeholder = this.currentScenario.prompt_template || 'Enter your prompt here...';
    }

    formatText(text) {
        return text.replace(/\n/g, '<br>');
    }

    handleSubmission(userPrompt) {
        if (!this.currentScenario || !this.loaded) {
            this.ui.feedbackBox.textContent = "Error: CoT module not ready or no scenario loaded.";
            this.ui.feedbackBox.className = 'feedback-box error';
            return;
        }

        console.log(`(CoT) Handling submission for scenario: ${this.currentScenario.id}`, userPrompt);
        const evaluationResult = this.evaluate(userPrompt, this.currentScenario);

        if (evaluationResult.success) {
            const score = 12; // Score reflecting complexity
            this.ui.feedbackBox.textContent = `${this.currentScenario.success_message} (+${score} energy)`;
            this.ui.feedbackBox.className = 'feedback-box success';
            console.log(`(CoT) Scenario ${this.currentScenario.id} PASSED.`);
            this.engine.completeScenario(this.constructor.name, score); // Notify engine
        } else {
            this.ui.feedbackBox.textContent = `Evaluation: ${evaluationResult.feedback} Try again!`;
            this.ui.feedbackBox.className = 'feedback-box error';
             if (this.currentScenario.hints && this.currentScenario.hints.length > 0) {
                 const hintToShow = this.currentScenario.hints[Math.floor(Math.random() * this.currentScenario.hints.length)];
                 this.ui.feedbackBox.textContent += ` Hint: ${hintToShow}`;
             }
            console.log(`(CoT) Scenario ${this.currentScenario.id} FAILED. Feedback: ${evaluationResult.feedback}`);
        }
    }

    evaluate(userPrompt, scenario) {
        if (!scenario || !scenario.evaluation_logic) return { success: false, feedback: "No evaluation criteria defined." };

        const promptLower = userPrompt.toLowerCase();
        const taskLower = scenario.task?.toLowerCase() || "";
        
        // Check 1: Does the prompt ask for step-by-step reasoning?
        const cotKeywords = ["step by step", "step-by-step", "show your reasoning", "explain the steps", "think step by step"];
        const includesCoTInstruction = cotKeywords.some(kw => promptLower.includes(kw));

        if (!includesCoTInstruction) {
            return { success: false, feedback: "Prompt should explicitly ask the model to reason step-by-step (e.g., 'think step by step')." };
        }

        // Check 2: Does the prompt include the core task elements?
        let includesTask = false;
        if (scenario.id === 'cot-1') { // Age problem
             if (promptLower.includes('3 years old') && promptLower.includes('3 times') && promptLower.includes('20 years old') && promptLower.includes('partner')) {
                 includesTask = true;
             }
        } else if (scenario.id === 'cot-2') { // Logic puzzle
             if (promptLower.includes('taller than b') && promptLower.includes('shorter than b') && promptLower.includes('tallest')) {
                 includesTask = true;
             }
        } else {
             includesTask = true; // Assume task included for unknown scenarios if CoT instruction is present
        }

        if (!includesTask) {
            return { success: false, feedback: "Prompt should include the details of the problem or puzzle to be solved." };
        }

        // Check 3: Placeholder for LLM evaluation (if defined)
        if (scenario.evaluation_logic.type === 'llm_evaluation') {
            console.warn("(CoT Eval) LLM evaluation specified but not implemented. Checking prompt structure only.");
            // Here, we would normally call an external service to evaluate the LLM's output 
            // generated from the userPrompt. Since we can't, we pass if structure is okay.
        }

        // If CoT instruction and task seem included
        return { success: true, feedback: "Chain of Thought instruction included in the prompt." };
    }

    reset() {
        console.log("Resetting CoTPromptingModule...");
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
