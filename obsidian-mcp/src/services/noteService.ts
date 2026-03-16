import path from "node:path";
import { stat } from "node:fs/promises";
import { ConflictError, NotFoundError, PermissionError, ValidationError } from "../errors.js";
import type { ObsidianMcpConfig, ParsedNote } from "../types.js";
import { deleteFile, exists, moveFile, readUtf8, writeUtf8 } from "../utils/files.js";
import { parseFrontmatter, stringifyFrontmatter } from "../utils/frontmatter.js";
import { extractHeadings, extractTags, parseNoteLinks } from "../utils/markdown.js";
import { parseTasks } from "../utils/tasks.js";
import { normalizeRelativePath, withExtension } from "../utils/paths.js";
import type { VaultService } from "./vaultService.js";

export class NoteService {
  constructor(
    private readonly config: ObsidianMcpConfig,
    private readonly vaultService: VaultService,
  ) {}

  async parseNote(reference: string): Promise<ParsedNote> {
    const rel = await this.vaultService.resolveNoteReference(reference);
    const abs = this.vaultService.resolveAbsolutePath(rel);
    const st = await stat(abs);
    if (st.size > this.config.maxFileSizeBytes) {
      throw new ValidationError("File exceeds max size", {
        path: rel,
        sizeBytes: st.size,
        limitBytes: this.config.maxFileSizeBytes,
      });
    }

    const raw = await readUtf8(abs);
    const frontmatter = parseFrontmatter(raw);
    const basename = path.basename(rel, this.config.defaultNoteExtension);

    return {
      path: rel,
      title: basename,
      basename,
      sizeBytes: st.size,
      createdAt: st.birthtime.toISOString(),
      modifiedAt: st.mtime.toISOString(),
      tags: extractTags(raw),
      headings: extractHeadings(frontmatter.content),
      links: parseNoteLinks(frontmatter.content),
      tasks: parseTasks(frontmatter.content),
      content: frontmatter.content,
      frontmatter: frontmatter.data,
    };
  }

  async createNote(input: {
    title: string;
    folder?: string;
    content?: string;
    frontmatter?: Record<string, unknown>;
    overwrite?: boolean;
  }): Promise<{ path: string; created: boolean }> {
    this.assertWriteAllowed();
    const folder = input.folder ? normalizeRelativePath(input.folder) : "";
    const fileName = withExtension(input.title.trim(), this.config.defaultNoteExtension);
    const relPath = normalizeRelativePath(path.posix.join(folder, fileName));
    const absPath = this.vaultService.resolveAbsolutePath(relPath);

    const alreadyExists = await exists(absPath);
    if (alreadyExists && !input.overwrite) {
      throw new ConflictError("Note already exists", { path: relPath });
    }

    const body = stringifyFrontmatter(input.content ?? "", input.frontmatter ?? {});
    await writeUtf8(absPath, body);

    return { path: relPath, created: !alreadyExists };
  }

  async updateNote(reference: string, content: string, frontmatter?: Record<string, unknown>): Promise<{ path: string }> {
    this.assertWriteAllowed();
    const rel = await this.vaultService.resolveNoteReference(reference);
    const abs = this.vaultService.resolveAbsolutePath(rel);
    const existing = await readUtf8(abs);
    const existingParsed = parseFrontmatter(existing);
    const mergedFrontmatter = frontmatter ?? existingParsed.data;
    await writeUtf8(abs, stringifyFrontmatter(content, mergedFrontmatter));
    return { path: rel };
  }

  async appendToNote(reference: string, text: string, mode: "append" | "prepend"): Promise<{ path: string }> {
    this.assertWriteAllowed();
    const note = await this.parseNote(reference);
    const next = mode === "append" ? `${note.content}\n${text}` : `${text}\n${note.content}`;
    await this.updateNote(note.path, next, note.frontmatter);
    return { path: note.path };
  }

  async replaceInNote(
    reference: string,
    find: string,
    replace: string,
    useRegex = false,
  ): Promise<{ path: string; replacements: number }> {
    this.assertWriteAllowed();
    const note = await this.parseNote(reference);
    let replacements = 0;
    let next = note.content;

    if (useRegex) {
      const re = new RegExp(find, "g");
      next = note.content.replace(re, () => {
        replacements += 1;
        return replace;
      });
    } else {
      const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(escaped, "g");
      next = note.content.replace(re, () => {
        replacements += 1;
        return replace;
      });
    }

    await this.updateNote(note.path, next, note.frontmatter);
    return { path: note.path, replacements };
  }

