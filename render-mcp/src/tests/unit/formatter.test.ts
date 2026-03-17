import { describe, expect, it } from "vitest";
import { formatToolResponse } from "../../mcp/formatters/responseFormatter.js";
import { successResult } from "../../lib/result.js";

describe("formatToolResponse", () => {
  it("formats structured content and text content", () => {
    const result = successResult("ok", { foo: "bar" });
    const formatted = formatToolResponse(result);

    expect(formatted.structuredContent.summary).toBe("ok");
    expect(formatted.content[0]!.type).toBe("text");
  });
});
