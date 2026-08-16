import { PromptValidator } from "./PromptValidator.js";

const QUESTION_PROMPT_VERSION = "v3";

/**
 * QuestionPromptBuilder
 *
 * Generates structured prompt strings for AI-powered interview question generation.
 * Supports both initial batch generation and adaptive single-question generation.
 *
 * Design goals:
 *  - Works across ANY industry/role (engineering, sales, marketing, HR, finance, design, ops, etc.)
 *  - Calibrates question DEPTH AND STYLE to the candidate's real experience level,
 *    not just a difficulty label slapped on an otherwise identical question.
 *  - Produces questions that sound like a real human interviewer asked them out loud,
 *    not a static quiz bank.
 *  - Keeps scope locked to Topics / Job Role / Job Description skills — never the company name.
 *  - Employer custom instructions are a hard override on top of everything else.
 */
export class QuestionPromptBuilder {
  /**
   * Build a prompt to generate the initial batch of interview questions.
   *
   * @param {import('./PromptContext.js').PromptContext} promptContext
   * @returns {string} A structured prompt string.
   */
  static buildInitialQuestionsPrompt(promptContext) {
    PromptValidator.validateInitialContext(promptContext);
    const { config } = promptContext;

    const topicsList = config.topics.length > 0
      ? config.topics.join(", ")
      : "general topics relevant to the role";

    return [
      `=== PROMPT VERSION: ${QUESTION_PROMPT_VERSION} ===`,
      `=== SYSTEM ROLE ===`,
      `You are a senior human interviewer with 15+ years of experience hiring for this exact role.`,
      `You are conducting a real, structured interview — not writing a textbook quiz.`,
      `Every question must sound like something an experienced interviewer would naturally say out loud.`,
      ``,
      `=== EMPLOYER INFORMATION ===`,
      `Company Name: ${config.companyName || "Unknown"} (INFORMATIONAL ONLY — NEVER a source for questions)`,
      ``,
      `=== INTERVIEW INFORMATION ===`,
      `Job Role: ${config.jobRole}`,
      `Topics: ${topicsList}`,
      `Difficulty (baseline): ${config.difficulty}`,
      `Experience Level: ${config.experienceLevel}`,
      `Job Description: ${config.description || "None provided"}`,
      `Duration: ${config.duration} minutes`,
      `Language: ${config.language}`,
      `Interview Type: ${config.interviewType}`,
      config.instructions ? `\n=== EMPLOYER CUSTOM INSTRUCTIONS (HIGHEST PRIORITY) ===\n${config.instructions}\n(These override every other rule below whenever there is a conflict.)` : "",
      ``,
      `=== SCOPE PRIORITY (resolve any conflict in this exact order) ===`,
      `0. Employer Custom Instructions — absolute override. Can add, ban, or narrow anything below.`,
      `1. Topics — the primary source of question content.`,
      `2. Job Role — shapes framing, terminology, and seniority expectations.`,
      `3. Technical/functional skills explicitly named in the Job Description.`,
      `4. Experience Level & Difficulty — governs depth and style, not subject matter.`,
      `5. Company Name — informational only, NEVER a source of question content.`,
      ``,
      `=== HARD SCOPE RULES ===`,
      `1. Never infer technologies, tools, or focus areas from the employer's business name or industry.`,
      `2. Generate questions ONLY from the configured Topics, Job Role, and skills found in the Job Description.`,
      `3. NEVER ask HR, company-culture, salary, or generic "tell me about yourself" questions unless a Topic explicitly calls for it.`,
      `4. Use the Job Description only to identify concrete skills/tools to probe — never as a source of company trivia.`,
      `5. Distribute questions evenly across ALL listed Topics before going deep on any single one.`,
      `6. Ask the question directly. No filler like "Great, let's move on" or "I'd like to ask you about...".`,
      ``,
      ...QuestionPromptBuilder.#buildExperienceCalibration(config),
      ...QuestionPromptBuilder.#buildRealisticPhrasingGuidance(),
      ...QuestionPromptBuilder.#buildVoiceConstraints(),
      `=== OUTPUT FORMAT ===`,
      `Return a JSON array of question objects. Each object must have exactly the following structure (do NOT generate an id field):`,
      ``,
      `[`,
      `  {`,
      `    "question": "The full concise question text, phrased the way a real interviewer would say it out loud",`,
      `    "topic": "Must be copied EXACTLY (verbatim, same casing) from the Topics list above",`,
      `    "concept": "The specific granular concept tested within that topic (e.g. Virtual DOM, Closures) — never identical to the topic itself",`,
      `    "difficulty": "Easy | Medium | Hard",`,
      `    "type": "text",`,
      `    "expectedDuration": 120`,
      `  }`,
      `]`,
      ``,
      `Rules for the fields above:`,
      `- "topic" MUST be one of the exact strings from the Topics list — this is used programmatically to track coverage, so it cannot be paraphrased, abbreviated, or invented.`,
      `- "expectedDuration" is in seconds and should realistically reflect how long a thoughtful spoken answer takes: Easy ≈ 45-90s, Medium ≈ 90-150s, Hard ≈ 150-240s.`,
      `- Vary difficulty naturally across the set (e.g. a slightly easier warm-up question, then building around the baseline) instead of making every question identical — but never drift outside what's appropriate for the stated Experience Level.`,
      ``,
      `IMPORTANT: Return ONLY valid, raw JSON. Do NOT wrap the JSON in markdown code blocks (e.g. no \`\`\`json). Do NOT provide any conversational text or explanations. Your entire response must be parseable by JSON.parse().`,
    ].join("\n");
  }

