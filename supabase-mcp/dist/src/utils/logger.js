import { redactValue } from "./redact.js";
function write(level, message, payload) {
    const record = {
        ts: new Date().toISOString(),
        level,
        message,
        ...(payload ? { payload: redactValue(payload) } : {}),
    };
    process.stderr.write(`${JSON.stringify(record)}\n`);
}
export const logger = {
    debug: (message, payload) => write("debug", message, payload),
    info: (message, payload) => write("info", message, payload),
    warn: (message, payload) => write("warn", message, payload),
    error: (message, payload) => write("error", message, payload),
};
