import Groq from "groq-sdk";
import env from "./env.js";

/**
 * Groq SDK singleton + reusable chat helpers.
 *
 * The Groq API is OpenAI-compatible (`chat.completions.create`), so
 * downstream modules can swap in/out without touching the SDK surface.
 *
 * Default model is `openai/gpt-oss-20b` (free tier, large context,
 * reliable structured JSON output). Override per-call by passing
 * `model` to `groqChatCompletion`.
 */

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-20b";

export type GroqChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/**
 * Runs a chat completion against Groq and returns the assistant message
 * content as a string. Throws the raw SDK error on transport/API failure
 * so callers can wrap it with their own logging.
 */
export const groqChatCompletion = async (
  messages: GroqChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {},
): Promise<string> => {
  const completion = await groq.chat.completions.create({
    messages,
    model: options.model ?? DEFAULT_GROQ_MODEL,
    temperature: options.temperature ?? 0.4,
    max_tokens: options.maxTokens ?? 4096,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Groq returned an empty completion");
  }
  return content;
};

/**
 * Convenience wrapper kept for any callers that want the default
 * "explain fast language models" probe. Not used by app code.
 */
export async function getGroqChatCompletion() {
  return groqChatCompletion([
    {
      role: "user",
      content: "Explain the importance of fast language models",
    },
  ]);
}

export async function main() {
  const content = await getGroqChatCompletion();
  console.log(content);
}

export { groq };
export default groq;