  /**
   * Build a prompt to generate the single next question adaptively based on context.
   *
   * @param {import('./PromptContext.js').PromptContext} promptContext
   * @returns {string} A structured prompt string.
   */
  static buildNextQuestionPrompt(promptContext) {
    PromptValidator.validateAdaptiveContext(promptContext);
    const { config, state, history } = promptContext;

    const topicsList = config.topics.length > 0
      ? config.topics.join(", ")
      : "general topics relevant to the role";

    const coveredList = state.coveredTopics.length > 0
      ? state.coveredTopics.join(", ")
      : "none yet";

    const remainingList = state.remainingTopics.length > 0
      ? state.remainingTopics.join(", ")
      : "none";

    const conceptsList = state.coveredConcepts.length > 0
      ? state.coveredConcepts.join(", ")
      : "none yet";

    const difficultyHistoryStr = state.difficultyHistory.length > 0
      ? state.difficultyHistory.join(" -> ")
      : "None";

    const topicDistStr = Object.entries(state.topicDistribution || {})
      .map(([t, count]) => `${t}: ${count}`)
      .join(", ");

    let exchangeContext = "No previous exchanges.";
    let askedQuestionsBlock = "None yet.";

    if (history.exchanges && history.exchanges.length > 0) {
      exchangeContext = history.exchanges.map((ex, i) =>
        `Q${i + 1} (${ex.difficulty || "Unknown"} | ${ex.topic || "Unknown"} | Concept: ${ex.concept || "Unknown"}): ${ex.question}\nAnswer: ${ex.answer || "(No answer provided)"}`
      ).join("\n\n");

      askedQuestionsBlock = history.exchanges.map((ex, i) =>
        `${i + 1}. "${ex.question}" (Topic: ${ex.topic || 'Unknown'}, Concept: ${ex.concept || 'Unknown'})`
      ).join("\n");
    }

    return [
      `=== PROMPT VERSION: ${QUESTION_PROMPT_VERSION} ===`,
      `=== SYSTEM ROLE ===`,
      `You are a senior human interviewer conducting a live, adaptive interview.`,
      `You must generate EXACTLY ONE next question, the way a real interviewer would decide what to ask next based on how the candidate has performed so far.`,
      ``,
      `=== EMPLOYER INFORMATION ===`,
      `Company Name: ${config.companyName || "Unknown"} (INFORMATIONAL ONLY — NEVER a source for questions)`,
      ``,
      `=== INTERVIEW CONTEXT ===`,
      `Role: ${config.jobRole}`,
      `Topics: ${topicsList}`,
      `Experience Level: ${config.experienceLevel}`,
      `Job Description: ${config.description || "None provided"}`,
      `Expected Baseline Difficulty: ${config.difficulty}`,
      `Language: ${config.language}`,
      `Remaining Time: ${state.remainingTime} minutes`,
      `Current Question Number: ${state.currentQuestion} out of ${state.maxQuestions}`,
      config.instructions ? `\n=== EMPLOYER CUSTOM INSTRUCTIONS (HIGHEST PRIORITY) ===\n${config.instructions}\n(These override every other rule below whenever there is a conflict.)` : "",
      ``,
      `=== STRICT DO NOT REPEAT LIST (CRITICAL - ZERO REPETITIONS ALLOWED) ===`,
      `The following questions and concepts have ALREADY been asked in this interview session:`,
      askedQuestionsBlock,
      `RULES FOR AVOIDANCE:`,
      `- You MUST NOT ask any of the questions listed above.`,
      `- You MUST NOT rephrase, paraphrase, or slightly modify any of the questions above.`,
      `- You MUST NOT test any concept or sub-concept that was already covered above.`,
      `- You MUST select a completely fresh, unasked concept from the required Topics.`,
      ``,
      `=== PROGRESS & COVERAGE ===`,
      `Required Topics: ${topicsList}`,
      `Topic Distribution (Asked count): ${topicDistStr}`,
      `Topics Already Covered: ${coveredList}`,
      `Remaining Topics to Cover: ${remainingList}`,
      `Specific Concepts Already Covered: ${conceptsList}`,
      `Difficulty Progression So Far: ${difficultyHistoryStr}`,
      ``,
      `=== FULL CONVERSATION HISTORY ===`,
      `Review the past exchanges the way a real interviewer would — judge depth of understanding, not just correctness, and let it steer your next move.`,
      exchangeContext,
      ``,
      `=== SCOPE PRIORITY (resolve any conflict in this exact order) ===`,
      `0. Employer Custom Instructions — absolute override.`,
      `1. Topics | 2. Job Role | 3. Technical/functional skills from the Job Description | 4. Experience Level & Difficulty (depth only) | 5. Company Name (never a topic source).`,
      ``,
      `=== HARD SCOPE & ADAPTATION RULES ===`,
      `1. Never infer technologies or focus areas from the employer's business name.`,
      `2. NEVER ask HR, company-culture, salary, or generic questions unless a Topic explicitly calls for it.`,
      `3. ABSOLUTE ZERO REPETITION: Never repeat, rephrase, or ask a variant of any question from the STRICT DO NOT REPEAT LIST above.`,
      `4. ZERO CONCEPT DUPLICATION: Every question must test a distinct, unique concept. Do NOT re-test or probe the same concept that was already asked.`,
      `5. Rotate evenly across all configured Topics (${topicsList}) to ensure broad and balanced coverage.`,
      `6. Adapt difficulty from the Expected Baseline (${config.difficulty}): move up when the candidate is clearly strong, ease off temporarily when they struggle. CRITICAL: You MUST set the 'difficulty' field in your JSON output to match the ACTUAL difficulty of the question you just generated (Easy, Medium, or Hard) rather than blindly echoing the baseline.`,
      `7. Keep it to ONE question, phrased the way a real interviewer would ask it in the moment — concise, natural, and directly relevant to the role.`,
      `8. CRITICAL: Depth must strictly match the Experience Level (${config.experienceLevel}). Do not default to a "safe" Medium question for a Fresher, and do not under-challenge a 5+ Years candidate.`,
      `9. If the candidate's last answer revealed a specific gap or a specific strength, let that guide which unasked concept or topic you explore next.`,
      ``,
      ...QuestionPromptBuilder.#buildExperienceCalibration(config),
      ...QuestionPromptBuilder.#buildRealisticPhrasingGuidance(),
      ...QuestionPromptBuilder.#buildVoiceConstraints(),
      `=== OUTPUT FORMAT ===`,
      `Return a single JSON object representing the next question (do NOT generate an id field):`,
      ``,
      `{`,
      `  "question": "The concise next question text, phrased the way a real interviewer would say it out loud",`,
      `  "topic": "Must be copied EXACTLY (verbatim, same casing) from the Topics list above",`,
      `  "concept": "The specific granular concept tested within that topic (e.g. Virtual DOM, Closures)",`,
      `  "difficulty": "Easy | Medium | Hard",`,
      `  "type": "text",`,
      `  "expectedDuration": 120,`,
      `  "reasoning": "One sentence on why this question, topic, and difficulty were chosen right now"`,
      `}`,
      ``,
      `Rules for the fields above:`,
      `- "topic" MUST be one of the exact strings from the Topics list.`,
      `- "expectedDuration" is in seconds: Easy ≈ 45-90s, Medium ≈ 90-150s, Hard ≈ 150-240s.`,
      ``,
      `IMPORTANT: Return ONLY valid, raw JSON. Do NOT wrap the JSON in markdown code blocks (e.g. no \`\`\`json). Do NOT provide any conversational text or explanations. Your entire response must be parseable by JSON.parse().`,
    ].join("\n");
  }

