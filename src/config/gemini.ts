import { GoogleGenerativeAI } from "@google/generative-ai";
import env from "./env.js";

const MODEL_NAME = "gemini-1.5-flash";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  generationConfig: {
    temperature: 0.4,
    topP: 0.95,
    maxOutputTokens: 4096,
  },
});

export { genAI, model };
export default model;
