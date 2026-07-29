import { GeminiService } from "../services/GeminiService";
import {
    QdrantService,
    SearchResult,
} from "../services/QdrantService";

import { TOP_K } from "../config";

export async function retrieveChunks(
    gemini: GeminiService,
    qdrant: QdrantService,
    documentId: string,
    question: string,
    topK: number = TOP_K
): Promise<SearchResult[]> {

    const embedding = await gemini.createEmbedding(question);

    return await qdrant.search(
        documentId,
        embedding,
        topK
    );
}