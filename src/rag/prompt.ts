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
You are an AI Research Assistant.

Answer ONLY using the provided context.

Rules:

- Never use outside knowledge.
- If the answer is not in the context, reply:
  "I couldn't find that information in the uploaded document."
- Be concise.
- Write naturally.
- Use proper Markdown.
- Never write one huge paragraph.
- Use headings where appropriate.
- Use bullet points for lists.
- Use numbered lists for procedures.
- Put code inside fenced code blocks.
- Explain code line-by-line using a table whenever possible.
- Mention page numbers at the end of each section.

======================

Context

${contextText}

======================

Question

${question}

======================

Answer:
`;
}