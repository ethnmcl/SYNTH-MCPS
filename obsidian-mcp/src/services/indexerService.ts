import { readFile } from "node:fs/promises";
import path from "node:path";
import { exists, writeUtf8 } from "../utils/files.js";
import { chunkText } from "../utils/text.js";
import type { EmbeddingChunk, ObsidianMcpConfig } from "../types.js";
import type { EmbeddingService } from "./embeddingService.js";
import type { NoteService } from "./noteService.js";
import type { VaultService } from "./vaultService.js";

interface IndexCache {
  version: 1;
  updatedAt: string;
  chunks: EmbeddingChunk[];
}

export class IndexerService {
  private lastIndexedAt: string | null = null;

  constructor(
    private readonly config: ObsidianMcpConfig,
    private readonly vaultService: VaultService,
    private readonly noteService: NoteService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  getLastIndexedAt(): string | null {
    return this.lastIndexedAt;
  }

  private cacheAbsolutePath(): string {
    return path.resolve(this.config.vaultPath, this.config.indexCacheFile);
  }

  async loadIndex(): Promise<EmbeddingChunk[]> {
    const cachePath = this.cacheAbsolutePath();
    if (!(await exists(cachePath))) return [];
    const raw = await readFile(cachePath, "utf8");
    const parsed = JSON.parse(raw) as IndexCache;
    this.lastIndexedAt = parsed.updatedAt;
    return parsed.chunks ?? [];
  }

  async saveIndex(chunks: EmbeddingChunk[]): Promise<void> {
    const payload: IndexCache = {
      version: 1,
      updatedAt: new Date().toISOString(),
      chunks,
    };
    await writeUtf8(this.cacheAbsolutePath(), JSON.stringify(payload, null, 2));
    this.lastIndexedAt = payload.updatedAt;
  }

  async indexNote(reference: string): Promise<{ notePath: string; chunks: number }> {
    const note = await this.noteService.parseNote(reference);
    const split = chunkText(note.content, 1400);
    const vectors = await this.embeddingService.embedBatch(split);

    const nextChunks: EmbeddingChunk[] = split.map((text, idx) => ({
      id: `${note.path}#${idx + 1}`,
      notePath: note.path,
      text,
      vector: vectors[idx] ?? [],
      updatedAt: new Date().toISOString(),
    }));

    const existing = await this.loadIndex();
    const filtered = existing.filter((chunk) => chunk.notePath !== note.path);
    await this.saveIndex([...filtered, ...nextChunks]);

    return { notePath: note.path, chunks: nextChunks.length };
  }

  async indexVault(): Promise<{ notesIndexed: number; chunksIndexed: number }> {
    const notePaths = await this.vaultService.listNotePaths();
    let notesIndexed = 0;
    let chunksIndexed = 0;

    let currentIndex = await this.loadIndex();
    const byNote = new Map<string, EmbeddingChunk[]>();
    for (const chunk of currentIndex) {
      const arr = byNote.get(chunk.notePath) ?? [];
      arr.push(chunk);
      byNote.set(chunk.notePath, arr);
    }

    for (const notePath of notePaths) {
      const note = await this.noteService.parseNote(notePath);
      const chunks = chunkText(note.content, 1400);
      const vectors = await this.embeddingService.embedBatch(chunks);
      byNote.set(
        note.path,
        chunks.map((text, idx) => ({
          id: `${note.path}#${idx + 1}`,
          notePath: note.path,
          text,
          vector: vectors[idx] ?? [],
          updatedAt: new Date().toISOString(),
        })),
      );
      notesIndexed += 1;
      chunksIndexed += chunks.length;
    }

    currentIndex = [...byNote.values()].flat();
    await this.saveIndex(currentIndex);
    return { notesIndexed, chunksIndexed };
  }
}
