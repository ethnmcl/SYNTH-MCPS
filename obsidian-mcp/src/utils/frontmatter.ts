import matter from "gray-matter";

export function parseFrontmatter(markdown: string): { data: Record<string, unknown>; content: string } {
  const parsed = matter(markdown);
  return {
    data: (parsed.data ?? {}) as Record<string, unknown>,
    content: parsed.content,
  };
}

export function stringifyFrontmatter(content: string, data: Record<string, unknown>): string {
  return matter.stringify(content, data);
}
