import { ChunkService } from "./ChunkService";
import { GeminiService } from "./GeminiService";
import { QdrantService } from "./QdrantService";

import { ingestChunks } from "../rag/ingestion";
import { ParserFactory } from "./parsers/ParserFactory";

export class RAGService {
  constructor(
    private chunkService: ChunkService,
    private geminiService: GeminiService,
    private qdrantService: QdrantService
  ) { }

  async ingestDocument(
    documentId: string,
    fileName: string,
    uploadedAt: string,
    file: File
  ): Promise<number> {

    const parser = ParserFactory.getParser(
      file.type,
      this.geminiService
    );

    const pages = await parser.parse(file);

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
      chunks,
      fileName,
      uploadedAt
    );

    return chunks.length;
  }
}