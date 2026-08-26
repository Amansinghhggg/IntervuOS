import { ParsingError } from "../errors/ParsingError.js";

/**
 * QuestionResponseParser
 * 
 * Responsible for reliably parsing raw AI text into Javascript objects,
 * extracting JSON from code fences or surrounding text with resilient parsing.
 */
export class QuestionResponseParser {
  /**
   * Parses the text from an AIProviderResponse into a JSON object/array.
   * 
   * @param {import('../providers/AIProvider/AIProviderResponse.js').AIProviderResponse} response
   * @returns {any} The parsed JSON object or array.
   * @throws {ParsingError} If the text cannot be parsed.
   */
  static parse(response) {
    if (!response || typeof response.text !== "string") {
      throw new ParsingError("Invalid AIProviderResponse provided to parser.");
    }

    let text = response.text.trim();

    // 1. Strip markdown code fences (```json ... ```)
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    // 2. Try direct parsing
    try {
      return JSON.parse(text);
    } catch (err) {
      // 3. Extract bracketed JSON { ... } or [ ... ]
      const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (innerErr) {
          // Attempt simple JSON recovery if truncated
          let fixed = jsonMatch[0].trim();
          if (fixed.endsWith('"')) {
            fixed += "}";
          } else if (!fixed.endsWith("}") && !fixed.endsWith("]")) {
            fixed += '"}';
          }
          try {
            return JSON.parse(fixed);
          } catch (fixErr) {
            // Fall through
          }
        }
      }
      throw new ParsingError(`Failed to parse AI response as JSON: ${err.message}`, response.text);
    }
  }
}
