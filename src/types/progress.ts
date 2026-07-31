export type UploadStage =
    | "queued"
    | "parsing"
    | "chunking"
    | "embedding"
    | "saving"
    | "complete"
    | "failed";

export interface UploadProgress {

    stage: UploadStage;

    progress: number;

    message: string;

    totalChunks?: number;

    processedChunks?: number;

}