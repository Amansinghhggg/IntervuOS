import { GeminiQuestionProvider } from "./src/modules/interview/providers/QuestionProvider/GeminiQuestionProvider.js";

const provider = new GeminiQuestionProvider();

console.log("=== TEST 1: Deduplication Logic in GeminiQuestionProvider ===");

const promptContext = {
  config: {
    topics: ["React", "JavaScript"],
    difficulty: "Medium",
    experienceLevel: "Fresher"
  },
  state: {
    coveredConcepts: ["virtual dom", "closures"],
    currentQuestion: 3
  },
  history: {
    exchanges: [
      {
        question: "Explain the Virtual DOM and how it improves performance in React.",
        topic: "React",
        concept: "Virtual DOM",
        difficulty: "Easy",
        answer: "It creates a copy of DOM in memory."
      },
      {
        question: "What are Closures in JavaScript and how do they work?",
        topic: "JavaScript",
        concept: "Closures",
        difficulty: "Medium",
        answer: "A function bundled with its lexical environment."
      }
    ]
  }
};

// Case 1: Exact text match
const duplicateExact = provider._checkDuplicate(
  { question: "Explain the Virtual DOM and how it improves performance in React.", topic: "React", concept: "Virtual DOM Diffing" },
  promptContext
);
console.log("Case 1 (Exact Match):", duplicateExact ? "PASS (Detected)" : "FAIL", duplicateExact?.reason);

// Case 2: Near duplicate / high keyword overlap
const duplicateParaphrase = provider._checkDuplicate(
  { question: "Can you explain how Virtual DOM works and improves performance in React?", topic: "React", concept: "DOM Performance" },
  promptContext
);
console.log("Case 2 (Paraphrase Overlap):", duplicateParaphrase ? "PASS (Detected)" : "FAIL", duplicateParaphrase?.reason);

// Case 3: Duplicate concept already covered
const duplicateConcept = provider._checkDuplicate(
  { question: "What is lexical scoping and how does it retain outer variables?", topic: "JavaScript", concept: "Closures" },
  promptContext
);
console.log("Case 3 (Concept Collision):", duplicateConcept ? "PASS (Detected)" : "FAIL", duplicateConcept?.reason);

// Case 4: Brand new, valid non-duplicate question
const uniqueQuestion = provider._checkDuplicate(
  { question: "What is the difference between state and props in React?", topic: "React", concept: "State vs Props" },
  promptContext
);
console.log("Case 4 (Unique Question):", uniqueQuestion === null ? "PASS (Allowed)" : "FAIL", uniqueQuestion?.reason);

if (duplicateExact && duplicateParaphrase && duplicateConcept && uniqueQuestion === null) {
  console.log("\n>>> ALL DEDUPLICATION TESTS PASSED SUCCESSFULLY! <<<\n");
} else {
  console.error("\n>>> SOME TESTS FAILED! <<<\n");
  process.exit(1);
}
