import { Hono } from "hono";
import { randomUUID } from "crypto";

import { ChunkService } from "../services/ChunkService";
import { GeminiService } from "../services/GeminiService";
import { QdrantService } from "../services/QdrantService";
import { RAGService } from "../services/RAGService";
import { ParserFactory } from "../services/parsers/ParserFactory";
import { KVProgressReporter } from "../services/KVProgressReporter";
import { RateLimiter } from "../services/RateLimiter";

import {
  QDRANT_URL,
  COLLECTION_NAME,
  VECTOR_SIZE,
  UPLOAD_LIMITS,
} from "../config";

type Bindings = {
  GEMINI_API_KEY: string;
  QDRANT_API_KEY: string;
  UPLOAD_JOBS: KVNamespace;
  RATE_LIMITS: KVNamespace;
  DOCUMENTS: KVNamespace;
};

const upload = new Hono<{ Bindings: Bindings }>();

/* ------------------------------------------------ */
/* GET JOB STATUS                                   */
/* ------------------------------------------------ */

upload.get("/jobs/:id", async (c) => {
  const job = await c.env.UPLOAD_JOBS.get(c.req.param("id"));

  if (!job) {
    return c.json(
      {
        success: false,
        error: "Job not found",
      },
      404
    );
  }

  return c.json(JSON.parse(job));
});

/* ------------------------------------------------ */
/* UPLOAD DOCUMENT                                  */
/* ------------------------------------------------ */

upload.post("/", async (c) => {
  try {

    // --- Rate Limiting Logic ---
    const ip = c.req.header("CF-Connecting-IP") ?? "unknown";
    const limiter = new RateLimiter(c.env.RATE_LIMITS);
    const result = await limiter.check(
      `upload:${ip}`,
      UPLOAD_LIMITS
    );

    if (!result.allowed) {

      return c.json(
        {
          success: false,
          error: {
            code: "UPLOAD_RATE_LIMIT",
            title: "Upload limit reached",
            message:
              "You've reached the upload limit.",
            details:
              "Please wait before uploading another document.",
            retryAfter: "1 minute",
            limit: 3,
            window: "minute",
          },
        },
        429
      );
    }

    const form = await c.req.formData();

    const file = form.get("file");

    if (!(file instanceof File)) {
      return c.json(
        {
          success: false,
          error: "No file uploaded.",
        },
        400
      );
    }

    const MAX_SIZE = 20 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      return c.json(
        {
          success: false,
          error:
            "Maximum file size is 20 MB.",
        },
        400
      );
    }

    const mimeType = ParserFactory.detectType(file);

    if (!ParserFactory.supports(mimeType)) {
      return c.json(
        {
          success: false,
          error: `Unsupported file type: ${mimeType}`,
          supportedTypes: ParserFactory.supportedTypes(),
        },
        400
      );
    }

    const fileName = file.name;

    const documentId = randomUUID();
    const jobId = randomUUID();
    const uploadedAt = new Date().toISOString();

    /* ---------- Create Initial Job ---------- */

    await c.env.UPLOAD_JOBS.put(
      jobId,
      JSON.stringify({
        stage: "queued",
        progress: 0,
        message: "Waiting to start...",
      })
    );

    /* ---------- Services ---------- */

    const qdrant = new QdrantService(
      QDRANT_URL,
      COLLECTION_NAME,
      c.env.QDRANT_API_KEY
    );

    await qdrant.ensureCollection(VECTOR_SIZE);

    const gemini = new GeminiService(
      c.env.GEMINI_API_KEY
    );

    const rag = new RAGService(
      new ChunkService(),
      gemini,
      qdrant
    );

    const reporter = new KVProgressReporter(
      c.env,
      jobId
    );

    /* ---------- Ingest Document ---------- */

    /* ---------- Run ingestion in background ---------- */

    c.executionCtx.waitUntil(
      (async () => {
        try {

          await rag.ingestDocument(
            documentId,
            fileName,
            uploadedAt,
            file,
            reporter
          );

        } catch (error) {

          console.error(error);

          await reporter.update({

            stage: "failed",

            progress: 100,

            message:
              error instanceof Error
                ? error.message
                : "Upload failed",

          });

        }
      })()
    );

    await c.env.DOCUMENTS.put(
      documentId,
      JSON.stringify({
        documentId,
        fileName,
        uploadedAt,
      })
    );
    /* ---------- Return immediately ---------- */

    return c.json({

      success: true,

      jobId,

      documentId,

      fileName,

      uploadedAt,

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