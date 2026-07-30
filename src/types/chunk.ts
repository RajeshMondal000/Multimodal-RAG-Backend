export interface Chunk {
    id: string;
    documentId: string;
    fileName?: string;
    uploadedAt?: string;
    page: number;
    title?: string;
    index: number;
    text: string;
    embedding?: number[];
}