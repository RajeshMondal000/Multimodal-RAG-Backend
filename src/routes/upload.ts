import { Hono } from "hono";

import { randomUUID } from "crypto";

import { PdfService } from "../services/PdfService";
import { ChunkService } from "../services/ChunkService";
import { GeminiService } from "../services/GeminiService";
import { QdrantService } from "../services/QdrantService";
import { RAGService } from "../services/RAGService";

import {
  QDRANT_URL,
  COLLECTION_NAME,
  VECTOR_SIZE,
} from "../config";

type Bindings = {
  GEMINI_API_KEY: string;
  QDRANT_API_KEY: string;
};

const upload = new Hono<{ Bindings: Bindings }>();

upload.post("/", async (c) => {
  try {
    const form = await c.req.formData();

    const file = form.get("file");

    if (!(file instanceof File)) {
      return c.json(
        {
          success: false,
          error: "No PDF uploaded.",
        },
        400
      );
    }

    const buffer = await file.arrayBuffer();

    const qdrant = new QdrantService(
      QDRANT_URL,
      COLLECTION_NAME,
      c.env.QDRANT_API_KEY
    );

    await qdrant.ensureCollection(VECTOR_SIZE);

    const rag = new RAGService(
      new PdfService(),
      new ChunkService(),
      new GeminiService(c.env.GEMINI_API_KEY),
      qdrant
    );

    const documentId = randomUUID();

    const chunks = await rag.ingestDocument(
      documentId,
      buffer
    );

    return c.json({
      success: true,
      documentId,
      chunks,
    });
  } catch (error) {
    console.error(error);

    return c.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      500
    );
  }
});

export default upload;