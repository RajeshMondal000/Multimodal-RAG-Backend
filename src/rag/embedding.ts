import { Chunk } from "../types/chunk";
import { GeminiService } from "../services/GeminiService";

export async function embedChunks(
  gemini: GeminiService,
  chunks: Chunk[]
): Promise<Chunk[]> {
  const embedded: Chunk[] = [];

  for (const chunk of chunks) {
    const embedding = await gemini.createEmbedding(chunk.text);

    embedded.push({
      ...chunk,
      embedding,
    });
  }

  return embedded;
}