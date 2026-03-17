const SENSITIVE_KEYS = ["token", "key", "secret", "password", "authorization", "api_key", "value"];

function looksSensitive(key: string): boolean {
  const lowered = key.toLowerCase();
  return SENSITIVE_KEYS.some((s) => lowered.includes(s));
}

export function redactValue(value: unknown): unknown {
  if (typeof value === "string") {
    if (value.length <= 4) {
      return "***";
    }
    return `${value.slice(0, 2)}***${value.slice(-2)}`;
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item));
  }
  if (value && typeof value === "object") {
    return redactObject(value as Record<string, unknown>);
  }
  return "***";
}

export function redactObject(input: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (looksSensitive(key)) {
      output[key] = redactValue(value);
      continue;
    }

    if (Array.isArray(value)) {
      output[key] = value.map((item) => {
        if (item && typeof item === "object") {
          return redactObject(item as Record<string, unknown>);
        }
        return item;
      });
      continue;
    }

    if (value && typeof value === "object") {
      output[key] = redactObject(value as Record<string, unknown>);
      continue;
    }

    output[key] = value;
  }

  return output;
}
