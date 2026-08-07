import AppError from "./AppError.js";

/**
 * Best-effort extraction of a JSON object from an LLM response.
 * Tries plain JSON, fenced code blocks, then a brace slice.
 * Throws an AppError(502) when nothing parseable is found.
 */
export const extractJsonObject = (raw: string): unknown => {
  const cleaned = raw.trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // fall through
  }

  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      // fall through
    }
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    } catch {
      // fall through
    }
  }

  throw new AppError("AI returned a non-JSON response", 502);
};
