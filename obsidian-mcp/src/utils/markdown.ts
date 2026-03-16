import MarkdownIt from "markdown-it";
import type { Heading, NoteLink } from "../types.js";

const md = new MarkdownIt({ html: false, linkify: true });

const WIKI_LINK_RE = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g;
const MD_LINK_RE = /\[[^\]]+\]\(([^)]+)\)/g;
const TAG_RE = /(^|\s)#([a-zA-Z0-9_/-]+)/g;

export function extractHeadings(markdown: string): Heading[] {
  const lines = markdown.split(/\r?\n/);
  const result: Heading[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) continue;
    const hashes = match[1] ?? "#";
    const text = match[2] ?? "";
    result.push({ level: hashes.length, text: text.trim(), line: i + 1 });
  }
  return result;
}

export function extractTags(markdown: string): string[] {
  const found = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = TAG_RE.exec(markdown)) !== null) {
    const tag = match[2];
    if (tag) found.add(tag.toLowerCase());
  }
  return [...found].sort();
}

export function parseNoteLinks(markdown: string): NoteLink[] {
  const lines = markdown.split(/\r?\n/);
  const links: NoteLink[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";

    let wiki: RegExpExecArray | null;
    while ((wiki = WIKI_LINK_RE.exec(line)) !== null) {
      const target = wiki[1]?.trim();
      if (!target) continue;
      links.push({ raw: wiki[0] ?? "", target, alias: wiki[2]?.trim(), isWiki: true, line: i + 1 });
    }

    let mdLink: RegExpExecArray | null;
    while ((mdLink = MD_LINK_RE.exec(line)) !== null) {
      const target = mdLink[1]?.trim() ?? "";
      if (/^(https?:|mailto:)/i.test(target)) continue;
      if (!target.endsWith(".md")) continue;
      links.push({ raw: mdLink[0] ?? "", target, isWiki: false, line: i + 1 });
    }
  }

  return links;
}

export function renderPlainText(markdown: string): string {
  const rendered = md.render(markdown);
  return rendered.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
