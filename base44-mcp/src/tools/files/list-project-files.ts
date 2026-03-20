import type { ToolDefinition } from '../../core/types.js';
import { listProjectFilesInputSchema } from '../../schemas/files.js';

export const list_project_filesTool: ToolDefinition<typeof listProjectFilesInputSchema> = {
  name: 'list_project_files',
  description: 'List files in a local project directory.',
  inputSchema: listProjectFilesInputSchema,
  async execute(ctx, input) {
    return ctx.services.fileService.listProjectFiles(input as never);
  }
};
