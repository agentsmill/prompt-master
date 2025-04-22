/**
 * FewShotPromptingModule
 * Teaches few-shot prompting techniques where examples are provided.
 */
export class FewShotPromptingModule {
    constructor(engine) {
        this.engine = engine;
        this.scenarios = [];
        this.currentScenarioIdx = 0;
        this.currentScenario = null;
        this.loaded = false;
        this.ui = {
            title: document.getElementById('challenge-title'),
            description: document.getElementById('challenge-description'),
            task: document.getElementById('challenge-task'), // Used to display examples + final task
            promptInput: document.getElementById('prompt-input'),
            feedbackBox: document.getElementById('feedback-box')
        };
        this.init();
    }

    async init() {
        const scenarioFile = "js/data/fewShotScenarios.json";
        console.log(`FewShotPromptingModule: Loading scenarios from ${scenarioFile}`);
        try {
            const resp = await fetch(scenarioFile);
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
            this.scenarios = await resp.json();
            if (!Array.isArray(this.scenarios) || this.scenarios.length === 0) {
                throw new Error('Invalid scenario data format');
            }
            this.loaded = true;
            console.log("FewShotPromptingModule scenarios loaded successfully.");
        } catch (e) {
            console.error(`Failed to load scenarios from ${scenarioFile}:`, e);
            if (this.ui.feedbackBox) this.ui.feedbackBox.textContent = `Error loading scenarios for Few-Shot Prompting: ${e.message}`;
            this.loaded = false;
        }
    }

    startScenario(index = 0) {
        if (!this.loaded || index >= this.scenarios.length || index < 0) {
            console.error("Cannot start scenario: Few-Shot module not loaded or index out of bounds.");
            if (this.ui.feedbackBox) this.ui.feedbackBox.textContent = "Error starting scenario.";
            return;
        }
        this.currentScenarioIdx = index;
        this.currentScenario = this.scenarios[this.currentScenarioIdx];
        console.log(`Starting FewShotPrompting scenario ${this.currentScenarioIdx}: ${this.currentScenario.id}`);
        this.render();
    }

    render() {
        if (!this.currentScenario || !this.ui.title) {
            console.error("Cannot render: No current few-shot scenario or UI elements missing.");
             if(this.ui.feedbackBox) this.ui.feedbackBox.textContent = "Error rendering scenario details.";
            return;
        }

        // Clear previous state
        this.ui.promptInput.value = '';
        this.ui.feedbackBox.textContent = 'Structure your prompt using the provided examples.';
        this.ui.feedbackBox.className = 'feedback-box'; // Reset style

        // Populate UI elements
        this.ui.title.textContent = `Level ${this.currentScenario.level}: ${this.currentScenario.title || 'Few-Shot Prompting Challenge'}`;
        this.ui.description.innerHTML = this.formatText(this.currentScenario.description || 'No description.');
        
        // Render Examples and Task from prompt_template
        this.renderPromptTemplate(this.currentScenario.prompt_template);

        this.ui.promptInput.placeholder = 'Enter your prompt, including examples and the final task...';
    }

    // Renders the structured prompt template (examples + task) into the task area
    renderPromptTemplate(template) {
        if (!template) {
            this.ui.task.innerHTML = '<strong>Task:</strong> No prompt template provided.';
            return;
        }
        
        // Simple parsing based on "EXAMPLE" and "YOUR TASK" markers
        let htmlContent = "<strong>Examples & Task:</strong><br><br>";
        const parts = template.split(/(EXAMPLE \d+:|YOUR TASK:)/); // Split by markers
        
        for (let i = 1; i < parts.length; i += 2) { // Iterate through marker and content pairs
            const marker = parts[i];
            const content = parts[i+1] ? parts[i+1].trim() : "";
            
            htmlContent += `<strong>${marker}</strong><br>`;
            // Use <pre> for content likely containing code/JSON
            if (content.includes('```json')) {
                 const codeContent = content.replace(/```json\n?([\s\S]*?)\n?```/g, '$1'); // Extract code block
                 htmlContent += `<pre class="code-block">${this.escapeHtml(codeContent)}</pre><br>`;
            } else {
                 htmlContent += `${this.formatText(content)}<br><br>`;
            }
        }
        
        this.ui.task.innerHTML = htmlContent;
    }
    
