import { Hono } from "hono";
import { cors } from "hono/cors";
import upload from "./routes/upload";
import chat from "./routes/chat";
import documents from "./routes/documents";

type Bindings = {
  GEMINI_API_KEY: string;
  QDRANT_API_KEY: string;
  UPLOAD_JOBS: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.json({
    success: true,
    message: "RAG API is running",
  });
});

app.use(
  "*",
  cors({
    origin: "http://localhost:5174",
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

app.route("/upload", upload);
app.route("/chat", chat);
app.route("/documents", documents);

export default app;