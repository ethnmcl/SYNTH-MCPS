import path from "node:path";
import type { ObsidianMcpConfig } from "../types.js";
import { readUtf8 } from "../utils/files.js";
import type { NoteService } from "./noteService.js";
import type { VaultService } from "./vaultService.js";

function nowParts() {
  const now = new Date();
  return {
    date: new Intl.DateTimeFormat("en-CA").format(now),
    time: new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now),
    datetime: now.toISOString(),
  };
}

export class TemplateService {
  constructor(
    private readonly config: ObsidianMcpConfig,
    private readonly vaultService: VaultService,
    private readonly noteService: NoteService,
  ) {}

  async listTemplates(): Promise<string[]> {
    const all = await this.vaultService.listNotePaths();
    return all.filter((p) => p.startsWith(`${this.config.templatesDir}/`));
  }

  async loadTemplate(reference: string): Promise<string> {
    const candidate = reference.startsWith(`${this.config.templatesDir}/`)
      ? reference
      : path.posix.join(this.config.templatesDir, reference);
    const resolved = await this.vaultService.resolveNoteReference(candidate);
    const abs = this.vaultService.resolveAbsolutePath(resolved);
    return readUtf8(abs);
  }

  fillTemplate(templateContent: string, variables: Record<string, string>): string {
    const defaults = nowParts();
    return templateContent
      .replace(/\{\{\s*date\s*\}\}/g, variables.date ?? defaults.date)
      .replace(/\{\{\s*time\s*\}\}/g, variables.time ?? defaults.time)
      .replace(/\{\{\s*datetime\s*\}\}/g, variables.datetime ?? defaults.datetime)
      .replace(/\{\{\s*title\s*\}\}/g, variables.title ?? "Untitled");
  }

  async createFromTemplate(input: {
    template: string;
    title: string;
    folder?: string;
    variables?: Record<string, string>;
    overwrite?: boolean;
  }) {
    const templateRaw = await this.loadTemplate(input.template);
    const content = this.fillTemplate(templateRaw, {
      title: input.title,
      ...(input.variables ?? {}),
    });

    return this.noteService.createNote({
      title: input.title,
      folder: input.folder,
      content,
      overwrite: input.overwrite,
    });
  }
}
