import { BaseQuestionProvider } from "./BaseQuestionProvider.js";
import { PromptContext } from "../../prompts/PromptContext.js";
import { QuestionPromptBuilder } from "../../prompts/QuestionPromptBuilder.js";
import { PromptValidator } from "../../prompts/PromptValidator.js";
import { createAIProvider } from "../AIProvider/index.js";
import { QuestionResponseParser } from "../../parsers/QuestionResponseParser.js";
import { QuestionResponseValidator } from "../../validators/QuestionResponseValidator.js";

/**
 * GeminiQuestionProvider
 * 
 * Orchestrates the complete pipeline for generating interview questions
 * using the Gemini AI provider.
 * 
 * Pipeline:
 * config -> PromptContext -> Builder -> Validator -> AIProvider -> Parser -> Validator -> Question[]
 */
export class GeminiQuestionProvider extends BaseQuestionProvider {
  
  /**
   * Generates the first question for an AI interview.
   * 
   * @param {import('../../services/InterviewConfig.js').InterviewConfig} config 
   * @returns {Promise<Array<Object>>} Validated Question array (length 1).
   */
  async generateFirstQuestion(config) {
    console.log("\nInterviewEngine\n→ GeminiQuestionProvider\n");
    const startTime = Date.now();
    const promptContext = new PromptContext({ config });
    
    // Phase 6 Debug Logging
    console.log("=== PROMPT CONTEXT (DEBUG) ===");
    console.log(JSON.stringify({
      companyName: config.companyName,
      jobRole: config.jobRole,
      topics: config.topics,
      description: config.description,
      experienceLevel: config.experienceLevel
    }, null, 2));
    
    const prompt = QuestionPromptBuilder.buildInitialQuestionsPrompt(promptContext);
    
    PromptValidator.validateInitialContext(promptContext);
    console.log("GeminiQuestionProvider\n→ Prompt Generated\n");
    
    const aiProvider = createAIProvider();
    
    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`GeminiProvider\n→ Sending Request (Attempt ${attempt})\n`);
        const rawResponse = await aiProvider.generate(prompt);
        console.log("GeminiProvider\n→ Response Received\n");
        
        const parsedJSON = QuestionResponseParser.parse(rawResponse);
        console.log("QuestionResponseParser\n→ Parsed Successfully\n");
        
        const validatedQuestions = QuestionResponseValidator.validate(parsedJSON);
        console.log("QuestionResponseValidator\n→ Validation Passed\n");
        
        // Domain Validation
        this._validateDomain(validatedQuestions);
        console.log("DomainValidator\n→ Domain Validation Passed\n");
        
