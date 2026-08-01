import { Hono } from "hono";
import { cors } from "hono/cors";
import upload from "./routes/upload";
import chat from "./routes/chat";
import documents from "./routes/documents";
import { cleanupExpiredDocuments } from "./services/cleanup";

type Bindings = {
  GEMINI_API_KEY: string;
  QDRANT_API_KEY: string;
  UPLOAD_JOBS: KVNamespace;
  RATE_LIMITS: KVNamespace;
  DOCUMENTS: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

// 1. Enable CORS middleware BEFORE declaring routes
app.use(
  "*",
  cors({
    origin: (origin) => {
      const allowed = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://multimodal-rag.pages.dev", // Replace after deployment
      ];

      return allowed.includes(origin) ? origin : "";
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// 2. Health check route
app.get("/", (c) => {
  return c.json({
    success: true,
    message: "RAG API is running",
  });
});

// 3. Mount sub-routers
app.route("/upload", upload);
app.route("/chat", chat);
app.route("/documents", documents);

export default {

  fetch: app.fetch,
  
  async scheduled(
    _event: ScheduledEvent,
    env: Bindings,
    ctx: ExecutionContext
  ) {

    ctx.waitUntil(cleanupExpiredDocuments(env));

  },

};