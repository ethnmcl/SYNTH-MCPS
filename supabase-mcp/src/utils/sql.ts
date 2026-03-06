import { ValidationError } from "../server/errors.js";

export function quoteIdent(identifier: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
    throw new ValidationError(`Invalid identifier: ${identifier}`);
  }
  return `"${identifier.replace(/"/g, '""')}"`;
}

export function qualifyTable(schema: string, table: string): string {
  return `${quoteIdent(schema)}.${quoteIdent(table)}`;
}

export function escapeLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

export function vectorToSql(values: number[]): string {
  const safe = values.map((n) => {
    if (!Number.isFinite(n)) throw new ValidationError("Embedding contains non-finite numbers");
    return Number(n).toString();
  });
  return `'[${safe.join(",")}]'`;
}

export function isReadOnlySql(sql: string): boolean {
  const normalized = sql.trim().toLowerCase();
  return normalized.startsWith("select") || normalized.startsWith("with") || normalized.startsWith("explain");
}
