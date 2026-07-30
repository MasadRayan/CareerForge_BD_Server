import Groq from "groq-sdk";
declare const groq: Groq;
export declare const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";
export type GroqChatMessage = {
    role: "system" | "user" | "assistant";
    content: string;
};
export declare const groqChatCompletion: (messages: GroqChatMessage[], options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
}) => Promise<string>;
export declare function getGroqChatCompletion(): Promise<string>;
export declare function main(): Promise<void>;
export { groq };
export default groq;
//# sourceMappingURL=groq.d.ts.map