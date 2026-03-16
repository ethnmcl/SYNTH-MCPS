/* eslint-disable no-console */

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const envLevel = (process.env.LOG_LEVEL ?? "info") as LogLevel;
const threshold = LEVELS[envLevel] ?? LEVELS.info;

function write(level: LogLevel, message: string, data?: unknown): void {
  if (LEVELS[level] < threshold) return;
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(data === undefined ? {} : { data }),
  };
  process.stderr.write(`${JSON.stringify(payload)}\n`);
}

export const logger = {
  debug: (message: string, data?: unknown) => write("debug", message, data),
  info: (message: string, data?: unknown) => write("info", message, data),
  warn: (message: string, data?: unknown) => write("warn", message, data),
  error: (message: string, data?: unknown) => write("error", message, data),
};
