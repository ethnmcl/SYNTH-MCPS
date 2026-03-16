import path from "node:path";
import type { GraphEdge, GraphNode, ObsidianMcpConfig } from "../types.js";
import { buildAdjacency, bfsNeighborhood, filterGraph } from "../utils/graph.js";
import type { NoteService } from "./noteService.js";
import type { VaultService } from "./vaultService.js";

export class GraphService {
  constructor(
    private readonly config: ObsidianMcpConfig,
    private readonly vaultService: VaultService,
    private readonly noteService: NoteService,
  ) {}

  async getOutgoingLinks(reference: string) {
    const note = await this.noteService.parseNote(reference);
    const unresolved: string[] = [];
    const resolved: Array<{ target: string; alias?: string; line: number }> = [];

    for (const link of note.links) {
      try {
        const target = await this.vaultService.resolveNoteReference(link.target);
        resolved.push({ target, alias: link.alias, line: link.line });
      } catch {
        unresolved.push(link.target);
      }
    }

    return {
      note: note.path,
      resolved,
      unresolved,
    };
  }

  async getBacklinks(reference: string) {
    const target = await this.vaultService.resolveNoteReference(reference);
    const notes = await this.vaultService.listNotePaths();
    const backlinks: Array<{ source: string; line: number; raw: string }> = [];

    for (const notePath of notes) {
      const note = await this.noteService.parseNote(notePath);
      for (const link of note.links) {
        let resolved: string | null = null;
        try {
          resolved = await this.vaultService.resolveNoteReference(link.target);
        } catch {
          resolved = null;
        }
        if (resolved !== target) continue;
        backlinks.push({ source: note.path, line: link.line, raw: link.raw });
      }
    }

    return { target, backlinks };
  }

  async getRelatedNotes(reference: string, limit = 12) {
    const note = await this.noteService.parseNote(reference);
    const allPaths = await this.vaultService.listNotePaths();
    const outgoing = await this.getOutgoingLinks(note.path);
    const backlinks = await this.getBacklinks(note.path);
    const scores = new Map<string, number>();

    for (const out of outgoing.resolved) {
      scores.set(out.target, (scores.get(out.target) ?? 0) + 3);
    }
    for (const back of backlinks.backlinks) {
      scores.set(back.source, (scores.get(back.source) ?? 0) + 3);
    }

    for (const candidatePath of allPaths) {
      if (candidatePath === note.path) continue;
      const candidate = await this.noteService.parseNote(candidatePath);
      const sharedTags = note.tags.filter((tag) => candidate.tags.includes(tag)).length;
      if (sharedTags > 0) {
        scores.set(candidate.path, (scores.get(candidate.path) ?? 0) + sharedTags);
      }
    }

    return [...scores.entries()]
      .map(([pathValue, score]) => ({ note: pathValue, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async getGraphNeighborhood(reference: string, depth = 2) {
    const root = await this.vaultService.resolveNoteReference(reference);
    const all = await this.vaultService.listNotePaths();
    const nodes: GraphNode[] = all.map((p) => ({
      id: p,
      path: p,
      title: path.basename(p, this.config.defaultNoteExtension),
    }));

    const edges: GraphEdge[] = [];
    for (const notePath of all) {
      const note = await this.noteService.parseNote(notePath);
      for (const link of note.links) {
        try {
          const target = await this.vaultService.resolveNoteReference(link.target);
          edges.push({ source: note.path, target, type: link.isWiki ? "wiki" : "markdown", weight: 1 });
        } catch {
          // skip unresolved
        }
      }
    }

    const adjacency = buildAdjacency(edges);
    const include = bfsNeighborhood(root, adjacency, Math.max(1, Math.min(depth, 4)));
    return filterGraph(nodes, edges, include);
  }

  async autoLinkSuggestions(reference: string, limit = 10) {
    const note = await this.noteService.parseNote(reference);
    const tokens = new Set(note.content.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 3));
    const all = await this.vaultService.listNotePaths();
    const suggestions: Array<{ note: string; reason: string; score: number }> = [];

    for (const candidatePath of all) {
      if (candidatePath === note.path) continue;
      const title = path.basename(candidatePath, this.config.defaultNoteExtension);
      const titleTokens = title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
      const hitCount = titleTokens.filter((t) => tokens.has(t)).length;
      if (hitCount === 0) continue;
      suggestions.push({
        note: candidatePath,
        reason: `title tokens matched (${hitCount})`,
        score: hitCount,
      });
    }

    return suggestions.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}
