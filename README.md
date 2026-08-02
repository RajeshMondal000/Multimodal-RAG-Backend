# Multimodal RAG Backend

A serverless Retrieval-Augmented Generation (RAG) backend built with **Cloudflare Workers**, **Hono**, **Google Gemini**, and **Qdrant**.

The backend provides APIs for document ingestion, semantic search, multimodal processing, and conversational question answering over uploaded documents and images.

---

## Features

- Multi-format document ingestion
  - PDF
  - DOCX
  - TXT
  - CSV
  - XLSX
  - Images (OCR + Vision)

- Automatic document parsing

- Semantic text chunking

- Gemini Embeddings

- Qdrant Vector Database integration

- Retrieval-Augmented Generation (RAG)

- Hybrid Chat Modes
  - Document Only
  - Document + AI Knowledge

- Image understanding using Gemini Vision

- Chat history support

- Rate limiting using Cloudflare KV

- Automatic cleanup of expired documents using Cloudflare Cron Triggers

- REST API

- Fully serverless deployment

---

# Architecture

```
                Upload File
                     │
                     ▼
          Document Parser Factory
                     │
                     ▼
             Text / OCR Extraction
                     │
                     ▼
              Chunk Generation
                     │
                     ▼
          Gemini Embedding Model
                     │
                     ▼
              Qdrant Vector DB
                     │
                     ▼
                User Question
                     │
                     ▼
           Semantic Vector Search
                     │
                     ▼
             Retrieved Chunks
                     │
                     ▼
               Prompt Builder
                     │
                     ▼
              Gemini Chat Model
                     │
                     ▼
                 Final Answer
```

---

# Tech Stack

- Cloudflare Workers
- Hono
- Google Gemini API
- Qdrant
- Cloudflare KV
- Cloudflare Cron Triggers
- TypeScript


---

# Chat Modes

## Document Only

The model answers **strictly** from the retrieved document context.

If the answer is unavailable, it explicitly states that the information is not present in the uploaded document.

---

## Document + AI Knowledge

The uploaded document is treated as the primary source.

The model may additionally:

- explain concepts
- define terminology
- interpret technical content
- provide educational background

Responses clearly separate:

- Information extracted from the document
- Additional AI-generated explanation

---

# Rate Limiting

The backend includes Cloudflare KV-based rate limiting.

Example limits:

- 3 requests / minute  (GEMINI API 🥲)
- 20 requests / hour

---

# Automatic Cleanup

Uploaded document metadata is stored in Cloudflare KV.

A scheduled Cloudflare Cron Trigger periodically:

1. Finds expired documents.
2. Deletes their vectors from Qdrant.
3. Removes associated metadata.

This prevents unlimited growth of the vector database.

---

# Environment Variables

```
GEMINI_API_KEY
QDRANT_API_KEY
```

Cloudflare KV Bindings:

```
UPLOAD_JOBS
RATE_LIMITS
DOCUMENTS
```

---

# Deployment

The backend is designed for **Cloudflare Workers**.

Automatic deployment is supported using GitHub integration.

---

# Future Improvements

- Streaming chat responses
- Hybrid keyword + vector search
- Multi-document conversations
- Citation highlighting
- User authentication
- Collection-level permissions
- Conversation summarization
- Advanced reranking
- Model selection

---

# License

This project is licensed under the MIT License.