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
        
        // Use async/await here because evaluate might call the LLM service
        this.evaluate(userPrompt, this.currentScenario).then(evaluationResult => {
            if (evaluationResult.success) {
                const score = 10;
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
        }).catch(error => {
             console.error("(CoT) Evaluation Error:", error);
             this.ui.feedbackBox.textContent = `An error occurred during evaluation: ${error.message}`;
             this.ui.feedbackBox.className = 'feedback-box error';
        });
    }

    // Make evaluate async to handle potential API calls
    async evaluate(userPrompt, scenario) {
        if (!scenario || !scenario.evaluation_logic) return { success: false, feedback: "No evaluation criteria defined." };

        const promptLower = userPrompt.toLowerCase();
        const logic = scenario.evaluation_logic;

        // Specific Check for CoT: Look for step-by-step reasoning keywords
        const cotKeywords = ["step-by-step", "think step", "reasoning", "process", "first", "second", "then", "finally", "conclusion"];
        const hasCotKeywords = cotKeywords.some(kw => promptLower.includes(kw));

        if (!hasCotKeywords) {
            return { success: false, feedback: "Prompt should explicitly ask the LLM to show its reasoning step-by-step." };
        }

        // Check if core task keywords are present
        if (logic.keywords && logic.keywords.length > 0) {
            const missingKeywords = logic.keywords.filter(kw => !promptLower.includes(kw.toLowerCase()));
            if (missingKeywords.length > 0) {
                return { success: false, feedback: `Prompt is missing key concepts for the task: ${missingKeywords.join(', ')}.` };
            }
        }

        // --- LLM Evaluation Integration --- 
        if (logic.type === 'llm_evaluation') {
            console.log("(CoT Eval) Attempting LLM evaluation.");
            const apiKey = this.engine.getApiKey();

            if (!apiKey) {
                console.warn("(CoT Eval) LLM evaluation skipped: API Key not set in GameEngine.");
                // Fallback: Pass if structure looks okay, but warn user.
                return { success: true, feedback: "Prompt structure seems okay (asked for steps). LLM evaluation skipped: API Key needed for full check." }; 
                // Alternative fallback: return { success: false, feedback: "LLM evaluation skipped: API Key needed." };
            }

            try {
                // Use the criteria defined in the scenario JSON
                const criteria = logic.criteria || "Evaluate if the prompt effectively asks for step-by-step reasoning towards the task solution.";
                console.log("(CoT Eval) Calling LLMService with criteria:", criteria);
                
                // Call the LLM service via the engine
                const llmResult = await this.engine.llmService.evaluatePrompt(userPrompt, criteria, apiKey);
                
                console.log("(CoT Eval) LLM Service Result:", llmResult);
                return llmResult; // Return the { success: boolean, feedback: string } object directly
            
            } catch (error) {
                console.error("(CoT Eval) LLM Service call failed:", error);
                // Graceful fallback if API fails
                return { 
                    success: false, // Treat API error as failure for this attempt
                    feedback: `LLM evaluation couldn't be performed due to an error. Please check API key/connection or try again. (${error.message})` 
                };
            }
        }

        // If not llm_evaluation type, and keyword checks passed
        return { success: true, feedback: "Prompt correctly asks for step-by-step reasoning." };
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
