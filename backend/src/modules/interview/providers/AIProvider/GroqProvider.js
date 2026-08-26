import Groq from "groq-sdk";
import { BaseAIProvider } from "./BaseAIProvider.js";
import { AIConfig } from "./config/ai.config.js";
import { AIProviderResponse } from "./AIProviderResponse.js";

/**
 * GroqProvider
 *
 * Implements high-speed AI generation (< 800ms) with automated fallback.
 */
export class GroqProvider extends BaseAIProvider {
  constructor() {
    super();
    if (!AIConfig.groqApiKey) {
      throw new Error("AI Provider Error: GROQ_API_KEY is missing or invalid.");
    }
    if (!AIConfig.groqModel) {
      throw new Error("AI Provider Error: GROQ_MODEL is missing.");
    }
    
    this.ai = new Groq({ apiKey: AIConfig.groqApiKey });
    this.modelName = AIConfig.groqModel;
    this.fallbackModel = AIConfig.groqModel === "openai/gpt-oss-120b" ? "openai/gpt-oss-20b" : null;
  }

  /**
   * @param {string} prompt
   * @param {Object} [options]
   * @returns {Promise<AIProviderResponse>}
   */
  async generate(prompt, options = {}) {
    const startTime = Date.now();
    const maxRetries = options.maxRetries || 2;
    const maxTokens = options.maxTokens || (AIConfig.maxOutputTokens ? Math.min(AIConfig.maxOutputTokens, 2048) : 2048);
    const temperature = options.temperature !== undefined ? options.temperature : 0.4;
    
    // Model candidates: Primary followed by Fallback
    const modelsToTry = [this.modelName];
    if (this.fallbackModel && this.fallbackModel !== this.modelName) {
      modelsToTry.push(this.fallbackModel);
    }

    let lastError = null;

    for (const currentModel of modelsToTry) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await this.ai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: currentModel,
            temperature,
            max_tokens: maxTokens,
          });

          const text = response.choices[0]?.message?.content;
          if (!text || text.trim().length === 0) {
            throw new Error("Empty response from AI provider.");
          }

          this._log("Success", Date.now() - startTime, currentModel);
          return new AIProviderResponse({ text });

        } catch (error) {
          lastError = error;
          const isRetryable =
            error.status === 429 ||
            (error.status >= 500 && error.status <= 599) ||
            error.name === 'TimeoutError' ||
            (error.message && (
              error.message.toLowerCase().includes('timeout') ||
              error.message.toLowerCase().includes('rate limit') ||
              error.message.toLowerCase().includes('fetch failed') ||
              error.message.toLowerCase().includes('econnreset')
            ));

          if (isRetryable && attempt < maxRetries) {
            const backoffMs = Math.min(attempt * 500, 1500);
            console.warn(`[AI Provider] Retrying ${currentModel} (attempt ${attempt}/${maxRetries}) after ${backoffMs}ms due to: ${error.message}`);
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
          } else {
            break;
          }
        }
      }

      if (currentModel !== modelsToTry[modelsToTry.length - 1]) {
        console.warn(`[AI Provider] Primary model ${currentModel} failed after retries. Switching to fallback model: ${this.fallbackModel}...`);
      }
    }

    this._log("Failure", Date.now() - startTime, this.modelName);
    this._handleError(lastError);
  }

  /**
   * Safe logging that never leaks API keys or prompts.
   */
  _log(status, durationMs, model = this.modelName) {
    console.log(`[AI Provider] Provider: Groq | Model: ${model} | Status: ${status} | Duration: ${durationMs}ms`);
  }

  /**
   * Translates raw SDK errors into safe application errors.
   */
  _handleError(error) {
    if (!error) {
      throw new Error("AI Provider Error: Unknown provider failure.");
    }
    if (error.status === 429) {
      throw new Error("AI Provider Error: Rate limit exceeded.");
    }
    if (error.status === 401 || error.status === 403) {
      throw new Error("AI Provider Error: Invalid API key or unauthorized.");
    }
    if (error.name === 'TimeoutError' || (error.message && error.message.toLowerCase().includes('timeout'))) {
      throw new Error("AI Provider Error: Request timeout.");
    }
    
    throw new Error(`AI Provider Error: Network or provider failure. (${error.message || "Unknown error"})`);
  }
}