  async renameNote(reference: string, newName: string): Promise<{ oldPath: string; newPath: string }> {
    this.assertWriteAllowed();
    const rel = await this.vaultService.resolveNoteReference(reference);
    const newFile = withExtension(newName.trim(), this.config.defaultNoteExtension);
    const newPath = normalizeRelativePath(path.posix.join(path.posix.dirname(rel), newFile));
    await this.moveByPath(rel, newPath);
    return { oldPath: rel, newPath };
  }

  async moveNote(reference: string, destinationFolder: string): Promise<{ oldPath: string; newPath: string }> {
    this.assertWriteAllowed();
    const rel = await this.vaultService.resolveNoteReference(reference);
    const newPath = normalizeRelativePath(path.posix.join(destinationFolder, path.posix.basename(rel)));
    await this.moveByPath(rel, newPath);
    return { oldPath: rel, newPath };
  }

  async deleteNote(
    reference: string,
    options?: { permanent?: boolean; trashSubdir?: string },
  ): Promise<{ path: string; deleted: "soft" | "permanent"; destination?: string }> {
    if (!this.config.allowedDelete) {
      throw new PermissionError("Delete operations are disabled by OBSIDIAN_ALLOWED_DELETE=false");
    }

    const rel = await this.vaultService.resolveNoteReference(reference);
    const abs = this.vaultService.resolveAbsolutePath(rel);

    if (options?.permanent) {
      await deleteFile(abs);
      return { path: rel, deleted: "permanent" };
    }

    const trashSubdir = options?.trashSubdir ?? this.config.trashDir;
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dest = normalizeRelativePath(path.posix.join(trashSubdir, `${stamp}-${path.posix.basename(rel)}`));
    const absDest = this.vaultService.resolveAbsolutePath(dest);
    await moveFile(abs, absDest);
    return { path: rel, deleted: "soft", destination: dest };
  }

  async bulkDeleteNotes(references: string[], options?: { permanent?: boolean }) {
    const results = [] as Array<{ note: string; ok: boolean; error?: string; deleted?: string }>;
    for (const note of references) {
      try {
        const result = await this.deleteNote(note, options);
        results.push({ note, ok: true, deleted: result.deleted });
      } catch (error) {
        results.push({
          note,
          ok: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
    return results;
  }

  async writeFrontmatter(reference: string, frontmatter: Record<string, unknown>): Promise<{ path: string }> {
    const note = await this.parseNote(reference);
    await this.updateNote(note.path, note.content, frontmatter);
    return { path: note.path };
  }

  async listRecent(limit = 20): Promise<string[]> {
    const notes = await this.vaultService.listNotePaths();
    const withStats = await Promise.all(
      notes.map(async (note) => {
        const abs = this.vaultService.resolveAbsolutePath(note);
        const st = await stat(abs);
        return { note, modifiedAt: st.mtimeMs };
      }),
    );

    return withStats
      .sort((a, b) => b.modifiedAt - a.modifiedAt)
      .slice(0, limit)
      .map((entry) => entry.note);
  }

  private async moveByPath(oldPath: string, newPath: string): Promise<void> {
    const oldAbs = this.vaultService.resolveAbsolutePath(oldPath);
    const newAbs = this.vaultService.resolveAbsolutePath(newPath);
    const existsDest = await exists(newAbs);
    if (existsDest) {
      throw new ConflictError("Destination note already exists", { path: newPath });
    }
    await moveFile(oldAbs, newAbs);
  }

  private assertWriteAllowed(): void {
    if (!this.config.allowedWrite) {
      throw new PermissionError("Write operations are disabled by OBSIDIAN_ALLOWED_WRITE=false");
    }
  }

  async ensureExists(reference: string): Promise<void> {
    try {
      await this.vaultService.resolveNoteReference(reference);
    } catch {
      throw new NotFoundError("Note does not exist", { reference });
    }
  }
}
