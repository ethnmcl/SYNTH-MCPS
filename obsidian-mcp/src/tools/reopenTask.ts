import { defineTool, ensureString } from "./_base.js";

export const reopenTaskTool = defineTool({
  name: "reopen_task",
  description: "Mark a matching task line as open again.",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    properties: { note: { type: "string" }, task: { type: "string" } },
    required: ["note", "task"],
    additionalProperties: false,
  },
  async execute(ctx, input) {
    return ctx.services.taskService.reopenTask(ensureString(input.note, "note"), ensureString(input.task, "task"));
  },
});
