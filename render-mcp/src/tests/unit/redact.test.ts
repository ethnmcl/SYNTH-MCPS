import { describe, expect, it } from "vitest";
import { redactObject } from "../../lib/redact.js";

describe("redactObject", () => {
  it("redacts known sensitive keys", () => {
    const redacted = redactObject({
      apiKey: "secret123",
      nested: {
        password: "hunter2"
      },
      normal: "value"
    });

    expect(redacted.apiKey).toBeTypeOf("string");
    expect(redacted.nested).toEqual({ password: "hu***r2" });
    expect(redacted.normal).toBe("value");
  });
});
