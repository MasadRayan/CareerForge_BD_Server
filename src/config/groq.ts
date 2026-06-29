import Groq from "groq-sdk";
import env from "./env.js";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

// llama-3.1-8b-instant: fastest free-tier model on Groq, ~14 400 req/day.
// If you hit limits, fall back to "gemma2-9b-it" (also free, slightly slower).
export const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

export type GroqChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};


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