        this._logMetrics(Date.now() - startTime, validatedQuestions.length, "Success", aiProvider.constructor.name);
        return validatedQuestions;
      } catch (error) {
        console.warn(`[Attempt ${attempt} Failed]: ${error.message}`);
        if (attempt === MAX_RETRIES) {
          this._logMetrics(Date.now() - startTime, 0, `Failure (${error.name})`, aiProvider ? aiProvider.constructor.name : "Unknown");
          throw error;
        }
      }
    }
  }

  /**
   * Generates the next adaptive question based on the history.
   * 
   * @param {import('../../prompts/PromptContext.js').PromptContext} promptContext 
   * @returns {Promise<Array<Object>>} Validated Question array (length 1).
   */
  async generateNextQuestion(promptContext) {
    console.log("\nInterviewEngine\n→ GeminiQuestionProvider\n");
    const startTime = Date.now();
    
    // Phase 6 Debug Logging
    console.log("=== PROMPT CONTEXT (DEBUG) ===");
    console.log(JSON.stringify({
      companyName: promptContext.config.companyName,
      jobRole: promptContext.config.jobRole,
      topics: promptContext.config.topics,
      description: promptContext.config.description,
      experienceLevel: promptContext.config.experienceLevel
    }, null, 2));

    let prompt = QuestionPromptBuilder.buildNextQuestionPrompt(promptContext);
    
    PromptValidator.validateAdaptiveContext(promptContext);
    console.log("GeminiQuestionProvider\n→ Prompt Generated\n");
    
    const aiProvider = createAIProvider();
    
    const MAX_RETRIES = 3;
    let rejectedQuestions = [];

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        let currentPrompt = prompt;
        if (rejectedQuestions.length > 0) {
          const rejectedList = rejectedQuestions.map((rq, idx) => `${idx + 1}. "${rq.question}" (Concept: ${rq.concept})`).join("\n");
          currentPrompt += `\n\n=== REJECTED ATTEMPTS (DO NOT GENERATE THESE OR SIMILAR) ===\nThe following question(s) were generated in prior attempts and REJECTED for being duplicates or too similar to previously asked questions:\n${rejectedList}\nYou MUST generate a completely different question on a totally new concept.`;
        }

        console.log(`GeminiProvider\n→ Sending Request (Attempt ${attempt})\n`);
        const rawResponse = await aiProvider.generate(currentPrompt);
        console.log("GeminiProvider\n→ Response Received\n");
        
        const parsedJSON = QuestionResponseParser.parse(rawResponse);
        console.log("QuestionResponseParser\n→ Parsed Successfully\n");
        
        const validatedQuestions = QuestionResponseValidator.validate(parsedJSON);
        console.log("QuestionResponseValidator\n→ Validation Passed\n");
        
        // Domain Validation
        this._validateDomain(validatedQuestions);
        console.log("DomainValidator\n→ Domain Validation Passed\n");

        // Deduplication & Similarity Validation against entire session history
        const duplicateMatch = this._checkDuplicate(validatedQuestions[0], promptContext);
        if (duplicateMatch) {
          console.warn(`⚠️ [GeminiQuestionProvider] Rejected duplicate question: "${validatedQuestions[0].question}" (Matches previous question/concept: "${duplicateMatch.reason}")`);
          rejectedQuestions.push(validatedQuestions[0]);
          throw new Error(`Deduplication Failed: Question is too similar to already asked question ("${duplicateMatch.reason}")`);
        }
        console.log("DeduplicationValidator\n→ Zero Duplicate Validation Passed\n");
        
        this._logMetrics(Date.now() - startTime, validatedQuestions.length, "Success", aiProvider.constructor.name);
        return validatedQuestions;
      } catch (error) {
        console.warn(`[Attempt ${attempt} Failed]: ${error.message}`);
        if (attempt === MAX_RETRIES) {
          // If all retries failed specifically on deduplication, return the last validated question with fallback modifications
          if (rejectedQuestions.length > 0 && error.message.startsWith("Deduplication Failed")) {
            console.warn("[GeminiQuestionProvider] Max retries reached with deduplication warning. Returning best available candidate.");
            const fallbackQ = rejectedQuestions[rejectedQuestions.length - 1];
            this._logMetrics(Date.now() - startTime, 1, "Success (Fallback)", aiProvider ? aiProvider.constructor.name : "Unknown");
            return [fallbackQ];
          }
          this._logMetrics(Date.now() - startTime, 0, `Failure (${error.name})`, aiProvider ? aiProvider.constructor.name : "Unknown");
          throw error;
        }
      }
    }
  }

  /**
   * Checks if a generated question is duplicate or conceptually too similar to previously asked questions.
   * 
   * @param {Object} candidateQuestion 
   * @param {import('../../prompts/PromptContext.js').PromptContext} promptContext 
   * @returns {{ reason: string }|null}
   */
  _checkDuplicate(candidateQuestion, promptContext) {
    if (!candidateQuestion || !promptContext) return null;

    const exchanges = promptContext.history?.exchanges || [];
    const coveredConcepts = (promptContext.state?.coveredConcepts || []).map(c => (c || "").trim().toLowerCase()).filter(Boolean);

    const candQText = (candidateQuestion.question || "").trim();
    const candNorm = this._normalizeText(candQText);
    const candTokens = this._extractKeyTokens(candNorm);
    const candConcept = (candidateQuestion.concept || "").trim().toLowerCase();

    // 1. Concept collision check
    if (candConcept && candConcept !== "unknown" && candConcept !== "custom" && candConcept !== "general") {
      if (coveredConcepts.includes(candConcept)) {
        return { reason: `Duplicate concept '${candConcept}' already covered in session` };
      }
    }

    for (let i = 0; i < exchanges.length; i++) {
      const pastEx = exchanges[i];
      const pastQText = (pastEx.question || "").trim();
      const pastNorm = this._normalizeText(pastQText);
      const pastTokens = this._extractKeyTokens(pastNorm);
      const pastConcept = (pastEx.concept || "").trim().toLowerCase();

      // 1b. Concept match against previous exchange
      if (candConcept && pastConcept && candConcept === pastConcept && candConcept !== "unknown" && candConcept !== "custom") {
        return { reason: `Identical concept '${candConcept}' as Q${i + 1}` };
      }

      // 2. Exact or near-exact string match
      if (candNorm === pastNorm) {
        return { reason: `Exact text match with Q${i + 1}` };
      }

      // 3. Substring containment (>75% length)
      if (candNorm.length > 20 && pastNorm.length > 20) {
        if (candNorm.includes(pastNorm) || pastNorm.includes(candNorm)) {
          return { reason: `Direct substring match with Q${i + 1}` };
        }
      }

      // 4. Token Overlap (Jaccard and directional overlap)
      if (candTokens.length > 0 && pastTokens.length > 0) {
        const candSet = new Set(candTokens);
        const pastSet = new Set(pastTokens);
        
        let intersection = 0;
        for (const token of candSet) {
          if (pastSet.has(token)) intersection++;
        }

        const union = new Set([...candTokens, ...pastTokens]).size;
        const jaccard = union > 0 ? intersection / union : 0;
        const directionalOverlap = Math.min(candSet.size, pastSet.size) > 0 
          ? intersection / Math.min(candSet.size, pastSet.size) 
          : 0;

        if (jaccard >= 0.50 || (directionalOverlap >= 0.65 && intersection >= 3)) {
          return { reason: `High keyword overlap (${Math.round(directionalOverlap * 100)}%) with Q${i + 1}: "${pastQText}"` };
        }
      }

      // 5. Normalized Levenshtein similarity
      const levSim = this._levenshteinSimilarity(candNorm, pastNorm);
      if (levSim >= 0.65) {
        return { reason: `High edit similarity (${Math.round(levSim * 100)}%) with Q${i + 1}: "${pastQText}"` };
      }
    }

    return null;
  }

  _normalizeText(str) {
    return (str || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  _extractKeyTokens(normalizedStr) {
    const stopwords = new Set([
      "what", "is", "are", "the", "a", "an", "in", "on", "of", "and", "or", "to", "for", "with",
      "how", "does", "do", "did", "explain", "describe", "can", "you", "could", "should", "would",
      "difference", "between", "when", "why", "which", "use", "using", "used", "work", "works",
      "working", "tell", "me", "about", "give", "example", "please", "briefly", "understanding",
      "mean", "means", "define", "concept"
    ]);

    return normalizedStr
      .split(" ")
      .filter(w => w.length > 2 && !stopwords.has(w));
  }

  _levenshteinSimilarity(s1, s2) {
    if (!s1 || !s2) return 0;
    if (s1 === s2) return 1;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;

    const costs = [];
    for (let i = 0; i <= longer.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= shorter.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[shorter.length] = lastValue;
    }

    const editDistance = costs[shorter.length];
    return (longerLength - editDistance) / longerLength;
  }

  /**
   * Validates that the generated questions do not belong to prohibited domains.
   */
  _validateDomain(questions) {
    const forbiddenKeywords = ["consultancy", "it solution", "hr department", "sales strategy", "business strategy", "marketing strategy"];
    
    for (const q of questions) {
      const text = q.question.toLowerCase();
      for (const keyword of forbiddenKeywords) {
        if (text.includes(keyword)) {
          throw new Error(`Domain Validation Failed: Question contains prohibited keyword '${keyword}'`);
        }
      }
    }
  }

  /**
   * Logs performance and status metrics safely for debugging.
   */
  _logMetrics(durationMs, questionCount, status, providerName) {
    const generationMetadata = {
      provider: providerName,
      model: "gemini", // Hardcoded for this specific provider
      generatedAt: new Date().toISOString(),
      latencyMs: durationMs,
      status: status
    };
    console.log(`[Metrics] Provider: GeminiQuestionProvider | Questions Generated: ${questionCount}`);
    console.log(`[Generation Metadata] ${JSON.stringify(generationMetadata, null, 2)}`);
  }
}
