import { Chunk } from "../types/chunk";
import { embedChunks } from "./embedding";
import { GeminiService } from "../services/GeminiService";
import { QdrantService } from "../services/QdrantService";

export async function ingestChunks(
    gemini: GeminiService,
    qdrant: QdrantService,
    chunks: Chunk[],
    fileName: string
): Promise<number> {

    const embedded = await embedChunks(
        gemini,
        chunks
    );

    embedded.forEach((chunk) => {
        chunk.fileName = fileName;
    });

    await qdrant.upsertChunks(embedded);

    return embedded.length;
}