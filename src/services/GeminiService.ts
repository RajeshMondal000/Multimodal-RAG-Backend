import { GoogleGenAI } from "@google/genai";
import {
  CHAT_MODEL,
  EMBEDDING_MODEL,
} from "../config";

export class GeminiService {
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({
      apiKey,
    });
  }

  async createEmbedding(text: string): Promise<number[]> {
    const response = await this.client.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text,
    });

    const embedding = response.embeddings?.[0]?.values;

    if (!embedding) {
      throw new Error("Failed to generate embedding.");
    }

    return embedding;
  }

  async generateAnswer(prompt: string): Promise<string> {
    const response = await this.client.models.generateContent({
      model: CHAT_MODEL,
      contents: prompt,
    });

    return response.text ?? "";
  }
}