import { PromptValidator } from "./PromptValidator.js";

const QUESTION_PROMPT_VERSION = "v4-fast";

/**
 * QuestionPromptBuilder
 *
 * Generates structured, high-speed, token-efficient prompts for AI interview question generation.
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
      : "general technical topics";

    return [
      `=== SYSTEM ROLE ===`,
      `You are an experienced human technical interviewer. Generate the first interview question.`,
      `Role: ${config.jobRole}`,
      `Topics: ${topicsList}`,
      `Experience Level: ${config.experienceLevel}`,
      `Baseline Difficulty: ${config.difficulty}`,
      config.description ? `Job Description: ${config.description.slice(0, 300)}` : "",
      config.instructions ? `Employer Instructions: ${config.instructions}` : "",
      ``,
      `=== CONSTRAINTS ===`,
      `1. Short, conversational, spoken question (15-25 words max).`,
      `2. No coding exercises, whiteboarding, or syntax puzzles — must be purely answerable verbally.`,
      `3. Calibrate depth strictly for ${config.experienceLevel}.`,
      ``,
      `=== OUTPUT FORMAT (Return ONLY raw JSON) ===`,
      `[`,
      `  {`,
      `    "question": "Crisp verbal question text",`,
      `    "topic": "Exact topic from ${topicsList}",`,
      `    "concept": "Specific concept tested",`,
      `    "difficulty": "${config.difficulty || 'Medium'}",`,
      `    "type": "text",`,
      `    "expectedDuration": 90`,
      `  }`,
      `]`
    ].filter(Boolean).join("\n");
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
      : "general topics";

    const coveredTopics = state.coveredTopics.join(", ") || "None";
    const remainingTopics = state.remainingTopics.join(", ") || topicsList;

    let askedQuestionsSummary = "None yet.";
    if (history.exchanges && history.exchanges.length > 0) {
      askedQuestionsSummary = history.exchanges.map((ex, i) => {
        const ansPreview = (ex.answer || "No answer").replace(/\s+/g, " ").slice(0, 120);
        return `Q${i + 1} (${ex.topic || "Topic"} | ${ex.concept || "Concept"}): "${ex.question}"\nAns summary: ${ansPreview}`;
      }).join("\n");
    }

    return [
      `=== SYSTEM ROLE ===`,
      `You are an adaptive technical interviewer. Generate EXACTLY ONE next question based on the interview progress.`,
      `Role: ${config.jobRole}`,
      `Target Topics: ${topicsList}`,
      `Covered Topics: ${coveredTopics}`,
      `Remaining Topics: ${remainingTopics}`,
      `Candidate Experience Level: ${config.experienceLevel}`,
      `Baseline Difficulty: ${config.difficulty}`,
      `Question Progress: ${state.currentQuestion} of ${state.maxQuestions}`,
      config.instructions ? `Employer Instructions: ${config.instructions}` : "",
      ``,
      `=== PREVIOUS QUESTIONS & ANSWERS (DO NOT REPEAT THESE TOPICS/QUESTIONS) ===`,
      askedQuestionsSummary,
      ``,
      `=== CONSTRAINTS ===`,
      `1. Ask a completely NEW question testing a fresh, unasked concept (prefer remaining topics: ${remainingTopics}).`,
      `2. Keep the question crisp and conversational (15-25 words max) so it sounds natural when spoken out loud.`,
      `3. Voice-only: Do NOT ask candidate to write code or SQL queries. Ask for conceptual explanations, trade-offs, or approaches.`,
      `4. Calibrate depth for ${config.experienceLevel}.`,
      ``,
      `=== OUTPUT FORMAT (Return ONLY raw JSON object) ===`,
      `{`,
      `  "question": "The next concise spoken question text",`,
      `  "topic": "Exact topic name from ${topicsList}",`,
      `  "concept": "Specific concept tested",`,
      `  "difficulty": "Easy | Medium | Hard",`,
      `  "type": "text",`,
      `  "expectedDuration": 90,`,
      `  "reasoning": "One brief sentence explaining why this was chosen"`,
      `}`
    ].filter(Boolean).join("\n");
  }
}