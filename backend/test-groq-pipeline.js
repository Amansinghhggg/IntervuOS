import dotenv from "dotenv";
dotenv.config();

// Enforce configuration for the smoke test
process.env.AI_PROVIDER = 'groq';
process.env.GROQ_MODEL = 'openai/gpt-oss-120b';

import { AIConfig } from "./src/modules/interview/providers/AIProvider/config/ai.config.js";
AIConfig.provider = 'groq';
AIConfig.groqModel = 'openai/gpt-oss-120b';

import { InterviewConfig } from "./src/modules/interview/services/InterviewConfig.js";
import { createInterviewEngine } from "./src/modules/interview/services/interviewEngine.js";

async function runSmokeTest() {
  console.log("=== Groq Provider Full Pipeline Integration Smoke Test ===\n");
  
  try {
    const config = new InterviewConfig({
      jobRole: "Node.js Backend Developer",
      topics: ["Node.js", "Express", "MongoDB"],
      difficulty: "Medium",
      experienceLevel: "3-5 Years",
      duration: 30,
      language: "English",
      interviewType: "groq"
    });
    
    console.log("1. Config created successfully.");
    
    // Engine initialization handles injecting the QuestionProvider, which in turn
    // invokes the AIProvider (Groq now). Note: QuestionProvider is still named
    // GeminiQuestionProvider in code, but under the hood it calls createAIProvider().
    const engine = createInterviewEngine("gemini");
    console.log("2. InterviewEngine instantiated.");
    
    console.log("3. Generating questions (this hits the Groq API)...");
    
    // This executes the complete pipeline: 
    // Engine -> Provider -> Builder -> Validator -> AIProvider (Groq) -> Parser -> ResponseValidator
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
    console.log("\n(Note: A 'GROQ_API_KEY is missing' error is expected if your .env is not fully configured.)");
  }
}

runSmokeTest();
