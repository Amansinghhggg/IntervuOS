import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Force Groq as the AI provider for testing
process.env.AI_PROVIDER = "groq";
process.env.GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

import { AIConfig } from "./src/modules/interview/providers/AIProvider/config/ai.config.js";
AIConfig.provider = "groq";
AIConfig.groqModel = process.env.GROQ_MODEL;

import User from "./src/modules/users/user.model.js";
import Interview from "./src/modules/interview/models/interview.model.js";
import InterviewSession from "./src/modules/interview/models/InterviewSession.js";
import InterviewResult from "./src/modules/interview/models/InterviewResult.js";
import InterviewSessionService from "./src/modules/interview/services/InterviewSessionService.js";

async function runIntegrationTest() {
  console.log("\n🧪 Evaluation Integration — Smoke Test\n");
  console.log("──────────────────────────────────────────");

  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  let employerId;
  let candidateId;
  let interviewId;
  let sessionId;
  let resultId;

  try {
    // 1. Setup Mock Users
    const employer = new User({
      name: "Test Employer",
      email: "employer@test-eval.com",
      password: "password123",
      role: "employer",
    });
    await employer.save();
    employerId = employer._id;

    const candidate = new User({
      name: "Test Candidate",
      email: "candidate@test-eval.com",
      password: "password123",
      role: "candidate",
    });
    await candidate.save();
    candidateId = candidate._id;

    // 2. Setup Mock Interview
    const interview = new Interview({
      title: "Senior Node.js Developer",
      jobRole: "Node.js Developer",
      description: "Looking for an expert Node.js developer.",
      topics: ["Node.js", "Express", "MongoDB"],
      difficulty: "Medium",
      duration: 30,
      instructions: "Answer clearly.",
      interviewCode: "EVAL123",
      employer: employerId,
      assignedCandidates: [
        {
          email: "candidate@test-eval.com",
          status: "Completed",
          joinedAt: new Date(),
          submittedAt: new Date(),
        },
      ],
      interviewType: "groq",
    });
    await interview.save();
    interviewId = interview._id;

    // 3. Setup Mock InterviewSession
    const session = new InterviewSession({
      interviewId,
      candidateId,
      status: "COMPLETED",
      startedAt: new Date(Date.now() - 30 * 60000), // 30 mins ago
      expiresAt: new Date(),
      currentQuestionIndex: 2,
      questions: [
        {
          id: 1,
          question: "What is middleware in Express?",
          topic: "Express",
          difficulty: "Easy",
          type: "text",
          answer: "Middleware functions have access to the request object, response object, and the next middleware function in the application’s request-response cycle. They can modify req/res or end the cycle.",
          askedAt: new Date(Date.now() - 25 * 60000),
          answeredAt: new Date(Date.now() - 20 * 60000),
        },
        {
          id: 2,
          question: "Explain the Event Loop in Node.js.",
          topic: "Node.js",
          difficulty: "Medium",
          type: "text",
          answer: "The event loop is what allows Node.js to perform non-blocking I/O operations despite being single-threaded. It offloads operations to the system kernel whenever possible.",
          askedAt: new Date(Date.now() - 15 * 60000),
          answeredAt: new Date(Date.now() - 10 * 60000),
        },
      ],
    });
    await session.save();
    sessionId = session._id;
    console.log("✅ Mock data created in MongoDB");

    // 4. Run evaluateAndSaveResult
    console.log("\n▶️ Running InterviewSessionService.evaluateAndSaveResult()...");
    const response = await InterviewSessionService.evaluateAndSaveResult(session, interview);

    if (!response.success) {
      throw new Error(`Evaluation failed: ${response.error}`);
    }

    resultId = response.result._id;
    console.log(`✅ Evaluation successful. Result ID: ${resultId}`);

    // 5. Verify the InterviewResult Document
    console.log("\n🔍 Verifying MongoDB Data:");
    const savedResult = await InterviewResult.findById(resultId);
    if (!savedResult) {
      throw new Error("InterviewResult document not found in MongoDB!");
    }
    console.log("   ✅ InterviewResult document found");

    // Verify metadata
    if (!savedResult.aiMetadata || savedResult.aiMetadata.provider !== "groq") {
      throw new Error("InterviewResult aiMetadata is incorrect or missing!");
    }
    console.log("   ✅ InterviewResult aiMetadata is populated correctly");

    // Verify scores
    if (typeof savedResult.scores?.overall !== "number") {
      throw new Error("InterviewResult scores are missing or invalid!");
    }
    console.log(`   ✅ InterviewResult overall score: ${savedResult.scores.overall}/10`);

    // Verify recommendation
    if (!["STRONG_HIRE", "HIRE", "BORDERLINE", "NO_HIRE", "STRONG_NO_HIRE"].includes(savedResult.recommendation)) {
      throw new Error(`Invalid recommendation: ${savedResult.recommendation}`);
    }
    console.log(`   ✅ InterviewResult recommendation: ${savedResult.recommendation}`);

    // Verify question evaluations
    if (savedResult.questionEvaluations.length !== 2) {
      throw new Error("InterviewResult questionEvaluations length is incorrect!");
    }
    console.log(`   ✅ InterviewResult questionEvaluations count: ${savedResult.questionEvaluations.length}`);

    // 6. Verify Interview Document Update
    const updatedInterview = await Interview.findById(interviewId);
    const candidateData = updatedInterview.assignedCandidates.find(c => c.email === "candidate@test-eval.com");
    if (!candidateData.resultId || candidateData.resultId.toString() !== resultId.toString()) {
      throw new Error("Interview document was not updated with the resultId!");
    }
    console.log("   ✅ Interview document correctly updated with resultId");

    console.log("\n🎉 Integration test passed successfully!\n");

  } catch (error) {
    console.error("\n❌ Integration test failed:");
    console.error(error);
    process.exitCode = 1;
  } finally {
    // 7. Cleanup
    console.log("🧹 Cleaning up mock data...");
    if (employerId) await User.findByIdAndDelete(employerId);
    if (candidateId) await User.findByIdAndDelete(candidateId);
    if (interviewId) await Interview.findByIdAndDelete(interviewId);
    if (sessionId) await InterviewSession.findByIdAndDelete(sessionId);
    if (resultId) await InterviewResult.findByIdAndDelete(resultId);
    console.log("✅ Cleanup complete");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

runIntegrationTest();
