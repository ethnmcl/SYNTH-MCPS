import path from "node:path";
import { ValidationError } from "../errors.js";

export function normalizeSlashes(input: string): string {
  return input.replace(/\\/g, "/");
}

export function normalizeRelativePath(input: string): string {
  const normalized = normalizeSlashes(path.posix.normalize(normalizeSlashes(input))).replace(/^\/+/, "");
  if (!normalized || normalized === ".") {
    throw new ValidationError("Path must not be empty");
  }
  if (normalized.includes("..")) {
    throw new ValidationError("Path traversal is not allowed", { path: input });
  }
  return normalized;
}

export function ensureInsideVault(vaultRoot: string, absolutePath: string): void {
  const root = path.resolve(vaultRoot);
  const target = path.resolve(absolutePath);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new ValidationError("Resolved path escapes vault root", { target });
  }
}

export function resolveVaultPath(vaultRoot: string, relativePath: string): string {
  const normalized = normalizeRelativePath(relativePath);
  const absolutePath = path.resolve(vaultRoot, normalized);
  ensureInsideVault(vaultRoot, absolutePath);
  return absolutePath;
}

export function toRelativeVaultPath(vaultRoot: string, absolutePath: string): string {
  ensureInsideVault(vaultRoot, absolutePath);
  return normalizeSlashes(path.relative(vaultRoot, absolutePath));
}

export function withExtension(nameOrPath: string, extension: string): string {
  return nameOrPath.endsWith(extension) ? nameOrPath : `${nameOrPath}${extension}`;
}
