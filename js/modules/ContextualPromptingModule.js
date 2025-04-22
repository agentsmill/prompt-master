/**
 * ContextualPromptingModule
 * Teaches contextual prompting techniques.
 */
export class ContextualPromptingModule {
    constructor(engine) {
        this.engine = engine;
        // this.ctx = engine.ctx; // Remove if not drawing on canvas
        this.scenarios = [];
        this.currentScenarioIdx = 0;
        this.currentScenario = null;
        this.loaded = false;
        this.ui = {
            title: document.getElementById('challenge-title'),
            description: document.getElementById('challenge-description'),
            task: document.getElementById('challenge-task'),
            promptInput: document.getElementById('prompt-input'),
            feedbackBox: document.getElementById('feedback-box'),
            // Add a dedicated area for context if needed in HTML, or combine with description/task
            contextArea: document.getElementById('challenge-context-area') // Example ID, needs corresponding HTML element
        };
        this.init();
    }

    async init() {
        const scenarioFile = "js/data/contextualPromptingScenarios.json";
        console.log(`ContextualPromptingModule: Loading scenarios from ${scenarioFile}`);
        try {
            const resp = await fetch(scenarioFile);
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            this.scenarios = await resp.json();
            if (!Array.isArray(this.scenarios) || this.scenarios.length === 0) {
                throw new Error('Invalid scenario data format');
            }
            this.loaded = true;
            console.log("ContextualPromptingModule scenarios loaded successfully.");
            // GameEngine calls startScenario
        } catch (e) {
            console.error(`Failed to load scenarios from ${scenarioFile}:`, e);
            if (this.ui.feedbackBox) this.ui.feedbackBox.textContent = `Error loading scenarios for Contextual Prompting: ${e.message}`;
            this.loaded = false;
        }
    }

    startScenario(index = 0) {
        if (!this.loaded || index >= this.scenarios.length || index < 0) {
            console.error("Cannot start scenario: Contextual module not loaded or index out of bounds.");
            if (this.ui.feedbackBox) this.ui.feedbackBox.textContent = "Error starting scenario.";
            return;
        }
        this.currentScenarioIdx = index;
        this.currentScenario = this.scenarios[this.currentScenarioIdx];
        console.log(`Starting ContextualPrompting scenario ${this.currentScenarioIdx}: ${this.currentScenario.id}`);
        this.render();
    }

    // Replaces canvas rendering with HTML updates
    render() {
        if (!this.currentScenario || !this.ui.title) {
            console.error("Cannot render: No current contextual scenario or UI elements missing.");
            if (this.ui.feedbackBox) this.ui.feedbackBox.textContent = "Error rendering scenario details.";
            return;
        }

        // Clear previous state
        this.ui.promptInput.value = '';
        this.ui.feedbackBox.textContent = 'Incorporate the provided context into your prompt.';
        this.ui.feedbackBox.className = 'feedback-box'; // Reset style
        if (this.ui.contextArea) this.ui.contextArea.innerHTML = ''; // Clear context area

        // Populate UI elements
        this.ui.title.textContent = `Level ${this.currentScenario.level}: ${this.currentScenario.title || 'Contextual Prompting Challenge'}`;
        this.ui.description.innerHTML = this.formatText(this.currentScenario.description || 'No description.');
        
        // Display Context and Task - requires parsing the task string
        const taskParts = this.parseTaskAndContext(this.currentScenario.task);
        if (taskParts.context) {
            // Display context separately if element exists, otherwise prepend to task
            if (this.ui.contextArea) {
                 this.ui.contextArea.innerHTML = `<strong>Context:</strong><br>${this.formatText(taskParts.context)}`;
                 this.ui.task.innerHTML = `<strong>Your Task:</strong> ${this.formatText(taskParts.mainTask || 'No task defined.')}`;
            } else {
                 this.ui.task.innerHTML = `<strong>Context:</strong><br>${this.formatText(taskParts.context)}<br><br><strong>Your Task:</strong> ${this.formatText(taskParts.mainTask || 'No task defined.')}`;
            }
        } else {
             this.ui.task.innerHTML = `<strong>Your Task:</strong> ${this.formatText(taskParts.mainTask || 'No task defined.')}`;
        }
        
        this.ui.promptInput.placeholder = this.currentScenario.prompt_template || 'Enter your prompt here...';
    }
    
    // Helper to extract context and main task if formatted like in JSON
    parseTaskAndContext(taskString) {
        const contextMarker = "Context:";
        const questionMarker = "Question:"; // Or other markers like "Your Task:"
        let context = null;
        let mainTask = taskString;

        const contextIndex = taskString.indexOf(contextMarker);
        let taskStartIndex = -1;
        
        if (taskString.includes(questionMarker)) {
             taskStartIndex = taskString.indexOf(questionMarker);
        } else if (taskString.includes("Your Task:")) {
             taskStartIndex = taskString.indexOf("Your Task:");
        }

        if (contextIndex !== -1) {
            if (taskStartIndex > contextIndex) {
                context = taskString.substring(contextIndex + contextMarker.length, taskStartIndex).trim();
                mainTask = taskString.substring(taskStartIndex).trim(); // Keep the marker (Question/Your Task)
            } else {
                // Context found, but no clear task marker after it
                context = taskString.substring(contextIndex + contextMarker.length).trim();
                 // Try to infer task if possible, otherwise mainTask remains the original minus context?
                 // This part might need better logic depending on JSON format consistency.
                 mainTask = "(See description for full task)"; // Placeholder if task isn't clearly separable
            }
        }
        
        // Clean up markers in mainTask if they were included
        if (mainTask.startsWith(questionMarker)) mainTask = mainTask.substring(questionMarker.length).trim();
        if (mainTask.startsWith("Your Task:")) mainTask = mainTask.substring("Your Task:".length).trim();

        return { context, mainTask };
    }

