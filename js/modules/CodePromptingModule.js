/**
 * CodePromptingModule
 * Teaches how to effectively prompt for code generation, explanation, or debugging.
 */
export class CodePromptingModule {
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
        const scenarioFile = "js/data/codePromptingScenarios.json";
        console.log(`CodePromptingModule: Loading scenarios from ${scenarioFile}`);
        try {
            const resp = await fetch(scenarioFile);
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            this.scenarios = await resp.json();
            if (!Array.isArray(this.scenarios) || this.scenarios.length === 0) {
                throw new Error('Invalid scenario data format');
            }
            this.loaded = true;
            console.log("CodePromptingModule scenarios loaded successfully.");
        } catch (e) {
            console.error(`Failed to load scenarios from ${scenarioFile}:`, e);
            if (this.ui.feedbackBox) this.ui.feedbackBox.textContent = `Error loading scenarios for Code Prompting: ${e.message}`;
            this.loaded = false;
        }
    }

    startScenario(index = 0) {
        if (!this.loaded || index >= this.scenarios.length || index < 0) {
            console.error("Cannot start scenario: Code module not loaded or index out of bounds.");
            if (this.ui.feedbackBox) this.ui.feedbackBox.textContent = "Error starting Code Prompting scenario.";
            return;
        }
        this.currentScenarioIdx = index;
        this.currentScenario = this.scenarios[this.currentScenarioIdx];
        console.log(`Starting CodePrompting scenario ${this.currentScenarioIdx}: ${this.currentScenario.id}`);
        this.render();
    }

    render() {
        if (!this.currentScenario || !this.ui.title) {
            console.error("Cannot render: No current Code scenario or UI elements missing.");
             if(this.ui.feedbackBox) this.ui.feedbackBox.textContent = "Error rendering scenario details.";
            return;
        }

        // Clear previous state
        this.ui.promptInput.value = '';
        this.ui.feedbackBox.textContent = 'Formulate a clear and specific prompt for the coding task.';
        this.ui.feedbackBox.className = 'feedback-box';

        // Populate UI elements
        this.ui.title.textContent = `Level ${this.currentScenario.level}: ${this.currentScenario.title || 'Code Prompting'}`;
        this.ui.description.innerHTML = this.formatText(this.currentScenario.description || 'No description.');
        // Format task, potentially highlighting code blocks if present
        this.ui.task.innerHTML = `<strong>Your Task:</strong> ${this.formatCodeInText(this.currentScenario.task || 'No task defined.')}`;
        this.ui.promptInput.placeholder = this.currentScenario.prompt_template || 'Enter your code-related prompt...';
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

    // Enhance formatter to handle potential code blocks (e.g., ```javascript ... ```)
    formatCodeInText(text) {
        const escapedBase = text.replace(/&/g, "&amp;")
                               .replace(/</g, "&lt;")
                               .replace(/>/g, "&gt;")
                               .replace(/"/g, "&quot;")
                               .replace(/'/g, "&#039;");
        // Regex to find code blocks and wrap them in <pre><code>
        const codeFormatted = escapedBase.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>`;
        });
        return codeFormatted.replace(/\n/g, '<br>'); // Handle remaining newlines outside code blocks
    }

    handleSubmission(userPrompt) {
        if (!this.currentScenario || !this.loaded) {
            this.ui.feedbackBox.textContent = "Error: Code module not ready or no scenario loaded.";
            this.ui.feedbackBox.className = 'feedback-box error';
            return;
        }

        console.log(`(Code) Handling submission for scenario: ${this.currentScenario.id}`, userPrompt);
        const evaluationResult = this.evaluate(userPrompt, this.currentScenario);

        if (evaluationResult.success) {
            const score = 15; // Final module score
            this.ui.feedbackBox.textContent = `${this.currentScenario.success_message} (+${score} energy)`;
            this.ui.feedbackBox.className = 'feedback-box success';
            console.log(`(Code) Scenario ${this.currentScenario.id} PASSED.`);
            this.engine.completeScenario(this.constructor.name, score); // Notify engine
        } else {
            this.ui.feedbackBox.textContent = `Evaluation: ${evaluationResult.feedback} Try again!`;
            this.ui.feedbackBox.className = 'feedback-box error';
             if (this.currentScenario.hints && this.currentScenario.hints.length > 0) {
                 const hintToShow = this.currentScenario.hints[Math.floor(Math.random() * this.currentScenario.hints.length)];
                 this.ui.feedbackBox.textContent += ` Hint: ${hintToShow}`;
             }
            console.log(`(Code) Scenario ${this.currentScenario.id} FAILED. Feedback: ${evaluationResult.feedback}`);
        }
    }

    evaluate(userPrompt, scenario) {
        // Evaluate if the prompt is clear, specific, and includes necessary details for the coding task
        if (!scenario || !scenario.evaluation_logic) return { success: false, feedback: "No evaluation criteria defined." };

        const promptLower = userPrompt.toLowerCase();
        const taskLower = scenario.task?.toLowerCase() || "";
        
        // Check 1: Is the intent clear (generate, explain, debug)?
        const codeKeywords = ["generate", "write", "function", "script", "code", "explain", "debug", "fix", "what does", "javascript", "python", "java", "c#"];
        const hasCodeIntent = codeKeywords.some(kw => promptLower.includes(kw));

        if (!hasCodeIntent) {
            return { success: false, feedback: "Prompt should clearly state the coding goal (generate, explain, debug, etc.)." };
        }

        // Check 2: Does it include the core task concept?
        let includesCoreConcept = false;
        const conceptKeywords = scenario.evaluation_logic.keywords || []; // Get keywords from scenario data
        if (conceptKeywords.length > 0) {
            includesCoreConcept = conceptKeywords.every(kw => promptLower.includes(kw.toLowerCase()));
        } else {
            // Fallback for simple scenarios if no keywords provided
            if (scenario.id === 'code-gen-1' && promptLower.includes('factorial')) includesCoreConcept = true;
            else if (scenario.id === 'code-debug-1' && promptLower.includes('sort')) includesCoreConcept = true;
            else includesCoreConcept = true; // Assume included if no specific checks
        }

        if (!includesCoreConcept) {
            return { success: false, feedback: `Prompt is missing key details about the specific task (e.g., ${conceptKeywords.join(', ')}).` };
        }

        // Check 3: Is the language specified if needed?
        let languageSpecified = true; // Assume true unless needed
        if (scenario.evaluation_logic.requires_language) {
             const languageKeywords = ['javascript', 'python', 'java', 'c#', 'php', 'ruby', 'go', 'swift', 'kotlin']; // Common languages
             languageSpecified = languageKeywords.some(lang => promptLower.includes(lang));
             if (!languageSpecified) {
                return { success: false, feedback: "Prompt should specify the programming language needed for the task." };
             }
        }

        // Check 4: Placeholder for LLM evaluation
        if (scenario.evaluation_logic.type === 'llm_evaluation') {
            console.warn("(Code Eval) LLM evaluation specified but not implemented. Checking prompt structure only.");
        }

        // If checks pass
        return { success: true, feedback: "Prompt is well-structured for the coding task." };
    }

    reset() {
        console.log("Resetting CodePromptingModule...");
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