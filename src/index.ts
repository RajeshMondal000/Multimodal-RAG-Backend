import { Hono } from "hono";

import upload from "./routes/upload";
import chat from "./routes/chat";

type Bindings = {
  GEMINI_API_KEY: string;
  QDRANT_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.json({
    success: true,
    message: "RAG API is running",
  });
});

app.route("/upload", upload);
app.route("/chat", chat);

export default app;