export interface Chunk {
    id: string;
    documentId: string;
    fileName?: string;
    page: number;
    index: number;
    text: string;
    embedding?: number[];
}