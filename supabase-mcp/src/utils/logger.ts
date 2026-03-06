import { redactValue } from "./redact.js";

export type LogLevel = "debug" | "info" | "warn" | "error";

function write(level: LogLevel, message: string, payload?: Record<string, unknown>): void {
  const record = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(payload ? { payload: redactValue(payload) } : {}),
  };
  process.stderr.write(`${JSON.stringify(record)}\n`);
}

export const logger = {
  debug: (message: string, payload?: Record<string, unknown>) => write("debug", message, payload),
  info: (message: string, payload?: Record<string, unknown>) => write("info", message, payload),
  warn: (message: string, payload?: Record<string, unknown>) => write("warn", message, payload),
  error: (message: string, payload?: Record<string, unknown>) => write("error", message, payload),
};
