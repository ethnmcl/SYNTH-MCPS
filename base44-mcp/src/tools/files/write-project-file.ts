import type { ToolDefinition } from '../../core/types.js';
import { writeProjectFileInputSchema } from '../../schemas/files.js';

export const write_project_fileTool: ToolDefinition<typeof writeProjectFileInputSchema> = {
  name: 'write_project_file',
  description: 'Write or overwrite a file inside the local Base44 project.',
  inputSchema: writeProjectFileInputSchema,
  async execute(ctx, input) {
    return ctx.services.fileService.writeProjectFile(input as never);
  }
};
