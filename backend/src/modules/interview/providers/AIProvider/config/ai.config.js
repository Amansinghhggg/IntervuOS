/**
 * ai.config.js
 *
 * Centralized AI configuration.
 * All settings must be populated from environment variables to prevent
 * hardcoding sensitive values and to allow easy runtime changes.
 */

import dotenv from "dotenv";
dotenv.config();

export const AIConfig = {
  provider: process.env.AI_PROVIDER || "gemini",
  apiKey: process.env.GEMINI_API_KEY,
  model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
  maxOutputTokens: parseInt(process.env.MAX_OUTPUT_TOKENS, 10) || 2048,
  timeout: parseInt(process.env.REQUEST_TIMEOUT, 10) || 30000,
};
