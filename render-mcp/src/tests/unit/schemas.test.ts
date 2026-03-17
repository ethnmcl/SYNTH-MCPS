import { describe, expect, it } from "vitest";
import { envVarUpdateSchema } from "../../mcp/schemas/common.js";

describe("schema validation", () => {
  it("validates env var update structure", () => {
    const parsed = envVarUpdateSchema.parse({
      key: "DATABASE_URL",
      value: "postgres://...",
      isSecret: true
    });

    expect(parsed.key).toBe("DATABASE_URL");
  });

  it("rejects empty env var key", () => {
    expect(() => envVarUpdateSchema.parse({ key: "", value: "x", isSecret: true })).toThrow();
  });
});
