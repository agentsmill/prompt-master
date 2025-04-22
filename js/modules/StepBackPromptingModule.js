/**
 * StepBackPromptingModule
 * Teaches step-back prompting: asking a general question before the specific one.
 */
export class StepBackPromptingModule {
    constructor(engine) {
        this.engine = engine;
        this.scenarios = [];
        this.currentScenarioIdx = 0;
        this.currentScenario = null;
        this.loaded = false;
        this.currentStep = 1; // State: 1 for step-back question, 2 for specific task prompt
        this.stepBackContextConcept = ""; // Store the concept from step 1

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
            console.log("StepBackPromptingModule scenarios loaded successfully.");
        } catch (e) {
            console.error(`Failed to load scenarios from ${scenarioFile}:`, e);
            if (this.ui.feedbackBox) this.ui.feedbackBox.textContent = `Error loading scenarios for Step-Back Prompting: ${e.message}`;
            this.loaded = false;
        }
    }

    startScenario(index = 0) {
        if (!this.loaded || index >= this.scenarios.length || index < 0) {
            console.error("Cannot start scenario: Step-Back module not loaded or index out of bounds.");
            if (this.ui.feedbackBox) this.ui.feedbackBox.textContent = "Error starting scenario.";
            return;
        }
        this.currentScenarioIdx = index;
        this.currentScenario = this.scenarios[this.currentScenarioIdx];
        this.currentStep = 1; // Reset to step 1 for new scenario
        this.stepBackContextConcept = this.currentScenario.step_back_question_hint || "general principles"; // Use hint as concept placeholder
        console.log(`Starting StepBackPrompting scenario ${this.currentScenarioIdx}: ${this.currentScenario.id}`);
        this.render();
    }

    render() {
        if (!this.currentScenario || !this.ui.title) {
            console.error("Cannot render: No current step-back scenario or UI elements missing.");
            if (this.ui.feedbackBox) this.ui.feedbackBox.textContent = "Error rendering scenario details.";
            return;
        }

        // Clear previous state
        this.ui.promptInput.value = '';
        this.ui.feedbackBox.className = 'feedback-box'; // Reset style

        // Populate common UI elements
        this.ui.title.textContent = `Level ${this.currentScenario.level}: ${this.currentScenario.title || 'Step-Back Prompting'}`;
        this.ui.description.innerHTML = this.formatText(this.currentScenario.description || 'No description.');

        // Render based on the current step
        if (this.currentStep === 1) {
            this.ui.task.innerHTML = `<strong>Step 1: Formulate Step-Back Question</strong><br>First, craft a prompt to ask a general question about the principles or concepts related to <i>'${this.stepBackContextConcept}'</i>.`;
            this.ui.promptInput.placeholder = `Enter prompt for the general step-back question...`;
            this.ui.feedbackBox.textContent = 'Focus on asking the broad, conceptual question first.';
        } else { // currentStep === 2
            this.ui.task.innerHTML = `<strong>Step 2: Formulate Specific Prompt</strong><br>Good! Now, imagine the step-back question gave you insights about <i>'${this.stepBackContextConcept}'</i>. Use that understanding to craft a prompt for the specific task: <br><i>${this.formatText(this.currentScenario.specific_task)}</i>`;
            this.ui.promptInput.placeholder = `Enter prompt for the specific task, incorporating step-back insights...`;
            this.ui.feedbackBox.textContent = `Use the insights from Step 1 to address the specific task: ${this.currentScenario.specific_task}`;
        }
    }

    formatText(text) {
        return text.replace(/\n/g, '<br>');
    }

    handleSubmission(userPrompt) {
        if (!this.currentScenario || !this.loaded) {
            this.ui.feedbackBox.textContent = "Error: Step-Back module not ready or no scenario loaded.";
            this.ui.feedbackBox.className = 'feedback-box error';
            return;
        }

        console.log(`(Step-Back) Handling submission for scenario: ${this.currentScenario.id}, Step: ${this.currentStep}`, userPrompt);
        
        if (this.currentStep === 1) {
            this.handleStep1Submission(userPrompt);
        } else { // currentStep === 2
            this.handleStep2Submission(userPrompt);
        }
    }

    handleStep1Submission(userPrompt) {
        const evaluationResult = this.evaluateStep1(userPrompt, this.currentScenario);
        if (evaluationResult.success) {
            this.ui.feedbackBox.textContent = evaluationResult.feedback; // e.g., "Good step-back question! Proceeding to Step 2."
            this.ui.feedbackBox.className = 'feedback-box info';
            this.currentStep = 2;
            this.render(); // Re-render UI for Step 2
        } else {
            this.ui.feedbackBox.textContent = `Evaluation (Step 1): ${evaluationResult.feedback} Try again!`;
            this.ui.feedbackBox.className = 'feedback-box error';
            // Show hint on failure
            if (this.currentScenario.hints && this.currentScenario.hints.length > 0) {
                 this.ui.feedbackBox.textContent += ` Hint: ${this.currentScenario.hints[0] || 'Focus on the general concept.'}`;
            }
        }
    }

    handleStep2Submission(userPrompt) {
        const evaluationResult = this.evaluateStep2(userPrompt, this.currentScenario);
        if (evaluationResult.success) {
            const score = 15; // Slightly higher score for multi-step
            this.ui.feedbackBox.textContent = `${this.currentScenario.success_message} (+${score} energy)`;
            this.ui.feedbackBox.className = 'feedback-box success';
            console.log(`(Step-Back) Scenario ${this.currentScenario.id} PASSED.`);
            this.engine.completeScenario(this.constructor.name, score); // Notify engine
        } else {
            this.ui.feedbackBox.textContent = `Evaluation (Step 2): ${evaluationResult.feedback} Try again!`;
            this.ui.feedbackBox.className = 'feedback-box error';
            // Show hint on failure
             if (this.currentScenario.hints && this.currentScenario.hints.length > 1) {
                 this.ui.feedbackBox.textContent += ` Hint: ${this.currentScenario.hints[1] || 'Make sure your prompt addresses the specific task.'}`;
             }
        }
    }

    evaluateStep1(userPrompt, scenario) {
        // Evaluate if the user asked a reasonable general/step-back question
        const promptLower = userPrompt.toLowerCase();
        const hintKeywords = scenario.step_back_question_hint?.toLowerCase().split(' ').filter(w => w.length > 3) || [];
        
        // Check if prompt is a question and includes keywords from the hint
        const isQuestion = promptLower.includes('?') || promptLower.startsWith('what') || promptLower.startsWith('how') || promptLower.startsWith('list') || promptLower.startsWith('identify');
        const includesKeywords = hintKeywords.length > 0 && hintKeywords.some(kw => promptLower.includes(kw));

        if (isQuestion && includesKeywords) {
             return { success: true, feedback: "Good step-back question formulated! Now proceed to Step 2." };
        } else if (isQuestion) {
             return { success: false, feedback: `Is your question focused on the general concept of '${scenario.step_back_question_hint}'?` };
        } else {
             return { success: false, feedback: "Step 1 requires formulating a general question first." };
        }
    }

    evaluateStep2(userPrompt, scenario) {
        // Evaluate if the final prompt addresses the specific task, potentially using step-back concepts
        const promptLower = userPrompt.toLowerCase();
        const specificTaskLower = scenario.specific_task?.toLowerCase() || "";
        const taskKeywords = specificTaskLower.split(' ').filter(w => w.length > 3).slice(0, 5); // First few keywords of specific task
        
        // Check if the prompt includes keywords related to the specific task
        const includesTaskKeywords = taskKeywords.length > 0 && taskKeywords.some(kw => promptLower.includes(kw));

        if (includesTaskKeywords) {
             // We assume the user incorporated the step-back thinking implicitly
             return { success: true, feedback: "Final prompt addresses the specific task." };
        } else {
             return { success: false, feedback: `The final prompt needs to address the specific task: '${scenario.specific_task}'. Did you use the insights from Step 1?` };
        }
    }

    reset() {
        console.log("Resetting StepBackPromptingModule...");
        this.currentScenarioIdx = 0;
        this.currentScenario = null;
        this.currentStep = 1;
        this.stepBackContextConcept = "";
        if (this.ui.feedbackBox) {
            this.ui.feedbackBox.textContent = "";
            this.ui.feedbackBox.className = 'feedback-box';
        }
        if (this.ui.promptInput) {
            this.ui.promptInput.value = '';
        }
         if (this.ui.task) { // Clear the task area
             this.ui.task.innerHTML = '';
         }
    }
}
