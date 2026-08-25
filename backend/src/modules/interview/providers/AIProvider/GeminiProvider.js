import { GoogleGenAI } from "@google/genai";
import { BaseAIProvider } from "./BaseAIProvider.js";
import { AIConfig } from "./config/ai.config.js";
import { AIProviderResponse } from "./AIProviderResponse.js";

/**
 * GeminiProvider
 *
 * Implements the AI Provider contract using the @google/genai SDK.
 * Responsibilities:
 * - Initialize client
 * - Send prompt
 * - Receive and return raw text
 * - Handle provider errors cleanly
 */
export class GeminiProvider extends BaseAIProvider {
  constructor() {
    super();
    if (!AIConfig.apiKey) {
      throw new Error("AI Provider Error: GEMINI_API_KEY is missing or invalid.");
    }
    if (!AIConfig.model) {
      throw new Error("AI Provider Error: GEMINI_MODEL is missing.");
    }
    
    // Initialize the official Google Gen AI SDK
    this.ai = new GoogleGenAI({ apiKey: AIConfig.apiKey });
    this.modelName = AIConfig.model;
  }

  /**
   * @param {string} prompt
   * @returns {Promise<AIProviderResponse>}
   */
  async generate(prompt) {
    const startTime = Date.now();
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          temperature: AIConfig.temperature,
          maxOutputTokens: AIConfig.maxOutputTokens,
          // SDK doesn't have a direct timeout option on generateContent,
          // so we'll wrap it in a Promise.race later if strictly needed,
          // but typically network config controls timeouts.
        }
      });

      const text = typeof response?.text === "function" ? response.text() : response?.text;
      if (!text) {
        throw new Error("AI Provider Error: Empty response from provider.");
      }

      this._log("Success", Date.now() - startTime);
      return new AIProviderResponse({ text });
      
    } catch (error) {
      this._log("Failure", Date.now() - startTime);
      this._handleError(error);
    }
  }

  /**
   * Safe logging that never leaks API keys or prompts.
   */
  _log(status, durationMs) {
    console.log(`[AI Provider] Provider: Gemini | Model: ${this.modelName} | Status: ${status} | Duration: ${durationMs}ms`);
  }

  /**
   * Translates raw SDK errors into safe application errors.
   */
  _handleError(error) {
    // Basic error translation to prevent exposing raw SDK stack traces
    if (error.status === 429) {
      throw new Error("AI Provider Error: Rate limit exceeded.");
    }
    if (error.status === 401 || error.status === 403) {
      throw new Error("AI Provider Error: Invalid API key or unauthorized.");
    }
    if (error.name === 'TimeoutError' || error.message.toLowerCase().includes('timeout')) {
      throw new Error("AI Provider Error: Request timeout.");
    }
    
    throw new Error(`AI Provider Error: Network or provider failure. (${error.message || "Unknown error"})`);
  }
}