  /**
   * Experience-level calibration so difficulty isn't just a label — it changes
   * WHAT KIND of question gets asked, mirroring how real interviews scale.
   * Works for technical and non-technical roles alike.
   */
  static #buildExperienceCalibration(config) {
    const bands = {
      "Fresher": `Focus heavily on core technical fundamentals, foundational definitions, syntax mechanics, and basic problem solving. Keep questions short, clear, and direct without complex architectural scenarios.`,
      "1-2 Years": `Combine core technical fundamentals with concise practical questions. Ask how they have implemented features, handled common errors, or chosen between two straightforward approaches in their codebase.`,
      "3-5 Years": `Test technical judgment, code organization, and performance trade-offs. Ask about design patterns, state management trade-offs, query optimization, and maintainability.`,
      "5+ Years": `Test strategic, system-level architecture and scaling trade-offs. Ask about high-concurrency design, microservices vs monolith, database partitioning, and technical leadership decisions.`,
    };

    const currentBand = bands[config.experienceLevel] || bands["1-2 Years"];

    return [
      `=== EXPERIENCE-LEVEL CALIBRATION ===`,
      `Reference — how depth and focus progress across experience levels:`,
      `- Fresher: ${bands["Fresher"]}`,
      `- 1-2 Years: ${bands["1-2 Years"]}`,
      `- 3-5 Years: ${bands["3-5 Years"]}`,
      `- 5+ Years: ${bands["5+ Years"]}`,
      ``,
      `THIS candidate is at: ${config.experienceLevel}. Calibrate every question to that band specifically: ${currentBand}`,
      `CRITICAL RULE FOR FRESHERS: Prioritize core fundamentals, fundamental mechanics, and basic concepts.`,
      ``,
    ];
  }

  /**
   * Guidance so questions sound like a real interviewer asked them,
   * keeping them concise, punchy, and natural.
   */
  static #buildRealisticPhrasingGuidance() {
    return [
      `=== HIGH-FREQUENCY & VERBALLY ARTICULATED INTERVIEW QUESTIONS (CRITICAL) ===`,
      `1. FOCUS ON HIGH-FREQUENCY & COMMON INTERVIEW QUESTIONS:`,
      `   - Generate standard, high-value questions commonly asked in real 45-minute technical hiring interviews (e.g. Virtual DOM, useEffect vs useMemo, Closures, Event Loop, Debouncing vs Throttling, State Management trade-offs, Indexing in Databases, REST vs GraphQL, etc.).`,
      `   - DO NOT generate obscure niche trivia, bizarre trick questions, or unsearchable edge cases that real interviewers rarely ask.`,
      ``,
      `2. EASY TO EXPLAIN VERBALLY & OUT LOUD:`,
      `   - Questions MUST be structured so a candidate can easily structure and articulate their spoken response in 60-120 seconds without needing a pen, paper, or code editor.`,
      `   - Best Spoken Formats:`,
      `     * Compare & Contrast: "What is the difference between [Concept X] and [Concept Y]?"`,
      `     * Under-the-hood Mechanism: "How does [Feature] work under the hood in [Technology]?"`,
      `     * When to Use / Trade-offs: "When would you use [Approach A] over [Approach B]?"`,
      `     * Practical Strategy: "How do you handle [Common Scenario] in your applications?"`,
      ``,
      `3. KEEP QUESTIONS SHORT, PUNCHY & DIRECT (MAX 12-20 WORDS):`,
      `   - DO NOT write wordy, 4-sentence paragraph scenarios.`,
      `   - Ask crisp, direct questions that sound natural when spoken out loud by an AI interviewer: e.g. "What is debouncing in JavaScript and when would you use it?" instead of long scenario setups.`,
      ``,
    ];
  }

  /**
   * Voice-only constraints: nothing that requires typing, writing, drawing,
   * or producing an artifact — regardless of industry. Examples adapt to
   * whether the role is technical or not, but the underlying rule is universal.
   */
  static #buildVoiceConstraints() {
    return [
      `=== VOICE-ONLY INTERVIEW CONSTRAINTS (CRITICAL) ===`,
      `This interview is conducted entirely through voice. The candidate:`,
      `- Cannot type, write, draw, or use any editor, whiteboard, spreadsheet, or design tool.`,
      `- Cannot execute programs or produce any written artifact.`,
      `- Must answer only by speaking.`,
      ``,
      `Every generated question MUST be answerable verbally, by explanation or discussion — never by producing an artifact.`,
      ``,
      `--- If the role is technical/engineering (e.g. software, data, QA, DevOps) ---`,
      `NEVER ask the candidate to write or produce code. This includes any question implying: write, code, implement, build the function, write SQL, write a query, write HTML/CSS, syntax, coding exercise, live coding, whiteboard, pseudocode, algorithm implementation, code snippet.`,
      `Instead, ask them to explain the approach, structure, trade-offs, or reasoning verbally.`,
      `  ✗ Write a React functional component for a User Profile.`,
      `  ✓ Walk me through how you'd structure a reusable UserProfile component — what props, state, and hooks would you use, and why?`,
      `  ✗ Write a SQL query to find duplicate emails.`,
      `  ✓ Explain the approaches you'd use to identify duplicate email records in a relational database, and the performance trade-offs between them.`,
      ``,
      `--- If the role is non-technical (e.g. Sales, Marketing, HR, Finance, Operations, Design, Product, Support) ---`,
      `NEVER ask the candidate to draft or produce a deliverable (an email, a proposal, a mockup, a spreadsheet formula, ad copy, a campaign brief, etc.).`,
      `Instead, ask them to explain their approach, reasoning, or walk through a real past experience verbally.`,
      `  ✗ Write a cold outreach email to a prospect.`,
      `  ✓ Walk me through how you'd approach a cold outreach message to a prospect who's gone quiet — what would you say and why?`,
      ``,
      `If a question you're about to generate would require the candidate to type, write, or draw anything, discard it and rephrase it as a verbal reasoning or experience-based question instead.`,
      ``,
    ];
  }
}