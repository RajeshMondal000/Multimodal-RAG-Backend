import { Hono } from "hono";

import {
    COLLECTION_NAME,
    QDRANT_URL,
} from "../config";

import { DocumentStore } from "../services/DocumentStore";
import { QdrantService } from "../services/QdrantService";

type Bindings = {
    QDRANT_API_KEY: string;
    RATE_LIMITS: KVNamespace;
    DOCUMENTS: KVNamespace;
};

const documents = new Hono<{ Bindings: Bindings }>();

documents.get("/", async (c) => {
    try {
        const qdrant = new QdrantService(
            QDRANT_URL,
            COLLECTION_NAME,
            c.env.QDRANT_API_KEY
        );

        const docs = await qdrant.listDocuments();

        return c.json({
            success: true,
            documents: docs,
            message: "Documents retrieved successfully.",
        });

    } catch (error) {
        console.error(error);

        return c.json(
            {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : String(error),
            },
            500
        );
    }
});

documents.delete("/:documentId", async (c) => {
    try {
        const documentId = c.req.param("documentId");
        if (!documentId) {
            return c.json(
                {
                    success: false,
                    error: "documentId is required.",
                },
                400
            );
        }
        const qdrant = new QdrantService(
            QDRANT_URL,
            COLLECTION_NAME,
            c.env.QDRANT_API_KEY
        );
        const documentStore = new DocumentStore(c.env.DOCUMENTS);

        await qdrant.deleteDocument(documentId);
        await documentStore.deleteDocument(documentId);

        return c.json({
            success: true,
            documentId,
            message: `Document with ID ${documentId} deleted successfully.`,
        });
    } catch (error) {
        console.error(error);
        return c.json(
            {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : String(error),
            },
            500
        );
    }
});


documents.delete("/", async (c) => {
    try {
        const qdrant = new QdrantService(
            QDRANT_URL,
            COLLECTION_NAME,
            c.env.QDRANT_API_KEY
        );
        const documentStore = new DocumentStore(c.env.DOCUMENTS);

        await qdrant.deleteAllDocuments();
        await documentStore.deleteAll();

        return c.json({
            success: true,
            message: "All documents deleted.",
        });
    } catch (error) {
        console.error(error);
        return c.json(
            {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : String(error),
            },
            500
        );
    }
});

export default documents;