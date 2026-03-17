import type { ToolResult } from "../../lib/result.js";

export function formatToolResponse<T>(result: ToolResult<T>) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    structuredContent: result as unknown as Record<string, unknown>
  };
}
