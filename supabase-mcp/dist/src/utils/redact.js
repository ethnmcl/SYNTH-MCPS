import { RedactionSensitiveKeys } from "../schemas/common.js";
const SENSITIVE = new Set(RedactionSensitiveKeys);
export function redactValue(value) {
    if (value === null || value === undefined)
        return value;
    if (typeof value === "string") {
        if (value.length <= 8)
            return "[REDACTED]";
        return `${value.slice(0, 3)}***${value.slice(-2)}`;
    }
    if (Array.isArray(value))
        return value.map((item) => redactValue(item));
    if (typeof value === "object") {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            out[k] = SENSITIVE.has(k.toLowerCase()) ? "[REDACTED]" : redactValue(v);
        }
        return out;
    }
    return value;
}
export function redactKey(value) {
    if (!value)
        return "[MISSING]";
    if (value.length < 10)
        return "[REDACTED]";
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
}
