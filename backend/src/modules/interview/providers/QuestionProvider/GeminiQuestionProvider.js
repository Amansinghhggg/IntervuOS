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
 * Orchestrates the sub-second pipeline for generating interview questions
 * with fast token bounding and streamlined validation.
 */
export class GeminiQuestionProvider extends BaseQuestionProvider {
  
  /**
   * Generates the first question for an AI interview.
   * 
   * @param {import('../../services/InterviewConfig.js').InterviewConfig} config 
   * @returns {Promise<Array<Object>>} Validated Question array (length 1).
   */
  async generateFirstQuestion(config) {
    const startTime = Date.now();
    const promptContext = new PromptContext({ config });
    const prompt = QuestionPromptBuilder.buildInitialQuestionsPrompt(promptContext);
    PromptValidator.validateInitialContext(promptContext);
    
    const aiProvider = createAIProvider();
    
    const MAX_RETRIES = 2;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const rawResponse = await aiProvider.generate(prompt, {
          maxTokens: 1000,
          temperature: 0.3,
        });
        
        const parsedJSON = QuestionResponseParser.parse(rawResponse);
        const validatedQuestions = QuestionResponseValidator.validate(parsedJSON);
        
        this._validateDomain(validatedQuestions);
        this._logMetrics(Date.now() - startTime, validatedQuestions.length, "Success", aiProvider.constructor.name);
        return validatedQuestions;
      } catch (error) {
        console.warn(`[GeminiQuestionProvider] Attempt ${attempt} failed: ${error.message}`);
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
    const startTime = Date.now();
    const prompt = QuestionPromptBuilder.buildNextQuestionPrompt(promptContext);
    PromptValidator.validateAdaptiveContext(promptContext);
    
    const aiProvider = createAIProvider();
    const MAX_RETRIES = 2;
    let lastValidCandidate = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        let currentPrompt = prompt;
        if (attempt > 1 && lastValidCandidate) {
          currentPrompt += `\n\n=== REJECTED DUPLICATE (DO NOT GENERATE) ===\n"${lastValidCandidate.question}" (Concept: ${lastValidCandidate.concept})\nGenerate a completely different question on a new concept.`;
        }

        const rawResponse = await aiProvider.generate(currentPrompt, {
          maxTokens: 1000,
          temperature: 0.3,
        });
        
        const parsedJSON = QuestionResponseParser.parse(rawResponse);
        const validatedQuestions = QuestionResponseValidator.validate(parsedJSON);
        
        // Domain Validation
        this._validateDomain(validatedQuestions);

        // Fast Deduplication Check
        const duplicateMatch = this._checkDuplicate(validatedQuestions[0], promptContext);
        if (duplicateMatch && attempt < MAX_RETRIES) {
          console.warn(`⚠️ [GeminiQuestionProvider] Question matched previous: "${duplicateMatch.reason}". Fast single-retry...`);
          lastValidCandidate = validatedQuestions[0];
          continue;
        }
        
        this._logMetrics(Date.now() - startTime, validatedQuestions.length, "Success", aiProvider.constructor.name);
        return validatedQuestions;
      } catch (error) {
        console.warn(`[GeminiQuestionProvider] Next question attempt ${attempt} warning: ${error.message}`);
        if (lastValidCandidate) {
          this._logMetrics(Date.now() - startTime, 1, "Success (Candidate Fallback)", aiProvider ? aiProvider.constructor.name : "Unknown");
          return [lastValidCandidate];
        }
        if (attempt === MAX_RETRIES) {
          this._logMetrics(Date.now() - startTime, 0, `Failure (${error.name})`, aiProvider ? aiProvider.constructor.name : "Unknown");
          throw error;
        }
      }
    }
  }

  /**
   * Checks if a generated question is an exact or near-identical text duplicate of previously asked questions.
   * 
   * @param {Object} candidateQuestion 
   * @param {import('../../prompts/PromptContext.js').PromptContext} promptContext 
   * @returns {{ reason: string }|null}
   */
  _checkDuplicate(candidateQuestion, promptContext) {
    if (!candidateQuestion || !promptContext) return null;

    const exchanges = promptContext.history?.exchanges || [];
    const candQText = (candidateQuestion.question || "").trim();
    const candNorm = this._normalizeText(candQText);

    for (let i = 0; i < exchanges.length; i++) {
      const pastEx = exchanges[i];
      const pastQText = (pastEx.question || "").trim();
      const pastNorm = this._normalizeText(pastQText);

      // 1. Exact string match
      if (candNorm === pastNorm) {
        return { reason: `Exact text match with Q${i + 1}` };
      }

      // 2. High Levenshtein similarity (>85%)
      if (candNorm.length > 15 && pastNorm.length > 15) {
        const levSim = this._levenshteinSimilarity(candNorm, pastNorm);
        if (levSim >= 0.85) {
          return { reason: `High text similarity (${Math.round(levSim * 100)}%) with Q${i + 1}` };
        }
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
      const text = (q.question || "").toLowerCase();
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
    console.log(`⚡ [QuestionProvider] Duration: ${durationMs}ms | Status: ${status} | Provider: ${providerName}`);
  }
}
