import { Chunk } from "../types/chunk";
import { GeminiService } from "../services/GeminiService";
import type { ProgressReporter } from "../services/ProgressReporter";

const BATCH_SIZE = 20;

export async function embedChunks(
    gemini: GeminiService,
    chunks: Chunk[],
    reporter?: ProgressReporter
): Promise<Chunk[]> {

    const embedded: Chunk[] = [];

    const total = chunks.length;

    for (let start = 0; start < total; start += BATCH_SIZE) {

        const batch = chunks.slice(
            start,
            start + BATCH_SIZE
        );

        const embeddings = await gemini.createEmbeddings(
            batch.map((chunk) => chunk.text)
        );

        const results = batch.map((chunk, index) => ({

            ...chunk,

            embedding: embeddings[index],

        }));

        embedded.push(...results);

        const processed = embedded.length;

        const progress =
            30 +
            Math.round((processed / total) * 60);

        await reporter?.update({

            stage: "embedding",

            progress,

            message: `Embedding ${processed}/${total}`,

            totalChunks: total,

            processedChunks: processed,

        });

    }

    return embedded;

}