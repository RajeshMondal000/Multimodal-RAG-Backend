import type { Chunk } from "../types/chunk";

export interface DocumentMetadata {
	documentId: string;
	fileName: string;
	uploadedAt: string;
	indexed: boolean;
}

export class DocumentStore {
	constructor(private documents: KVNamespace) { }

	private metadataKey(documentId: string): string {
		return documentId;
	}

	private chunksKey(documentId: string): string {
		return `${documentId}:chunks`;
	}

	async saveMetadata(metadata: DocumentMetadata): Promise<void> {
		await this.documents.put(
			this.metadataKey(metadata.documentId),
			JSON.stringify(metadata)
		);
	}

	async getDocument(
		documentId: string
	): Promise<DocumentMetadata | null> {
		const value = await this.documents.get(
			this.metadataKey(documentId)
		);

		if (!value) {
			return null;
		}

		return JSON.parse(value) as DocumentMetadata;
	}

	async saveChunks(
		documentId: string,
		chunks: Chunk[]
	): Promise<void> {
		await this.documents.put(
			this.chunksKey(documentId),
			JSON.stringify(chunks)
		);
	}

	async getChunks(documentId: string): Promise<Chunk[]> {
		const value = await this.documents.get(
			this.chunksKey(documentId)
		);

		if (!value) {
			return [];
		}

		return JSON.parse(value) as Chunk[];
	}

	async markIndexed(
		documentId: string,
		indexed: boolean
	): Promise<void> {
		const metadata = await this.getDocument(documentId);

		if (!metadata) {
			throw new Error(`Document ${documentId} not found.`);
		}

		await this.saveMetadata({
			...metadata,
			indexed,
		});
	}

	async isIndexed(documentId: string): Promise<boolean> {
		const metadata = await this.getDocument(documentId);
		return metadata?.indexed ?? false;
	}

	async deleteDocument(documentId: string): Promise<void> {
		await Promise.all([
			this.documents.delete(this.metadataKey(documentId)),
			this.documents.delete(this.chunksKey(documentId)),
		]);
	}

	async deleteAll(): Promise<void> {
		const keys = await this.documents.list();

		await Promise.all(
			keys.keys.map((key) => this.documents.delete(key.name))
		);
	}
}