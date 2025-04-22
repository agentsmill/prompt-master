/**
 * ToTPromptingModule
 * Teaches Tree of Thoughts (ToT) prompting concepts.
 */
export class ToTPromptingModule {
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
        const scenarioFile = "js/data/totScenarios.json";
        console.log(`ToTPromptingModule: Loading scenarios from ${scenarioFile}`);
        try {
            const resp = await fetch(scenarioFile);
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            this.scenarios = await resp.json();
            if (!Array.isArray(this.scenarios) || this.scenarios.length === 0) {
                throw new Error('Invalid scenario data format');
            }
            this.loaded = true;
            console.log("ToTPromptingModule scenarios loaded successfully.");
        } catch (e) {
            console.error(`Failed to load scenarios from ${scenarioFile}:`, e);
            if (this.ui.feedbackBox) this.ui.feedbackBox.textContent = `Error loading scenarios for ToT Prompting: ${e.message}`;
            this.loaded = false;
        }
    }

    startScenario(index = 0) {
        if (!this.loaded || index >= this.scenarios.length || index < 0) {
            console.error("Cannot start scenario: ToT module not loaded or index out of bounds.");
            if (this.ui.feedbackBox) this.ui.feedbackBox.textContent = "Error starting ToT scenario.";
            return;
        }
        this.currentScenarioIdx = index;
        this.currentScenario = this.scenarios[this.currentScenarioIdx];
        console.log(`Starting ToTPrompting scenario ${this.currentScenarioIdx}: ${this.currentScenario.id}`);
        this.render();
    }

    render() {
        if (!this.currentScenario || !this.ui.title) {
            console.error("Cannot render: No current ToT scenario or UI elements missing.");
             if(this.ui.feedbackBox) this.ui.feedbackBox.textContent = "Error rendering scenario details.";
            return;
        }

        // Clear previous state
        this.ui.promptInput.value = '';
        this.ui.feedbackBox.textContent = 'Outline multiple potential options or paths.';
        this.ui.feedbackBox.className = 'feedback-box';

        // Populate UI elements
        this.ui.title.textContent = `Level ${this.currentScenario.level}: ${this.currentScenario.title || 'Tree of Thoughts Prompting'}`;
        this.ui.description.innerHTML = this.formatText(this.currentScenario.description || 'No description.');
        this.ui.task.innerHTML = `<strong>Your Task:</strong> ${this.formatText(this.currentScenario.task || 'No task defined.')}`;
        this.ui.promptInput.placeholder = this.currentScenario.prompt_template || 'Enter your prompt asking for options/branches...';
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
            this.ui.feedbackBox.textContent = "Error: ToT module not ready or no scenario loaded.";
            this.ui.feedbackBox.className = 'feedback-box error';
            return;
        }

        console.log(`(ToT) Handling submission for scenario: ${this.currentScenario.id}`, userPrompt);
        const evaluationResult = this.evaluate(userPrompt, this.currentScenario);

        if (evaluationResult.success) {
            const score = 15; // Higher complexity
            this.ui.feedbackBox.textContent = `${this.currentScenario.success_message} (+${score} energy)`;
            this.ui.feedbackBox.className = 'feedback-box success';
            console.log(`(ToT) Scenario ${this.currentScenario.id} PASSED.`);
            this.engine.completeScenario(this.constructor.name, score); // Notify engine
        } else {
            this.ui.feedbackBox.textContent = `Evaluation: ${evaluationResult.feedback} Try again!`;
            this.ui.feedbackBox.className = 'feedback-box error';
             if (this.currentScenario.hints && this.currentScenario.hints.length > 0) {
                 const hintToShow = this.currentScenario.hints[Math.floor(Math.random() * this.currentScenario.hints.length)];
                 this.ui.feedbackBox.textContent += ` Hint: ${hintToShow}`;
             }
            console.log(`(ToT) Scenario ${this.currentScenario.id} FAILED. Feedback: ${evaluationResult.feedback}`);
        }
    }

    evaluate(userPrompt, scenario) {
        // Evaluate if the prompt asks for multiple distinct options/paths for the given task
        if (!scenario || !scenario.evaluation_logic) return { success: false, feedback: "No evaluation criteria defined." };

        const promptLower = userPrompt.toLowerCase();
        const taskLower = scenario.task?.toLowerCase() || "";
        
        // Check 1: Does the prompt ask for options/paths/branches?
        const optionKeywords = ["options", "paths", "branches", "ways", "different approaches", "strategies", "outline", "explore", "several", "multiple", "2-3"];
        const asksForOptions = optionKeywords.some(kw => promptLower.includes(kw));

        if (!asksForOptions) {
            return { success: false, feedback: "Prompt should ask for multiple options, paths, or branches (e.g., 'outline 3 options...')." };
        }

        // Check 2: Does the prompt include the core task?
        let includesTask = false;
        if (scenario.id === 'tot-1') { // Trip planning
             if (promptLower.includes('trip') && promptLower.includes('london') && promptLower.includes('first day')) {
                 includesTask = true;
             }
        } else {
             includesTask = true; // Assume task included for unknown scenarios
        }

        if (!includesTask) {
            return { success: false, feedback: "Prompt should clearly state the core problem or task (e.g., 'planning a trip to London')." };
        }

        // Check 3: Placeholder for LLM evaluation
        if (scenario.evaluation_logic.type === 'llm_evaluation') {
            console.warn("(ToT Eval) LLM evaluation specified but not implemented. Checking prompt structure only.");
        }

        // If prompt asks for options and includes the task
        return { success: true, feedback: "Prompt correctly structured for exploring options (ToT)." };
    }

    reset() {
        console.log("Resetting ToTPromptingModule...");
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
