import type { ToolDefinition } from '../../core/types.js';
import { readProjectFileInputSchema } from '../../schemas/files.js';

export const read_project_fileTool: ToolDefinition<typeof readProjectFileInputSchema> = {
  name: 'read_project_file',
  description: 'Read a file from the local Base44 project path.',
  inputSchema: readProjectFileInputSchema,
  async execute(ctx, input) {
    return ctx.services.fileService.readProjectFile(input as never);
  }
};
