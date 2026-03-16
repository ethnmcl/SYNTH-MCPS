import type { NoteService } from "./noteService.js";
import type { VaultService } from "./vaultService.js";
import { parseTasks, toggleTask } from "../utils/tasks.js";

export class TaskService {
  constructor(
    private readonly noteService: NoteService,
    private readonly vaultService: VaultService,
  ) {}

  async extractTasks(options?: { status?: "open" | "complete"; note?: string; tag?: string }) {
    const notes = options?.note
      ? [await this.vaultService.resolveNoteReference(options.note)]
      : await this.vaultService.listNotePaths();

    const all = [] as Array<{ note: string; line: number; text: string; completed: boolean }>;
    for (const notePath of notes) {
      const note = await this.noteService.parseNote(notePath);
      for (const task of parseTasks(note.content)) {
        if (options?.status === "open" && task.completed) continue;
        if (options?.status === "complete" && !task.completed) continue;
        if (options?.tag && !note.tags.includes(options.tag.replace(/^#/, ""))) continue;
        all.push({ note: note.path, line: task.line, text: task.text, completed: task.completed });
      }
    }
    return all;
  }

  async createTask(reference: string, taskText: string, heading?: string): Promise<{ note: string; task: string }> {
    const note = await this.noteService.parseNote(reference);
    let content = note.content;

    if (heading) {
      const lines = content.split(/\r?\n/);
      const idx = lines.findIndex((line) => line.trim().toLowerCase() === heading.trim().toLowerCase());
      if (idx >= 0) {
        lines.splice(idx + 1, 0, `- [ ] ${taskText}`);
        content = lines.join("\n");
      } else {
        content = `${content}\n\n## ${heading}\n- [ ] ${taskText}`;
      }
    } else {
      content = `${content}\n- [ ] ${taskText}`;
    }

    await this.noteService.updateNote(note.path, content, note.frontmatter);
    return { note: note.path, task: taskText };
  }

  async completeTask(reference: string, taskText: string): Promise<{ note: string; updated: boolean }> {
    const note = await this.noteService.parseNote(reference);
    const toggled = toggleTask(note.content, taskText, true);
    if (toggled.updated) await this.noteService.updateNote(note.path, toggled.content, note.frontmatter);
    return { note: note.path, updated: toggled.updated };
  }

  async reopenTask(reference: string, taskText: string): Promise<{ note: string; updated: boolean }> {
    const note = await this.noteService.parseNote(reference);
    const toggled = toggleTask(note.content, taskText, false);
    if (toggled.updated) await this.noteService.updateNote(note.path, toggled.content, note.frontmatter);
    return { note: note.path, updated: toggled.updated };
  }
}
