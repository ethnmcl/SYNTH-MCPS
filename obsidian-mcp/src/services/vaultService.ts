import { stat } from "node:fs/promises";
import fg from "fast-glob";
import path from "node:path";
import { NotFoundError, ValidationError } from "../errors.js";
import type { NoteMetadata, ObsidianMcpConfig } from "../types.js";
import { readUtf8 } from "../utils/files.js";
import { extractTags } from "../utils/markdown.js";
import { normalizeRelativePath, resolveVaultPath, toRelativeVaultPath, withExtension } from "../utils/paths.js";

export class VaultService {
  constructor(private readonly config: ObsidianMcpConfig) {}

  async listNotePaths(): Promise<string[]> {
    const pattern = `**/*${this.config.defaultNoteExtension}`;
    const ignore = [`${this.config.trashDir}/**`, `${this.config.templatesDir}/**/*.bak`, `${this.config.indexCacheFile}`];

    const files = await fg(pattern, {
      cwd: this.config.vaultPath,
      onlyFiles: true,
      dot: false,
      ignore,
    });

    return files.map((file) => normalizeRelativePath(file)).sort();
  }

  async listFolders(): Promise<string[]> {
    const folders = await fg("**/", {
      cwd: this.config.vaultPath,
      onlyDirectories: true,
      dot: false,
      ignore: [".git/**"],
    });
    return folders.map((f) => normalizeRelativePath(f)).sort();
  }

  async listNoteMetadata(): Promise<NoteMetadata[]> {
    const notes = await this.listNotePaths();
    return Promise.all(notes.map((note) => this.noteMetadata(note)));
  }

  async getVaultInfo(lastIndexedAt: string | null, semanticEnabled: boolean) {
    const [notes, folders] = await Promise.all([this.listNoteMetadata(), this.listFolders()]);
    const tagSet = new Set<string>();
    for (const note of notes) {
      for (const tag of note.tags) tagSet.add(tag);
    }
    return {
      vaultName: path.basename(this.config.vaultPath),
      vaultRoot: this.maskVaultPath(),
      noteCount: notes.length,
      folderCount: folders.length,
      tagCountEstimate: tagSet.size,
      lastIndexedAt,
      semanticSearchEnabled: semanticEnabled,
    };
  }

  resolveRelativePath(input: string): string {
    return normalizeRelativePath(input);
  }

  resolveAbsolutePath(relativePath: string): string {
    return resolveVaultPath(this.config.vaultPath, relativePath);
  }

  async noteMetadata(relativePath: string): Promise<NoteMetadata> {
    const normalized = this.ensureNotePath(relativePath);
    const absolute = this.resolveAbsolutePath(normalized);
    const fileStat = await stat(absolute);
    const content = await readUtf8(absolute);
    const basename = path.basename(normalized, this.config.defaultNoteExtension);
    return {
      path: normalized,
      basename,
      title: basename,
      sizeBytes: fileStat.size,
      createdAt: fileStat.birthtime.toISOString(),
      modifiedAt: fileStat.mtime.toISOString(),
      tags: extractTags(content),
    };
  }

  ensureNotePath(input: string): string {
    const normalized = normalizeRelativePath(input);
    if (!normalized.endsWith(this.config.defaultNoteExtension)) {
      return withExtension(normalized, this.config.defaultNoteExtension);
    }
    return normalized;
  }

  async resolveNoteReference(reference: string): Promise<string> {
    const notes = await this.listNotePaths();
    const normalizedRef = normalizeRelativePath(reference);

    const exact = notes.find((note) => note.toLowerCase() === normalizedRef.toLowerCase());
    if (exact) return exact;

    const withExt = this.ensureNotePath(normalizedRef);
    const exactWithExt = notes.find((note) => note.toLowerCase() === withExt.toLowerCase());
    if (exactWithExt) return exactWithExt;

    const targetBasename = path.basename(withExt, this.config.defaultNoteExtension).toLowerCase();
    const basenameMatches = notes.filter(
      (note) => path.basename(note, this.config.defaultNoteExtension).toLowerCase() === targetBasename,
    );
    if (basenameMatches.length === 1) {
      const candidate = basenameMatches[0];
      if (candidate) return candidate;
    }
    if (basenameMatches.length > 1) {
      throw new ValidationError("Ambiguous note reference by basename", {
        reference,
        candidates: basenameMatches,
      });
    }

    const titleMatches = notes.filter(
      (note) => path.basename(note, this.config.defaultNoteExtension).toLowerCase() === reference.toLowerCase(),
    );
    if (titleMatches.length === 1) {
      const candidate = titleMatches[0];
      if (candidate) return candidate;
    }
    if (titleMatches.length > 1) {
      throw new ValidationError("Ambiguous note reference by title", {
        reference,
        candidates: titleMatches,
      });
    }

    throw new NotFoundError("Note not found", { reference });
  }

  maskVaultPath(): string {
    const base = path.basename(this.config.vaultPath);
    return `.../${base}`;
  }

  toRelative(absolutePath: string): string {
    return toRelativeVaultPath(this.config.vaultPath, absolutePath);
  }
}
