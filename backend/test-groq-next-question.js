import dotenv from "dotenv";
dotenv.config();

process.env.QUESTION_PROVIDER = 'groq';
process.env.AI_PROVIDER = 'groq';
process.env.GROQ_MODEL = 'openai/gpt-oss-120b';

import { AIConfig } from "./src/modules/interview/providers/AIProvider/config/ai.config.js";
AIConfig.provider = 'groq';
AIConfig.groqModel = 'openai/gpt-oss-120b';

import { InterviewConfig } from "./src/modules/interview/services/InterviewConfig.js";
import { createInterviewEngine } from "./src/modules/interview/services/interviewEngine.js";
import { ConversationHistory } from "./src/modules/interview/services/ConversationHistory.js";
import { InterviewState } from "./src/modules/interview/services/InterviewState.js";

async function runTest() {
  const engine = createInterviewEngine("groq");
  
  const config = new InterviewConfig({
    jobRole: "Backend Developer",
    topics: ["Node.js"],
    difficulty: "Medium",
    experienceLevel: "3-5 Years",
    duration: 30,
    language: "English",
    interviewType: "groq"
  });

  const state = new InterviewState({
    coveredTopics: ["Node.js"],
    remainingTopics: [],
    questionNumber: 2,
    maxQuestions: 10,
    remainingTime: 1000
  });

  const history = new ConversationHistory();
  history.addAIQuestion("What is event loop in Node.js?");
  history.addCandidateAnswer("It's a loop that processes events asynchronously.");

  console.log("Generating next question...");
  try {
    const generated = await engine.generateNextQuestion(config, state, history);
    console.log("Result:", JSON.stringify(generated, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

runTest();
