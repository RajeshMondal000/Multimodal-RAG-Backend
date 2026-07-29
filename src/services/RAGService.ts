import { PdfService } from "./PdfService";
import { ChunkService } from "./ChunkService";
import { GeminiService } from "./GeminiService";
import { QdrantService } from "./QdrantService";

import { ingestChunks } from "../rag/ingestion";

export class RAGService {
  constructor(
    private pdfService: PdfService,
    private chunkService: ChunkService,
    private geminiService: GeminiService,
    private qdrantService: QdrantService
  ) {}

  async ingestDocument(
    documentId: string,
    buffer: ArrayBuffer
  ): Promise<number> {

    // 1. Extract text from PDF
    const pages = await this.pdfService.extractPages(buffer);

    // 2. Split into chunks
    const chunks = pages.flatMap((page) =>
      this.chunkService.split(
        documentId,
        page.pageNumber,
        page.text
      )
    );

    // 3. Generate embeddings + store in Qdrant
    await ingestChunks(
      this.geminiService,
      this.qdrantService,
      chunks
    );

    return chunks.length;
  }
}