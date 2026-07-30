import { QdrantClient } from "@qdrant/js-client-rest";
import { Chunk } from "../types/chunk";

export interface SearchResult {
  score: number;
  text: string;
  page: number;
  index: number;
  documentId: string;
  fileName?: string;
}

export interface DocumentInfo {
  documentId: string;
  fileName: string;
  chunks: number;
}

export class QdrantService {
  private client: QdrantClient;
  private collection: string;

  constructor(
    url: string,
    collection: string,
    apiKey: string
  ) {
    this.client = new QdrantClient({
      url,
      apiKey,
      https: true,
      port: 443,
    });

    this.collection = collection;
  }

  async ensureCollection(vectorSize: number): Promise<void> {
    const collections = await this.client.getCollections();

    const exists = collections.collections.some(
      (c) => c.name === this.collection
    );

    if (!exists) {
      await this.client.createCollection(this.collection, {
        vectors: {
          size: vectorSize,
          distance: "Cosine",
        },
      });
    }

    try {
      await this.client.createPayloadIndex(this.collection, {
        field_name: "documentId",
        field_schema: "keyword",
      });
    } catch (err) {
      // Ignore "already exists" errors
      console.log("documentId payload index already exists.");
    }
  }

  async upsertChunks(chunks: Chunk[]): Promise<void> {
    const points = chunks.map((chunk) => ({
      id: chunk.id,
      vector: chunk.embedding!,
      payload: {
        documentId: chunk.documentId,
        fileName: chunk.fileName,
        page: chunk.page,
        index: chunk.index,
        text: chunk.text,
      },
    }));

    await this.client.upsert(this.collection, {
      wait: true,
      points,
    });
  }

  async search(
    documentId: string,
    vector: number[],
    limit = 5
  ): Promise<SearchResult[]> {

    try {
      const response = await this.client.query(this.collection, {
        query: vector,
        limit,
        with_payload: true,
        with_vector: false,
        filter: {
          must: [
            {
              key: "documentId",
              match: {
                value: documentId,
              },
            },
          ],
        },
      });

      return response.points.map((point) => ({
        score: point.score ?? 0,
        text: String(point.payload?.text ?? ""),
        page: Number(point.payload?.page ?? 0),
        index: Number(point.payload?.index ?? 0),
        documentId: String(point.payload?.documentId ?? ""),
        fileName: String(point.payload?.fileName ?? ""),
      }));
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async listDocuments(): Promise<DocumentInfo[]> {

    const response = await this.client.scroll(this.collection, {
      limit: 10000,
      with_payload: true,
      with_vector: false,
    });

    const map = new Map<string, DocumentInfo>();

    for (const point of response.points) {

      const payload = point.payload ?? {};

      const documentId = String(payload.documentId ?? "");
      const fileName = String(payload.fileName ?? "");

      if (!documentId) continue;

      if (!map.has(documentId)) {
        map.set(documentId, {
          documentId,
          fileName,
          chunks: 0,
        });
      }

      map.get(documentId)!.chunks++;
    }

    return [...map.values()];
  }


  async deleteDocument(documentId: string): Promise<void> {

    await this.client.delete(this.collection, {
      wait: true,
      filter: {
        must: [
          {
            key: "documentId",
            match: {
              value: documentId,
            },
          },
        ],
      },
    });
  }


  async deleteAllDocuments(): Promise<void> {

    await this.client.delete(this.collection, {
      wait: true,
      filter: {},
    });
  }


}