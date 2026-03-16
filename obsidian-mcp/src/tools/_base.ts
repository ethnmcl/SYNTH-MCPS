import type { ToolContext, ToolDefinition } from "../types.js";
import { ObsidianMcpError } from "../errors.js";

export function defineTool(definition: ToolDefinition): ToolDefinition {
  return definition;
}

export function ensureString(input: unknown, field: string): string {
  if (typeof input !== "string" || input.trim() === "") {
    throw new ObsidianMcpError("VALIDATION_ERROR", `${field} must be a non-empty string`);
  }
  return input.trim();
}

export function ensureBoolean(input: unknown, fallback = false): boolean {
  if (typeof input === "boolean") return input;
  return fallback;
}

export function ensureNumber(input: unknown, fallback: number): number {
  if (typeof input === "number" && Number.isFinite(input)) return input;
  return fallback;
}

export function toArrayOfStrings(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.filter((v): v is string => typeof v === "string");
}

export async function safeToolExecute<T>(ctx: ToolContext, fn: () => Promise<T>) {
  return fn();
}
