import { Hono } from "hono";
import { CHAT_LIMITS } from "../config";
import {
    COLLECTION_NAME,
    QDRANT_URL,
    VECTOR_SIZE,
} from "../config";

import { GeminiService } from "../services/GeminiService";
import { ChunkService } from "../services/ChunkService";
import { QdrantService } from "../services/QdrantService";
import { RAGService } from "../services/RAGService";
import { DocumentStore } from "../services/DocumentStore";

import { retrieveChunks } from "../rag/retrieval";
import { buildPrompt } from "../rag/prompt";
import { RateLimiter } from "../services/RateLimiter";

type Bindings = {
    GEMINI_API_KEY: string;
    QDRANT_API_KEY: string;
    RATE_LIMITS: KVNamespace;
    DOCUMENTS: KVNamespace;
};

const chat = new Hono<{ Bindings: Bindings }>();

chat.post("/", async (c) => {
    try {

        // --- Rate Limiting Logic ---
        const ip =
            c.req.header("CF-Connecting-IP") ??
            "unknown";

        const limiter =
            new RateLimiter(
                c.env.RATE_LIMITS
            );

        const result = await limiter.check(
            `chat:${ip}`,
            CHAT_LIMITS
        );

        if (!result.allowed) {
            return c.json(
                {
                    success: false,
                    error: {
                        code: "CHAT_RATE_LIMIT",
                        title: "Message limit reached",
                        message: "You've reached the query limit.",
                        details: "Please wait before asking more questions.",
                        retryAfter: "1 minute",
                        limit: 3,
                        window: "minute",
                    },
                },
                429
            );
        }

        const body = await c.req.json();

        const question = body.question?.trim();
        const documentId = body.documentId?.trim();

        const useGeneralKnowledge =
    body.useGeneralKnowledge ?? false;

        if (!documentId) {
            return c.json(
                {
                    success: false,
                    error: "documentId is required.",
                },
                400
            );
        }
        if (!question) {
            return c.json(
                {
                    success: false,
                    error: "Question is required.",
                },
                400
            );
        }

        const gemini = new GeminiService(
            c.env.GEMINI_API_KEY
        );

        const doc = await c.env.DOCUMENTS.get(documentId);

        if (!doc) {
            return c.json(
                {
                    success: false,
                    error: "Document not found.",
                },
                404
            );
        }

        const metadata = JSON.parse(doc) as {
            indexed?: boolean;
        };

        const qdrant = new QdrantService(
            QDRANT_URL,
            COLLECTION_NAME,
            c.env.QDRANT_API_KEY
        );

        const documentStore = new DocumentStore(c.env.DOCUMENTS);

        const rag = new RAGService(
            new ChunkService(),
            gemini,
            qdrant,
            documentStore
        );

        await qdrant.ensureCollection(VECTOR_SIZE);

        if (!metadata.indexed) {
            await rag.indexDocument(documentId);
        }

        const chunks = await retrieveChunks(
            gemini,
            qdrant,
            documentId,
            question
        );

        console.log("Retrieved chunks:");
        console.dir(chunks, { depth: null });

        const prompt = buildPrompt(question, chunks, useGeneralKnowledge);

        console.log("Prompt:");
        console.log(prompt);

        const answer = await gemini.generateAnswer(prompt);

        return c.json({
            success: true,
            documentId,
            question,
            answer,
            sources: chunks.map((chunk) => ({
                page: chunk.page,
                score: chunk.score,
                index: chunk.index,
            })),
        });

    } catch (error: any) {
        console.error("Chat generation error:", error);

        // Catch 503 high demand/rate limit errors from Gemini API
        if (
            error?.status === 503 ||
            error?.code === 503 ||
            error?.message?.includes("503")
        ) {
            return c.json(
                {
                    success: false,
                    answer: "The AI service is currently experiencing high demand. Please wait a few seconds and try sending your question again.",
                    sources: [],
                },
                200
            );
        }

        const message =
            error instanceof Error ? error.message : String(error);

        if (message.includes("RESOURCE_EXHAUSTED")) {
            return c.json(
                {
                    success: false,
                    error: {
                        code: "GEMINI_QUOTA_EXCEEDED",
                        title: "AI quota reached",
                        message:
                            "The AI service has reached its daily usage limit. Please try again later.",
                    },
                },
                429
            );
        }

        // Generic fallback error response
        return c.json(
            {
                success: false,
                answer: "An unexpected error occurred while processing your request. Please try again.",
                sources: [],
            },
            500
        );
    }
});

export default chat;