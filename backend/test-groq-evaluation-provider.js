/**
 * Smoke Test — GroqEvaluationProvider
 *
 * End-to-end test that sends a real evaluation request to Groq
 * and validates the response through the complete pipeline.
 *
 * Run with:  node backend/test-groq-evaluation-provider.js
 *
 * Requirements:
 *   - GROQ_API_KEY set in backend/.env
 *   - GROQ_MODEL set in backend/.env (or defaults to llama-3.3-70b-versatile)
 */

import dotenv from "dotenv";
dotenv.config();

// Force Groq as the AI provider
process.env.AI_PROVIDER = "groq";
process.env.GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

import { AIConfig } from "./src/modules/interview/providers/AIProvider/config/ai.config.js";
AIConfig.provider = "groq";
AIConfig.groqModel = process.env.GROQ_MODEL;

import { EvaluationContext } from "./src/modules/interview/prompts/EvaluationContext.js";
import { createEvaluationProvider } from "./src/modules/interview/providers/EvaluationProvider/index.js";

// ── Mock EvaluationContext ───────────────────────────────────────────────────

const context = new EvaluationContext({
  interviewConfig: {
    jobRole: "Senior React Developer",
    experienceLevel: "3-5 Years",
    topics: ["React", "JavaScript", "Node.js"],
    duration: 30,
    totalQuestions: 4,
  },
  interviewSummary: {
    answeredQuestions: 4,
    coveredTopics: ["React", "JavaScript", "Node.js"],
    remainingTopics: [],
    startedAt: new Date("2026-07-14T10:00:00Z"),
    endedAt: new Date("2026-07-14T10:28:00Z"),
    totalDurationMinutes: 28,
  },
  transcript: [
    {
      questionId: "q1",
      question:
        "Explain the Virtual DOM in React and why it improves performance.",
      topic: "React",
      difficulty: "Medium",
      answer:
        "The Virtual DOM is a lightweight in-memory representation of the real DOM. When state changes, React creates a new virtual DOM tree, diffs it against the previous one using a heuristic O(n) algorithm, and applies only the minimal set of real DOM mutations. This batching avoids costly direct DOM manipulations.",
    },
    {
      questionId: "q2",
      question: "What are closures in JavaScript? Provide an example.",
      topic: "JavaScript",
      difficulty: "Easy",
      answer:
        "A closure is a function that retains access to variables from its outer lexical scope even after the outer function has returned. For example, a counter factory: function makeCounter() { let count = 0; return () => ++count; }",
    },
    {
      questionId: "q3",
      question: "Explain the event loop in Node.js.",
      topic: "Node.js",
      difficulty: "Medium",
      answer:
        "The event loop allows Node.js to perform non-blocking I/O by offloading operations to the system kernel. It has phases: timers, pending callbacks, idle/prepare, poll, check, and close callbacks. The poll phase waits for new I/O events.",
    },
    {
      questionId: "q4",
      question:
        "What is the difference between useMemo and useCallback in React?",
      topic: "React",
      difficulty: "Medium",
      answer:
        "useMemo memoizes a computed value and recomputes only when dependencies change. useCallback memoizes a function reference so it doesn't get recreated on every render. Both help avoid unnecessary re-renders in child components.",
    },
  ],
});

// ── Run Evaluation ───────────────────────────────────────────────────────────

async function runTest() {
  console.log("\n🧪 GroqEvaluationProvider — Smoke Test\n");
  console.log("──────────────────────────────────────────");

  try {
    // Create provider through the factory
    const provider = createEvaluationProvider("groq");
    console.log(`Provider: ${provider.constructor.name}`);
    console.log("──────────────────────────────────────────\n");

    // Run evaluation
    const startTime = Date.now();
    const result = await provider.evaluate(context);
    const totalMs = Date.now() - startTime;

    // Print results
    console.log("\n══════════════════════════════════════════");
    console.log("  EVALUATION RESULTS");
    console.log("══════════════════════════════════════════\n");

    console.log("📊 Scores:");
    console.log(`   Overall:        ${result.scores.overall}/10`);
    console.log(`   Technical:      ${result.scores.technical}/10`);
    console.log(`   Communication:  ${result.scores.communication}/10`);
    console.log(`   Problem Solving:${result.scores.problemSolving}/10`);
    console.log(`   Confidence:     ${result.scores.confidence}/10`);
    console.log(`   Topic Coverage: ${result.scores.topicCoverage}/10`);

    console.log(`\n🏷️  Recommendation: ${result.recommendation}`);
    console.log(`📝 Reasoning: ${result.reasoning}`);

    console.log(`\n💪 Strengths (${result.strengths.length}):`);
    result.strengths.forEach((s, i) => console.log(`   ${i + 1}. ${s}`));

    console.log(`\n⚠️  Weaknesses (${result.weaknesses.length}):`);
    result.weaknesses.forEach((w, i) => console.log(`   ${i + 1}. ${w}`));

    console.log(
      `\n📋 Question Evaluations (${result.questionEvaluations.length}):`
    );
    result.questionEvaluations.forEach((qe, i) => {
      console.log(
        `   Q${i + 1} [${qe.questionId}]: Technical ${qe.scores.technical}/10 | Communication ${qe.scores.communication}/10`
      );
      console.log(`      Feedback: ${qe.feedback}`);
    });

    console.log("\n──────────────────────────────────────────");
    console.log(`⏱️  Total time: ${totalMs}ms`);
    console.log("──────────────────────────────────────────");

    // Validate structure
    console.log("\n🔍 Structure Verification:");
    console.log(
      `   ✅ scores object: ${typeof result.scores === "object" ? "OK" : "FAIL"}`
    );
    console.log(
      `   ✅ recommendation: ${["STRONG_HIRE", "HIRE", "BORDERLINE", "NO_HIRE", "STRONG_NO_HIRE"].includes(result.recommendation) ? "OK" : "FAIL"}`
    );
    console.log(
      `   ✅ strengths array: ${Array.isArray(result.strengths) ? "OK" : "FAIL"}`
    );
    console.log(
      `   ✅ weaknesses array: ${Array.isArray(result.weaknesses) ? "OK" : "FAIL"}`
    );
    console.log(
      `   ✅ questionEvaluations: ${result.questionEvaluations.length === 4 ? "OK (4 questions)" : `WARN (${result.questionEvaluations.length} questions)`}`
    );

    console.log("\n🎉 Smoke test passed!\n");
  } catch (error) {
    console.error("\n❌ Smoke test failed:");
    console.error(`   Error: ${error.name}: ${error.message}`);
    if (error.validationDetails) {
      console.error(
        "   Details:",
        JSON.stringify(error.validationDetails, null, 2)
      );
    }
    process.exitCode = 1;
  }
}

runTest();
