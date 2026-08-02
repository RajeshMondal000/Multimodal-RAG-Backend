import { SearchResult } from "../services/QdrantService";

export function buildPrompt(
  question: string,
  context: SearchResult[],
  useGeneralKnowledge: boolean
): string {

  const contextText = context
    .map(
      (chunk) => `Page ${chunk.page}

${chunk.text}`
    )
    .join("\n\n------------------------\n\n");


  if (!useGeneralKnowledge) {
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
  return `
You are an AI Research Assistant.

The uploaded document is your PRIMARY source.

You may use your own knowledge ONLY to:

- explain concepts
- interpret technical ideas
- provide background information
- define terminology
- compare methods

Do NOT invent facts about the uploaded document.

Always separate your response into these sections:

## 📄 From the Document

Summarize only what is supported by the uploaded document.
Mention page numbers.

## 💡 Additional Explanation

Provide additional explanation using your own knowledge.
Clearly indicate this section is NOT taken directly from the document.

Context

${contextText}

Question

${question}

Answer:
`;
}