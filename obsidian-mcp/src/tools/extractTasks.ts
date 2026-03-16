import { defineTool, ensureString } from "./_base.js";

export const extractTasksTool = defineTool({
  name: "extract_tasks",
  description: "Extract markdown checkbox tasks with status and location.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      status: { type: "string", enum: ["open", "complete"] },
      note: { type: "string" },
      tag: { type: "string" },
    },
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return {
      tasks: await ctx.services.taskService.extractTasks({
        status: typeof input.status === "string" ? (input.status as "open" | "complete") : undefined,
        note: typeof input.note === "string" ? ensureString(input.note, "note") : undefined,
        tag: typeof input.tag === "string" ? input.tag.replace(/^#/, "") : undefined,
      }),
    };
  },
});
