import { ConfigError } from "../errors.js";
import type { ObsidianMcpConfig, SearchResult } from "../types.js";
import { createSnippet, normalizeText } from "../utils/text.js";
import type { EmbeddingService } from "./embeddingService.js";
import type { IndexerService } from "./indexerService.js";
import type { NoteService } from "./noteService.js";
import type { VaultService } from "./vaultService.js";

export class SearchService {
  constructor(
    private readonly config: ObsidianMcpConfig,
    private readonly vaultService: VaultService,
    private readonly noteService: NoteService,
    private readonly embeddingService: EmbeddingService,
    private readonly indexerService: IndexerService,
  ) {}

  async keywordSearch(
    query: string,
    options?: { regex?: boolean; limit?: number },
  ): Promise<SearchResult[]> {
    const limit = options?.limit ?? 20;
    const notes = await this.vaultService.listNotePaths();
    const results: SearchResult[] = [];
    const re = options?.regex ? new RegExp(query, "i") : null;

    for (const notePath of notes) {
      const note = await this.noteService.parseNote(notePath);
      const matchFields: string[] = [];
      const haystack = [
        ["title", note.title],
        ["content", note.content],
        ["tags", note.tags.join(" ")],
        ["frontmatter", JSON.stringify(note.frontmatter)],
      ] as const;

      let found = false;
      for (const [field, value] of haystack) {
        const hit = re ? re.test(value) : normalizeText(value).includes(normalizeText(query));
        if (hit) {
          found = true;
          matchFields.push(field);
        }
      }

      if (!found) continue;

      results.push({
        note,
        score: matchFields.includes("title") ? 1 : 0.7,
        snippet: createSnippet(note.content, query),
        matchedFields: matchFields,
      });
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  async searchByTag(tag: string, limit = 50): Promise<SearchResult[]> {
    const normalized = tag.replace(/^#/, "").toLowerCase();
    const notes = await this.vaultService.listNotePaths();
    const results: SearchResult[] = [];

    for (const notePath of notes) {
      const note = await this.noteService.parseNote(notePath);
      if (!note.tags.some((t) => t.toLowerCase() === normalized)) continue;
      results.push({ note, score: 1, matchedFields: ["tags"] });
    }

    return results.slice(0, limit);
  }

  async searchByFrontmatter(field: string, value: unknown, limit = 50): Promise<SearchResult[]> {
    const notes = await this.vaultService.listNotePaths();
    const results: SearchResult[] = [];

    for (const notePath of notes) {
      const note = await this.noteService.parseNote(notePath);
      if (note.frontmatter[field] !== value) continue;
      results.push({ note, score: 1, matchedFields: ["frontmatter"] });
    }

    return results.slice(0, limit);
  }

  async semanticSearch(query: string, topK = 10) {
    if (!this.config.enableSemanticSearch) {
      throw new ConfigError("Semantic search is disabled by OBSIDIAN_ENABLE_SEMANTIC_SEARCH=false");
    }

    const queryVector = await this.embeddingService.embedText(query);
    const chunks = await this.indexerService.loadIndex();
    if (chunks.length === 0) {
      return {
        query,
        results: [],
        warning: "Index is empty. Run index_vault or index_note first.",
      };
    }

    const ranked = await this.embeddingService.semanticSearch(queryVector, chunks, topK);
    return {
      query,
      results: ranked,
      indexedAt: this.indexerService.getLastIndexedAt(),
    };
  }
}
