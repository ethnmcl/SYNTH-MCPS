import { access } from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { ConfigError } from "./errors.js";
import type { ObsidianMcpConfig } from "./types.js";

dotenv.config();

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === "") return fallback;
  return value.toLowerCase() === "true";
}

function parseInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new ConfigError(`Invalid integer value: ${value}`);
  }
  return parsed;
}

function ensureMdExt(ext: string): string {
  if (!ext.startsWith(".")) return `.${ext}`;
  return ext;
}

export async function loadConfig(): Promise<ObsidianMcpConfig> {
  const vaultPathRaw = process.env.OBSIDIAN_VAULT_PATH;
  if (!vaultPathRaw) {
    throw new ConfigError("OBSIDIAN_VAULT_PATH is required");
  }

  const vaultPath = path.resolve(vaultPathRaw);
  try {
    await access(vaultPath);
  } catch {
    throw new ConfigError("OBSIDIAN_VAULT_PATH does not exist or cannot be accessed", {
      vaultPath,
    });
  }

  return {
    vaultPath,
    trashDir: process.env.OBSIDIAN_TRASH_DIR ?? ".trash",
    dailyNotesDir: process.env.OBSIDIAN_DAILY_NOTES_DIR ?? "Daily",
    templatesDir: process.env.OBSIDIAN_TEMPLATES_DIR ?? "Templates",
    defaultNoteExtension: ensureMdExt(process.env.OBSIDIAN_DEFAULT_NOTE_EXTENSION ?? ".md"),
    enableSemanticSearch: parseBoolean(process.env.OBSIDIAN_ENABLE_SEMANTIC_SEARCH, true),
    embeddingProvider: "local-stub",
    maxFileSizeBytes: parseInteger(process.env.OBSIDIAN_MAX_FILE_SIZE_MB, 5) * 1024 * 1024,
    allowedWrite: parseBoolean(process.env.OBSIDIAN_ALLOWED_WRITE, true),
    allowedDelete: parseBoolean(process.env.OBSIDIAN_ALLOWED_DELETE, true),
    indexCacheFile: process.env.OBSIDIAN_INDEX_CACHE_FILE ?? ".obsidian-mcp/index.json",
    timezone: process.env.OBSIDIAN_TIMEZONE ?? "UTC",
  };
}
