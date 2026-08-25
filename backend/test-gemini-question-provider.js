import dotenv from "dotenv";
dotenv.config();

// Enforce configuration for the smoke test
process.env.AI_PROVIDER = 'gemini';
process.env.GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

import { InterviewConfig } from "./src/modules/interview/services/InterviewConfig.js";
import { createInterviewEngine } from "./src/modules/interview/services/interviewEngine.js";

async function runSmokeTest() {
  console.log("=== GeminiQuestionProvider Integration Smoke Test ===\n");
  
  try {
    const config = new InterviewConfig({
      jobRole: "Node.js Backend Developer",
      topics: ["Node.js", "Express", "MongoDB"],
      difficulty: "Medium",
      experienceLevel: "1-2 Years",
      duration: 30,
      language: "English",
      interviewType: "gemini"
    });
    
    console.log("1. Config created successfully.");
    
    const engine = createInterviewEngine("gemini");
    console.log("2. InterviewEngine instantiated with gemini provider.");
    
    console.log("3. Generating questions (this hits the Gemini API)...");
    
    // This executes the complete pipeline: 
    // Engine -> Provider -> Builder -> Validator -> AIProvider -> Parser -> ResponseValidator
    const questions = await engine.generateFirstQuestion(config);
    
    console.log("\n✅ SUCCESS: Full pipeline completed!");
    console.log(`Generated ${questions.length} structured questions:\n`);
    console.log(JSON.stringify(questions, null, 2));
    
  } catch (error) {
    console.log(`\n❌ Smoke test caught an application-level error (${error.name}):`);
    console.log(error.message);
    if (error.validationDetails) {
      console.log(error.validationDetails);
    }
    console.log("\n(Note: A 'GEMINI_API_KEY is missing' error is expected if your .env is not fully configured.)");
  }
}

runSmokeTest();
