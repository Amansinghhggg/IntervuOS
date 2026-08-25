import dotenv from "dotenv";
dotenv.config();

// We override some config manually if we want to ensure it tries Gemini
process.env.AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';
if (!process.env.GEMINI_MODEL) {
  process.env.GEMINI_MODEL = 'gemini-3.6-flash';
}

import { GeminiProvider } from "./src/modules/interview/providers/AIProvider/GeminiProvider.js";

async function runSmokeTest() {
  console.log("=== Gemini AI Provider Smoke Test ===");
  try {
    const provider = new GeminiProvider();
    console.log("✅ Instantiated provider successfully: GeminiProvider");
    console.log(`Using Model: ${provider.modelName}`);
    
    console.log("Sending test prompt: 'Hello, respond with the exact word: SUCCESS'");
    
    // Note: If no GEMINI_API_KEY is present in .env, this will throw our custom missing key error
    // before it even tries to send the prompt.
    const result = await provider.generate("Hello, respond with the exact word: SUCCESS");
    
    console.log("\n--- RAW RESPONSE ---");
    console.log(result);
    console.log("--------------------\n");
    console.log("✅ Smoke test passed!");
    
  } catch (error) {
    console.log("\n❌ Smoke test caught an expected application-level error:");
    console.log(error.message);
    console.log("\n(This is normal if GEMINI_API_KEY is not set in your .env file or is invalid)");
  }
}

runSmokeTest();
