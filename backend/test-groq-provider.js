import dotenv from "dotenv";
dotenv.config();

// We override some config manually if we want to ensure it tries Groq
process.env.AI_PROVIDER = 'groq';
// Using the specified model
process.env.GROQ_MODEL = 'openai/gpt-oss-120b';

// Dynamically import to ensure process.env changes take effect if config is lazy,
// but ai.config is evaluated immediately. Let's just override AIConfig directly.
import { AIConfig } from "./src/modules/interview/providers/AIProvider/config/ai.config.js";
AIConfig.provider = 'groq';
AIConfig.groqModel = 'openai/gpt-oss-120b';

import { createAIProvider } from "./src/modules/interview/providers/AIProvider/index.js";

async function runSmokeTest() {
  console.log("=== AI Provider Smoke Test (Groq) ===");
  try {
    const provider = createAIProvider();
    console.log("✅ Factory instantiated provider successfully:", provider.constructor.name);
    
    console.log("Sending test prompt: 'Hello, respond with the exact word: SUCCESS'");
    
    // Note: If no GROQ_API_KEY is present in .env, this will throw our custom missing key error
    // before it even tries to send the prompt.
    const result = await provider.generate("Hello, respond with the exact word: SUCCESS");
    
    console.log("\n--- RAW RESPONSE ---");
    console.log(result);
    console.log("--------------------\n");
    console.log("✅ Smoke test passed!");
    
  } catch (error) {
    console.log("\n❌ Smoke test caught an expected application-level error:");
    console.log(error.message);
    console.log("\n(This is normal if GROQ_API_KEY is not set in your .env file or is invalid)");
  }
}

runSmokeTest();
