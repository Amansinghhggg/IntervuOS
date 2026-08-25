import dotenv from "dotenv";
dotenv.config();

import { GeminiProvider } from "./src/modules/interview/providers/AIProvider/GeminiProvider.js";

// ==========================================
// ✍️ ENTER YOUR PROMPT HERE:
// ==========================================
let text = "Explain what React Virtual DOM is in 2 simple sentences.";

// ==========================================
// RUNNER LOGIC
// ==========================================
async function runTest() {
  // If user passes command line arguments (e.g. node prompttest.js "my custom prompt"), use that instead
  const cliArgs = process.argv.slice(2).join(" ").trim();
  const promptToRun = cliArgs || text;

  console.log("\n=======================================================");
  console.log("🤖 Gemini Prompt Tester");
  console.log("=======================================================");
  console.log(`📌 Model:   ${process.env.GEMINI_MODEL || "gemini-3.6-flash"}`);
  console.log(`💬 Prompt:  "${promptToRun}"`);
  console.log("-------------------------------------------------------\n");
  console.log("⏳ Generating response from Gemini...\n");

  const startTime = Date.now();
  try {
    const provider = new GeminiProvider();
    const result = await provider.generate(promptToRun);
    const duration = Date.now() - startTime;

    console.log("📄 Response:");
    console.log("-------------------------------------------------------");
    console.log(result.text);
    console.log("-------------------------------------------------------");
    console.log(`⚡ Completed in ${duration}ms\n`);
  } catch (error) {
    console.error("❌ Error generating response:", error.message);
  }
}

runTest();
