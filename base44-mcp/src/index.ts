import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from './core/logger.js';
import { createServer } from './server.js';

const main = async (): Promise<void> => {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('base44-mcp connected on stdio transport');
};

main().catch((error: unknown) => {
  logger.error(
    {
      message: error instanceof Error ? error.message : String(error)
    },
    'Fatal startup error'
  );
  process.exit(1);
});
