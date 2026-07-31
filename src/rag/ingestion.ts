import { Chunk } from "../types/chunk";
import { embedChunks } from "./embedding";
import { GeminiService } from "../services/GeminiService";
import { QdrantService } from "../services/QdrantService";
import type { ProgressReporter } from "../services/ProgressReporter";

export async function ingestChunks(
    gemini: GeminiService,
    qdrant: QdrantService,
    chunks: Chunk[],
    fileName: string,
    uploadedAt: string,
    reporter?: ProgressReporter
): Promise<number> {

    const embedded = await embedChunks(
        gemini,
        chunks,
        reporter
    );

    embedded.forEach((chunk) => {
        chunk.fileName = fileName;
        chunk.uploadedAt = uploadedAt;
    });

    await reporter?.update({

        stage: "saving",

        progress: 95,

        message: `Saving ${embedded.length} vectors to Qdrant`

    });
    await qdrant.upsertChunks(embedded);
    await reporter?.update({

        stage: "complete",

        progress: 100,

        message: "Upload complete"

    });
    return embedded.length;
}