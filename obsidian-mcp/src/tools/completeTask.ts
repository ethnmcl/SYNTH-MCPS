import { defineTool, ensureString } from "./_base.js";

export const completeTaskTool = defineTool({
  name: "complete_task",
  description: "Mark a matching task line as completed.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: { note: { type: "string" }, task: { type: "string" } },
    required: ["note", "task"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return ctx.services.taskService.completeTask(ensureString(input.note, "note"), ensureString(input.task, "task"));
  },
});
