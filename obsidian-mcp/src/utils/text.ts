export function stripMarkdown(input: string): string {
  return input
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeText(input: string): string {
  return stripMarkdown(input).toLowerCase();
}

export function tokenize(input: string): string[] {
  return normalizeText(input)
    .split(/[^a-z0-9_/-]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

export function createSnippet(input: string, query: string, window = 180): string {
  const normalized = stripMarkdown(input);
  const idx = normalized.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return normalized.slice(0, window);
  const start = Math.max(0, idx - Math.floor(window / 2));
  return normalized.slice(start, start + window);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  if (len === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function chunkText(input: string, maxChars = 1200): string[] {
  const lines = input.split(/\r?\n/);
  const chunks: string[] = [];
  let current = "";

  for (const line of lines) {
    if (line.trim().startsWith("```")) continue;
    if ((current + "\n" + line).length > maxChars && current.trim()) {
      chunks.push(current.trim());
      current = line;
      continue;
    }
    current = `${current}\n${line}`;
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}
