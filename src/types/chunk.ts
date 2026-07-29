export interface Chunk {
    id: string;
    documentId: string;
    page: number;
    index: number;
    text: string;
    embedding?: number[];
}