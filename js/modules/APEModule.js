/**
 * APEModule
 * Teaches Automatic Prompt Engineering (APE) concepts.
 */
export class APEModule {
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
        const scenarioFile = "js/data/apeScenarios.json";
        console.log(`APEModule: Loading scenarios from ${scenarioFile}`);
        try {
            const resp = await fetch(scenarioFile);
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            this.scenarios = await resp.json();
            if (!Array.isArray(this.scenarios) || this.scenarios.length === 0) {
                throw new Error('Invalid scenario data format');
            }
            this.loaded = true;
            console.log("APEModule scenarios loaded successfully.");
        } catch (e) {
            console.error(`Failed to load scenarios from ${scenarioFile}:`, e);
            if (this.ui.feedbackBox) this.ui.feedbackBox.textContent = `Error loading scenarios for APE Prompting: ${e.message}`;
            this.loaded = false;
        }
    }

    startScenario(index = 0) {
        if (!this.loaded || index >= this.scenarios.length || index < 0) {
            console.error("Cannot start scenario: APE module not loaded or index out of bounds.");
            if (this.ui.feedbackBox) this.ui.feedbackBox.textContent = "Error starting APE scenario.";
            return;
        }
        this.currentScenarioIdx = index;
        this.currentScenario = this.scenarios[this.currentScenarioIdx];
        console.log(`Starting APE scenario ${this.currentScenarioIdx}: ${this.currentScenario.id}`);
        this.render();
    }

    render() {
        if (!this.currentScenario || !this.ui.title) {
            console.error("Cannot render: No current APE scenario or UI elements missing.");
             if(this.ui.feedbackBox) this.ui.feedbackBox.textContent = "Error rendering scenario details.";
            return;
        }

        // Clear previous state
        this.ui.promptInput.value = '';
        this.ui.feedbackBox.textContent = 'Use the LLM to generate prompt variations.';
        this.ui.feedbackBox.className = 'feedback-box';

        // Populate UI elements
        this.ui.title.textContent = `Level ${this.currentScenario.level}: ${this.currentScenario.title || 'Automatic Prompt Engineering'}`;
        this.ui.description.innerHTML = this.formatText(this.currentScenario.description || 'No description.');
        this.ui.task.innerHTML = `<strong>Your Task:</strong> ${this.formatText(this.currentScenario.task || 'No task defined.')}`;
        this.ui.promptInput.placeholder = this.currentScenario.prompt_template || 'Enter your prompt asking for variations...';
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
            this.ui.feedbackBox.textContent = "Error: APE module not ready or no scenario loaded.";
            this.ui.feedbackBox.className = 'feedback-box error';
            return;
        }

        console.log(`(APE) Handling submission for scenario: ${this.currentScenario.id}`, userPrompt);
        const evaluationResult = this.evaluate(userPrompt, this.currentScenario);

        if (evaluationResult.success) {
            const score = 15; // Higher complexity
            this.ui.feedbackBox.textContent = `${this.currentScenario.success_message} (+${score} energy)`;
            this.ui.feedbackBox.className = 'feedback-box success';
            console.log(`(APE) Scenario ${this.currentScenario.id} PASSED.`);
            this.engine.completeScenario(this.constructor.name, score); // Notify engine
        } else {
            this.ui.feedbackBox.textContent = `Evaluation: ${evaluationResult.feedback} Try again!`;
            this.ui.feedbackBox.className = 'feedback-box error';
             if (this.currentScenario.hints && this.currentScenario.hints.length > 0) {
                 const hintToShow = this.currentScenario.hints[Math.floor(Math.random() * this.currentScenario.hints.length)];
                 this.ui.feedbackBox.textContent += ` Hint: ${hintToShow}`;
             }
            console.log(`(APE) Scenario ${this.currentScenario.id} FAILED. Feedback: ${evaluationResult.feedback}`);
        }
    }

    evaluate(userPrompt, scenario) {
        // Evaluate if the prompt asks for prompt variations for the given task
        if (!scenario || !scenario.evaluation_logic) return { success: false, feedback: "No evaluation criteria defined." };

        const promptLower = userPrompt.toLowerCase();
        const taskLower = scenario.task?.toLowerCase() || ""; // e.g., "generate 5 different ways... weather forecast..."
        
        // Check 1: Does the prompt ask for variations?
        const variationKeywords = ["variation", "generate", "different ways", "rephrase", "alternative prompts", "ways to ask"];
        // Check for number request (e.g., "5 ways")
        const asksForVariations = variationKeywords.some(kw => promptLower.includes(kw)) || /generate \d+/.test(promptLower);

        if (!asksForVariations) {
            return { success: false, feedback: "Prompt should ask the LLM to generate multiple variations or ways to phrase something (e.g., 'generate 5 variations...')." };
        }

        // Check 2: Does the prompt include the core original task/intent?
        let includesCoreTask = false;
        if (scenario.id === 'ape-1') { // Weather forecast variations
             if (promptLower.includes('weather') && promptLower.includes('london') && promptLower.includes('tomorrow')) {
                 includesCoreTask = true;
             }
        } else {
             includesCoreTask = true; // Assume task included for unknown scenarios
        }

        if (!includesCoreTask) {
            return { success: false, feedback: "Prompt should include the core intent you want variations for (e.g., 'weather for London tomorrow')." };
        }

        // Check 3: Placeholder for LLM evaluation
        if (scenario.evaluation_logic.type === 'llm_evaluation') {
            console.warn("(APE Eval) LLM evaluation specified but not implemented. Checking prompt structure only.");
        }

        // If prompt asks for variations and includes the core task
        return { success: true, feedback: "Prompt correctly structured for APE (generating variations)." };
    }

    reset() {
        console.log("Resetting APEModule...");
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