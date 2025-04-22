/**
 * LLMService
 * Handles interactions with an LLM API (e.g., OpenAI) for evaluation tasks.
 */
export class LLMService {
    constructor() {
        this.apiEndpoint = "https://api.openai.com/v1/chat/completions";
        // Using a generally cost-effective and fast model suitable for evaluation
        this.model = "gpt-3.5-turbo-0125"; 
        console.log("LLMService initialized.");
    }

    /**
     * Evaluates a user's prompt based on provided criteria using an LLM.
     * @param {string} userPrompt - The prompt submitted by the user.
     * @param {string} evaluationCriteria - Specific criteria for the LLM to evaluate against.
     * @param {string} apiKey - The OpenAI API key. **MUST be provided securely.**
     * @returns {Promise<{success: boolean, feedback: string}>} - Evaluation result.
     */
    async evaluatePrompt(userPrompt, evaluationCriteria, apiKey) {
        if (!apiKey) {
            console.error("LLMService Error: API key is missing.");
            return { success: false, feedback: "API Key not provided to LLM Service." };
        }
        if (!userPrompt || !evaluationCriteria) {
             return { success: false, feedback: "User prompt or evaluation criteria missing." };
        }

        // Construct the meta-prompt for the LLM evaluator
        const systemMessage = `You are an expert evaluator for a prompt engineering training game. 
Analyze the user's prompt based EXCLUSIVELY on the provided criteria. 
Respond ONLY with the word "PASS" if the prompt meets all criteria, or "FAIL: [Brief reason]" if it does not. 
Do not add any explanations unless it's a FAIL reason. Be strict.`;

        const userMessage = `Criteria: ${evaluationCriteria}\n\nUser Prompt: "${userPrompt}"`;

        console.log(`(LLM Eval) Sending request to ${this.model}...`);
        // console.log(`(LLM Eval) System: ${systemMessage}`); // DEBUG
        // console.log(`(LLM Eval) User: ${userMessage}`); // DEBUG


        try {
            const response = await fetch(this.apiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: "system", content: systemMessage },
                        { role: "user", content: userMessage }
                    ],
                    temperature: 0.1, // Low temperature for deterministic evaluation
                    max_tokens: 50 // Limit response length
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); // Try to get error details
                console.error("LLM API Error:", response.status, errorData);
                throw new Error(`API request failed with status ${response.status}. ${errorData.error?.message || ''}`);
            }

            const data = await response.json();
            
            if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
                 throw new Error("Invalid response structure from LLM API.");
            }

            const llmResponse = data.choices[0].message.content.trim();
            console.log(`(LLM Eval) Raw Response: "${llmResponse}"`);

            // Parse the LLM's response
            if (llmResponse.toUpperCase() === "PASS") {
                return { success: true, feedback: "LLM evaluation passed." };
            } else if (llmResponse.toUpperCase().startsWith("FAIL:")) {
                // Extract reason after "FAIL: "
                const reason = llmResponse.substring(5).trim();
                return { success: false, feedback: `LLM Evaluation: ${reason || 'Criteria not met.'}` };
            } else {
                 // If the response is not in the expected format, treat as failure.
                 console.warn("(LLM Eval) Unexpected response format:", llmResponse);
                 return { success: false, feedback: "LLM evaluation response was unclear. Assuming failure." };
            }

        } catch (error) {
            console.error("LLMService evaluatePrompt Error:", error);
            // Return failure but allow game to continue
            return { 
                success: false, 
                feedback: `LLM evaluation failed due to an error (${error.message}). Please check API key and connection, or try again.` 
            };
        }
    }
} 