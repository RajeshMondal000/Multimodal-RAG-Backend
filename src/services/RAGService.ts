import { ChunkService } from "./ChunkService";
import { GeminiService } from "./GeminiService";
import { QdrantService } from "./QdrantService";

import { ingestChunks } from "../rag/ingestion";
import { ParserFactory } from "./parsers/ParserFactory";
import { ProgressReporter } from "./ProgressReporter";

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
    file: File,
    reporter?: ProgressReporter
  ): Promise<number> {

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

    await reporter?.update({

      stage: "embedding",

      progress: 30,

      message: `Generating ${chunks.length} embeddings`,

      totalChunks: chunks.length,

      processedChunks: 0

    });

    // 3. Generate embeddings + store in Qdrant
    await ingestChunks(
      this.geminiService,
      this.qdrantService,
      chunks,
      fileName,
      uploadedAt,
      reporter
    );

    await reporter?.update({

      stage: "saving",

      progress: 95,

      message: "Saving vectors"

    });

    await reporter?.update({

      stage: "complete",

      progress: 100,

      message: "Ready"

    });

    return chunks.length;
  }
}