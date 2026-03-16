import path from "node:path";
import type { ObsidianMcpConfig } from "../types.js";
import type { NoteService } from "./noteService.js";
import type { VaultService } from "./vaultService.js";

function formatDate(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export class DailyNoteService {
  constructor(
    private readonly config: ObsidianMcpConfig,
    private readonly vaultService: VaultService,
    private readonly noteService: NoteService,
  ) {}

  dailyNotePath(date: Date): string {
    const day = formatDate(date, this.config.timezone);
    return path.posix.join(this.config.dailyNotesDir, `${day}${this.config.defaultNoteExtension}`);
  }

  async listDailyNotes(limit = 30): Promise<string[]> {
    const all = await this.vaultService.listNotePaths();
    return all.filter((p) => p.startsWith(`${this.config.dailyNotesDir}/`)).slice(-limit);
  }

  async getTodayNote(date = new Date()) {
    const todayPath = this.dailyNotePath(date);
    const resolved = await this.vaultService.resolveNoteReference(todayPath).catch(() => null);
    if (!resolved) {
      return {
        exists: false,
        path: todayPath,
      };
    }
    const note = await this.noteService.parseNote(resolved);
    return {
      exists: true,
      path: note.path,
      title: note.title,
      content: note.content,
      frontmatter: note.frontmatter,
    };
  }

  async createTodayNote(input?: { content?: string; frontmatter?: Record<string, unknown>; date?: string }) {
    const date = input?.date ? new Date(input.date) : new Date();
    const relPath = this.dailyNotePath(date);
    const title = path.posix.basename(relPath, this.config.defaultNoteExtension);

    const created = await this.noteService.createNote({
      title,
      folder: this.config.dailyNotesDir,
      content: input?.content ?? `# ${title}\n`,
      frontmatter: input?.frontmatter ?? { date: title },
      overwrite: false,
    });

    return created;
  }
}
