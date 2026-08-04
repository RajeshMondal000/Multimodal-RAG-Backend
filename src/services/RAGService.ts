import { ChunkService } from "./ChunkService";
import { GeminiService } from "./GeminiService";
import { QdrantService } from "./QdrantService";
import { DocumentStore } from "./DocumentStore";

import { embedChunks } from "../rag/embedding";
import { ingestChunks } from "../rag/ingestion";
import { ParserFactory } from "./parsers/ParserFactory";
import { ProgressReporter } from "./ProgressReporter";
import type { Chunk } from "../types/chunk";

export class RAGService {
  constructor(
    private chunkService: ChunkService,
    private geminiService: GeminiService,
    private qdrantService: QdrantService,
    private documentStore: DocumentStore
  ) { }

  async prepareDocument(
    documentId: string,
    fileName: string,
    uploadedAt: string,
    file: File,
    reporter?: ProgressReporter
  ): Promise<Chunk[]> {

    const mimeType = ParserFactory.detectType(file);
    const parser = ParserFactory.getParser(
      mimeType,
      this.geminiService
    );

    await reporter?.update({

      stage: "parsing",

      progress: 10,

      message: "Parsing document"

    });

    const pages = await parser.parse(file);

    await reporter?.update({

      stage: "chunking",

      progress: 25,

      message: "Creating chunks"

    });

    // 2. Split into chunks
    const chunks = pages.flatMap((page) =>
      this.chunkService.split(
        documentId,
        page.pageNumber,
        page.text,
        page.title
      )
    );
    const MAX_CHUNKS = 1000;

    if (
      chunks.length >
      MAX_CHUNKS
    ) {

      throw new Error(
        `Document exceeds ${MAX_CHUNKS} chunks.`
      );

    }

    return chunks.map((chunk) => ({
      ...chunk,
      fileName,
      uploadedAt,
    }));
  }

  async indexDocument(
    documentId: string,
    reporter?: ProgressReporter
  ): Promise<number> {

    const metadata = await this.documentStore.getDocument(documentId);

    if (!metadata) {
      throw new Error(`Document ${documentId} not found.`);
    }

    if (metadata.indexed) {
      const chunks = await this.documentStore.getChunks(documentId);
      return chunks.length;
    }

    const chunks = await this.documentStore.getChunks(documentId);

    if (!chunks.length) {
      throw new Error(`No chunks found for document ${documentId}.`);
    }

    await reporter?.update({

      stage: "embedding",

      progress: 30,

      message: `Generating ${chunks.length} embeddings`,

      totalChunks: chunks.length,

      processedChunks: 0

    });

    const embedded = await embedChunks(
      this.geminiService,
      chunks,
      reporter
    );

    await ingestChunks(
      this.qdrantService,
      embedded,
      reporter
    );

    await this.documentStore.markIndexed(documentId, true);

    return embedded.length;
  }
}