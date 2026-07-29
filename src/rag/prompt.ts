import { SearchResult } from "../services/QdrantService";

export function buildPrompt(
  question: string,
  context: SearchResult[]
): string {
  const contextText = context
    .map(
      (chunk) => `Page ${chunk.page}

${chunk.text}`
    )
    .join("\n\n------------------------\n\n");

  return `
You are a helpful AI assistant.

You MUST answer ONLY using the provided context.

Rules:
- Do not use outside knowledge.
- If the answer is not present in the context, say:
  "I couldn't find that information in the uploaded document."
- Keep the answer concise and accurate.
- Mention the page number(s) when possible.

========================

Context

${contextText}

========================

Question

${question}

========================

Answer:
`;
}