    formatText(text) {
        return text.replace(/\n/g, '<br>');
    }

    handleSubmission(userPrompt) {
        if (!this.currentScenario || !this.loaded) {
            this.ui.feedbackBox.textContent = "Error: Contextual module not ready or no scenario loaded.";
            this.ui.feedbackBox.className = 'feedback-box error';
            return;
        }

        console.log(`(Contextual) Handling submission for scenario: ${this.currentScenario.id}`, userPrompt);
        const evaluationResult = this.evaluate(userPrompt, this.currentScenario);

        if (evaluationResult.success) {
            const score = 10; // Simple scoring
            this.ui.feedbackBox.textContent = `${this.currentScenario.success_message} (+${score} energy)`;
            this.ui.feedbackBox.className = 'feedback-box success';
            console.log(`(Contextual) Scenario ${this.currentScenario.id} PASSED.`);
            this.engine.completeScenario(this.constructor.name, score); // Notify engine
        } else {
            this.ui.feedbackBox.textContent = `Evaluation: ${evaluationResult.feedback} Try again!`;
            this.ui.feedbackBox.className = 'feedback-box error';
             // Show hint on failure
             if (this.currentScenario.hints && this.currentScenario.hints.length > 0) {
                 const hintToShow = this.currentScenario.hints[Math.floor(Math.random() * this.currentScenario.hints.length)];
                 this.ui.feedbackBox.textContent += ` Hint: ${hintToShow}`;
             }
            console.log(`(Contextual) Scenario ${this.currentScenario.id} FAILED. Feedback: ${evaluationResult.feedback}`);
        }
    }

    evaluate(userPrompt, scenario) {
        if (!scenario || !scenario.evaluation_logic) return { success: false, feedback: "No evaluation criteria defined." };

        const promptLower = userPrompt.toLowerCase();
        const taskParts = this.parseTaskAndContext(scenario.task);
        const context = taskParts.context;
        const mainTaskInstruction = taskParts.mainTask;
        
        // Check 1: Does the prompt include *some significant part* of the context?
        let contextIncluded = false;
        if (context) {
             // Simple check: check for a few non-trivial words from the context
             const contextWords = context.toLowerCase().split(' ').filter(w => w.length > 3);
             const significantContextWords = contextWords.slice(0, Math.min(contextWords.length, 5)); // Check first few significant words
             if (significantContextWords.length > 0 && significantContextWords.every(kw => promptLower.includes(kw))) {
                 contextIncluded = true;
             }
             // Alternative: Check if a substantial substring is present
             if (!contextIncluded && context.length > 20) {
                 if (promptLower.includes(context.toLowerCase().substring(0, 20))) { // Check start of context
                     contextIncluded = true;
                 }
             }
        } else {
            contextIncluded = true; // No context required for this scenario
        }

        if (!contextIncluded) {
            return { success: false, feedback: "Prompt needs to include or reference the provided context." };
        }

        // Check 2: Does the prompt include the essence of the main task/question?
        let taskIncluded = false;
        if (mainTaskInstruction) {
             const taskWords = mainTaskInstruction.toLowerCase().split(' ').filter(w => w.length > 3);
             const significantTaskWords = taskWords.slice(0, Math.min(taskWords.length, 5)); // Check first few significant words
             if (significantTaskWords.length > 0 && significantTaskWords.every(kw => promptLower.includes(kw))) {
                 taskIncluded = true;
             }
             // Alternative/Simpler check for specific scenarios:
             if (!taskIncluded) {
                 if (scenario.id === 'contextual-prompt-1' && (promptLower.includes('consequences') || promptLower.includes('results'))) {
                     taskIncluded = true;
                 } else if (scenario.id === 'contextual-prompt-2' && (promptLower.includes('follow-up') || promptLower.includes('report status') || promptLower.includes('asking about'))) {
                     taskIncluded = true;
                 }
             }
        } else {
            taskIncluded = true; // No specific task defined?
        }
        
        if (!taskIncluded) {
             return { success: false, feedback: "Prompt should clearly state the main question or task." };
        }

        // If both context and task seem included
        return { success: true, feedback: "Context and task seem correctly included in the prompt." };
    }

    reset() {
        console.log("Resetting ContextualPromptingModule...");
        this.currentScenarioIdx = 0;
        this.currentScenario = null;
        if (this.ui.feedbackBox) {
            this.ui.feedbackBox.textContent = "";
            this.ui.feedbackBox.className = 'feedback-box';
        }
        if (this.ui.promptInput) {
            this.ui.promptInput.value = '';
        }
        if (this.ui.contextArea) {
            this.ui.contextArea.innerHTML = ''; // Clear context display
        }
    }

    // Removed update() and canvas render(), wrapText() if they existed and are unused
}
