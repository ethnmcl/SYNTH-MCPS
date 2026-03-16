import crypto from "node:crypto";
import type { EmbeddingChunk, EmbeddingSearchResult } from "../types.js";
import { cosineSimilarity, tokenize } from "../utils/text.js";

export interface EmbeddingAdapter {
  embedText(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  semanticSearch(queryVector: number[], chunks: EmbeddingChunk[], topK: number): Promise<EmbeddingSearchResult[]>;
}

class LocalStubEmbeddingAdapter implements EmbeddingAdapter {
  private readonly dimensions = 64;

  async embedText(text: string): Promise<number[]> {
    const tokens = tokenize(text);
    const vector = new Array<number>(this.dimensions).fill(0);
    for (const token of tokens) {
      const hash = crypto.createHash("sha256").update(token).digest();
      for (let i = 0; i < this.dimensions; i += 1) {
        const current = vector[i] ?? 0;
        const byteValue = hash[i % hash.length] ?? 0;
        vector[i] = current + (byteValue - 128) / 128;
      }
    }
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vector.map((v) => v / norm);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((text) => this.embedText(text)));
  }

  async semanticSearch(queryVector: number[], chunks: EmbeddingChunk[], topK: number): Promise<EmbeddingSearchResult[]> {
    return chunks
      .map((chunk) => ({
        notePath: chunk.notePath,
        score: cosineSimilarity(queryVector, chunk.vector),
        chunkId: chunk.id,
        excerpt: chunk.text.slice(0, 220),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

export class EmbeddingService {
  private readonly adapter: EmbeddingAdapter;

  constructor(provider: "local-stub") {
    this.adapter = new LocalStubEmbeddingAdapter();
    if (provider !== "local-stub") {
      throw new Error(`Unsupported embedding provider: ${provider}`);
    }
  }

  embedText(text: string): Promise<number[]> {
    return this.adapter.embedText(text);
  }

  embedBatch(texts: string[]): Promise<number[][]> {
    return this.adapter.embedBatch(texts);
  }

  semanticSearch(queryVector: number[], chunks: EmbeddingChunk[], topK: number): Promise<EmbeddingSearchResult[]> {
    return this.adapter.semanticSearch(queryVector, chunks, topK);
  }
}
