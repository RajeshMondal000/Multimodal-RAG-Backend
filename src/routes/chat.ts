import { Hono } from "hono";

import {
    COLLECTION_NAME,
    QDRANT_URL,
    VECTOR_SIZE,
} from "../config";

import { GeminiService } from "../services/GeminiService";
import { QdrantService } from "../services/QdrantService";

import { retrieveChunks } from "../rag/retrieval";
import { buildPrompt } from "../rag/prompt";

type Bindings = {
    GEMINI_API_KEY: string;
    QDRANT_API_KEY: string;
};

const chat = new Hono<{ Bindings: Bindings }>();

chat.post("/", async (c) => {
    try {
        const body = await c.req.json();

        const question = body.question?.trim();
        const documentId = body.documentId?.trim();

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

        const qdrant = new QdrantService(
            QDRANT_URL,
            COLLECTION_NAME,
            c.env.QDRANT_API_KEY
        );

        await qdrant.ensureCollection(VECTOR_SIZE);

        const chunks = await retrieveChunks(
            gemini,
            qdrant,
            documentId,
            question
        );

        console.log("Retrieved chunks:");
        console.dir(chunks, { depth: null });

        const prompt = buildPrompt(question, chunks);

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