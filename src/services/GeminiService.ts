import { uint8ArrayToBase64 } from "../utils/base64";
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

  async analyzeImage(file: File): Promise<string> {

    const bytes = new Uint8Array(
      await file.arrayBuffer()
    );

    const response = await this.client.models.generateContent({
      model: CHAT_MODEL,

      contents: [
        {
          inlineData: {
            mimeType: file.type,
            data: uint8ArrayToBase64(bytes),
          },
        },

        {
          text: `
                  You are preparing an image for a Retrieval-Augmented Generation (RAG) system.

                  Extract all useful information.

                  Include:

                  - Visible text
                  - OCR
                  - Tables
                  - Charts
                  - Graphs
                  - Diagrams
                  - UI components
                  - Flowcharts
                  - Objects
                  - Relationships
                  - Important numbers
                  - Labels
                  - Captions

                  Return only a structured textual description suitable for semantic search.
                  `
        }
      ]
    });

    return response.text ?? "";
  }
}