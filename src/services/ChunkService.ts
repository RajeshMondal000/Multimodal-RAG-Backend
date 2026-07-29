import { CHUNK_OVERLAP, CHUNK_SIZE } from "../config";
import { Chunk } from "../types/chunk";

export class ChunkService {
    split(documentId: string, page: number, text: string): Chunk[] {
        const cleaned = text.replace(/\s+/g, " ").trim();

        const chunks: Chunk[] = [];

        let start = 0;

        while (start < cleaned.length) {
            const end = Math.min(start + CHUNK_SIZE, cleaned.length);

            chunks.push({
                id: crypto.randomUUID(),
                documentId,
                page,
                index: chunks.length,
                text: cleaned.slice(start, end),
            });

            start += CHUNK_SIZE - CHUNK_OVERLAP;
        }

        return chunks;
    }
}