import type { MarkdownTask } from "../types.js";

const TASK_RE = /^\s*[-*]\s+\[( |x|X)\]\s+(.*)$/;

export function parseTasks(markdown: string): MarkdownTask[] {
  const lines = markdown.split(/\r?\n/);
  const tasks: MarkdownTask[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    const match = line.match(TASK_RE);
    if (!match) continue;
    const marker = match[1] ?? " ";
    const text = match[2] ?? "";
    tasks.push({ line: i + 1, raw: line, completed: marker.toLowerCase() === "x", text: text.trim() });
  }
  return tasks;
}

export function toggleTask(markdown: string, needle: string, completed: boolean): { content: string; updated: boolean } {
  const lines = markdown.split(/\r?\n/);
  let updated = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    const match = line.match(TASK_RE);
    if (!match) continue;
    const taskText = (match[2] ?? "").trim();
    if (taskText !== needle.trim()) continue;
    lines[i] = line.replace(TASK_RE, `- [${completed ? "x" : " "}] ${match[2] ?? ""}`);
    updated = true;
    break;
  }

  return { content: lines.join("\n"), updated };
}
