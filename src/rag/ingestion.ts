import { Chunk } from "../types/chunk";
import { QdrantService } from "../services/QdrantService";
import type { ProgressReporter } from "../services/ProgressReporter";

export async function ingestChunks(
    qdrant: QdrantService,
    chunks: Chunk[],
    reporter?: ProgressReporter
): Promise<number> {

    await reporter?.update({

        stage: "saving",

        progress: 95,

        message: `Saving ${chunks.length} vectors to Qdrant`

    });
    await qdrant.upsertChunks(chunks);
    await reporter?.update({

        stage: "complete",

        progress: 100,

        message: "Upload complete"

    });
    return chunks.length;
}