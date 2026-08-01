export const QDRANT_URL = "https://a0b4af8d-028d-4c94-aefe-418ff9486552.us-west-1-0.aws.cloud.qdrant.io";

export const COLLECTION_NAME = "rag-pdf";

export const VECTOR_SIZE = 3072;

export const EMBEDDING_MODEL = "gemini-embedding-2";

export const CHAT_MODEL = "gemini-3.6-flash";

export const TOP_K = 5;

export const CHUNK_SIZE = 1000;

export const CHUNK_OVERLAP = 200;

export const DOCUMENT_TTL_HOURS = 24;


// config.ts

export const UPLOAD_LIMITS = [
    {
        limit: 3,
        windowSeconds: 60,
        suffix: "minute",
    },
    {
        limit: 10,
        windowSeconds: 3600,
        suffix: "hour",
    },
];

export const CHAT_LIMITS = [
    {
        limit: 3,
        windowSeconds: 60,
        suffix: "minute",
    },
    {
        limit: 20,
        windowSeconds: 3600,
        suffix: "hour",
    },
];