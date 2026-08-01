import { QdrantService } from "./QdrantService";
import { DOCUMENT_TTL_HOURS } from "../config";
import {
    COLLECTION_NAME,
    QDRANT_URL,
} from "../config";
import { Bindings } from "hono/types";

type CleanupEnv = Bindings & {
    DOCUMENTS: KVNamespace;
    QDRANT_API_KEY: string;
};


export async function cleanupExpiredDocuments(
    env: CleanupEnv
) {

    const list = await env.DOCUMENTS.list();

    const qdrant = new QdrantService(
        QDRANT_URL,
        COLLECTION_NAME,
        env.QDRANT_API_KEY
    );

    const cutoff =
        Date.now() -
        DOCUMENT_TTL_HOURS * 60 * 60 * 1000;

    for (const key of list.keys) {

        const value =
            await env.DOCUMENTS.get(key.name);

        if (!value)
            continue;

        const doc =
            JSON.parse(value);

        const uploaded =
            new Date(
                doc.uploadedAt
            ).getTime();

        if (uploaded > cutoff)
            continue;

        await qdrant.deleteDocument(
            doc.documentId
        );

        await env.DOCUMENTS.delete(
            key.name
        );

    }

}