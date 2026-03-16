import { defineTool, ensureString } from "./_base.js";

export const createTaskTool = defineTool({
  name: "create_task",
  description: "Append a new open task to a note, optionally under a heading.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: {
      note: { type: "string" },
      task: { type: "string" },
      heading: { type: "string" },
    },
    required: ["note", "task"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return ctx.services.taskService.createTask(
      ensureString(input.note, "note"),
      ensureString(input.task, "task"),
      typeof input.heading === "string" ? input.heading : undefined,
    );
  },
});
