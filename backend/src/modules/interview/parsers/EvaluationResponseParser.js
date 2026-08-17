import { ParsingError } from "../errors/ParsingError.js";

/**
 * EvaluationResponseParser
 *
 * Responsible STRICTLY for parsing raw AI evaluation text into JavaScript objects.
 * It trims whitespace, removes markdown code blocks, and runs JSON.parse().
 * It does NOT validate the schema — that is the validator's job.
 *
 * Mirrors QuestionResponseParser for architectural consistency.
 */
export class EvaluationResponseParser {
  /**
   * Parses the text from an AIProviderResponse into a JSON object.
   *
   * @param {import('../providers/AIProvider/AIProviderResponse.js').AIProviderResponse} response
   * @returns {Object} The parsed JSON object.
   * @throws {ParsingError} If the response is invalid or the text cannot be parsed.
   */
  static parse(response) {
    if (!response || typeof response.text !== "string") {
      throw new ParsingError("Invalid AIProviderResponse provided to parser.");
    }

    let text = response.text.trim();

    // 1. Remove reasoning / thinking tags (e.g. <think>...</think>)
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    // 2. Extract JSON from markdown code block if present
    const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (markdownMatch && markdownMatch[1]) {
      text = markdownMatch[1].trim();
    } else {
      // 3. Extract the outermost JSON object if raw text wraps it
      const firstBrace = text.indexOf("{");
      const lastBrace = text.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        text = text.substring(firstBrace, lastBrace + 1).trim();
      }
    }

    // 4. Try standard JSON parse
    try {
      return JSON.parse(text);
    } catch (firstError) {
      // 5. Attempt cleanup of common LLM formatting issues (trailing commas, control chars)
      try {
        const cleaned = text
          .replace(/,\s*([}\]])/g, "$1") // Remove trailing commas
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, " "); // Replace unescaped control chars

        return JSON.parse(cleaned);
      } catch (secondError) {
        throw new ParsingError(
          `Failed to parse AI evaluation response as JSON: ${firstError.message}`,
          response.text
        );
      }
    }
  }
}