    // Basic HTML escaping for displaying code examples safely
    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
     }

    formatText(text) {
        return this.escapeHtml(text).replace(/\n/g, '<br>');
    }

    handleSubmission(userPrompt) {
        if (!this.currentScenario || !this.loaded) {
            this.ui.feedbackBox.textContent = "Error: Few-Shot module not ready or no scenario loaded.";
            this.ui.feedbackBox.className = 'feedback-box error';
            return;
        }

        console.log(`(Few-Shot) Handling submission for scenario: ${this.currentScenario.id}`, userPrompt);
        const evaluationResult = this.evaluate(userPrompt, this.currentScenario);

        if (evaluationResult.success) {
            const score = 10; // Simple scoring
            this.ui.feedbackBox.textContent = `${this.currentScenario.success_message} (+${score} energy)`;
            this.ui.feedbackBox.className = 'feedback-box success';
            console.log(`(Few-Shot) Scenario ${this.currentScenario.id} PASSED.`);
            this.engine.completeScenario(this.constructor.name, score); // Notify engine
        } else {
            this.ui.feedbackBox.textContent = `Evaluation: ${evaluationResult.feedback} Try again!`;
            this.ui.feedbackBox.className = 'feedback-box error';
             // Show hint on failure
             if (this.currentScenario.hints && this.currentScenario.hints.length > 0) {
                 const hintToShow = this.currentScenario.hints[Math.floor(Math.random() * this.currentScenario.hints.length)];
                 this.ui.feedbackBox.textContent += ` Hint: ${hintToShow}`;
             }
            console.log(`(Few-Shot) Scenario ${this.currentScenario.id} FAILED. Feedback: ${evaluationResult.feedback}`);
        }
    }

    evaluate(userPrompt, scenario) {
        if (!scenario || !scenario.evaluation_logic) return { success: false, feedback: "No evaluation criteria defined." };

        const promptLower = userPrompt.toLowerCase();
        const template = scenario.prompt_template || "";
        
        // Heuristic Evaluation for Few-Shot structure:
        // 1. Does the prompt contain markers like "EXAMPLE" and "YOUR TASK"?
        // 2. Does it seem to include content similar to the examples from the template?
        // 3. Does it include the final task from the template?

        let examplesIncluded = true; // Assume true if no examples in template
        let taskIncluded = false;
        
        const exampleMarkers = template.match(/EXAMPLE \d+:/g);
        const taskMarker = "YOUR TASK:";
        const taskContentMatch = template.match(/YOUR TASK:\s*([\s\S]*)/);
        const taskContent = taskContentMatch ? taskContentMatch[1].trim() : null;

        if (exampleMarkers && exampleMarkers.length > 0) {
             // Check if prompt contains the example markers (or similar structure)
             const userExampleMarkers = promptLower.match(/example \d+:/g);
             if (!userExampleMarkers || userExampleMarkers.length < exampleMarkers.length) {
                 examplesIncluded = false;
             } else {
                // Basic check: does the prompt contain the first few words of each example?
                // This is crude but checks if the user copied/structured the examples.
                const exampleContents = template.split(/EXAMPLE \d+:/).slice(1); // Get content after each marker
                for(let i = 0; i < exampleContents.length; i++) {
                    const exampleStart = exampleContents[i].trim().split(' ').slice(0, 5).join(' ').toLowerCase();
                    if (exampleStart && !promptLower.includes(exampleStart)) {
                       examplesIncluded = false;
                       break; 
                    }
                }
             }
        }
        
        if (!examplesIncluded) {
            return { success: false, feedback: "Prompt structure should include the provided examples clearly separated." };
        }

        if (taskContent) {
             // Check if the final task instruction is present after the examples
             const taskContentStart = taskContent.split(' ').slice(0, 5).join(' ').toLowerCase();
             if (promptLower.includes(taskMarker.toLowerCase()) && promptLower.includes(taskContentStart)) {
                 taskIncluded = true;
             }
        } else {
            taskIncluded = true; // No specific task marker found in template?
        }

        if (!taskIncluded) {
             return { success: false, feedback: "Prompt structure should include the final task clearly after the examples." };
        }
        
        // If structure seems correct (examples + task present)
        // Note: We are NOT actually checking the JSON output here ("json_match" is ignored)
        return { success: true, feedback: "Few-shot prompt structure seems correct." };
    }

    reset() {
        console.log("Resetting FewShotPromptingModule...");
        this.currentScenarioIdx = 0;
        this.currentScenario = null;
        if (this.ui.feedbackBox) {
            this.ui.feedbackBox.textContent = "";
            this.ui.feedbackBox.className = 'feedback-box';
        }
        if (this.ui.promptInput) {
            this.ui.promptInput.value = '';
        }
         if (this.ui.task) { // Clear the task/example area
             this.ui.task.innerHTML = '';
         }
    }
} 