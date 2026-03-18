import { createServer } from './server/createServer.js';
import { registerTools } from './server/registerTools.js';
import { startStdioTransport } from './server/transport/stdio.js';
import { startHttpTransport } from './server/transport/http.js';
import { env } from './config/env.js';
import { createGitHubClient } from './github/client.js';
import { logger } from './utils/logger.js';

const main = async (): Promise<void> => {
  const octokit = createGitHubClient(env);
  const server = createServer();

  registerTools(server, { octokit, env });

  if (env.mcpTransport === 'http') {
    await startHttpTransport(server, env.port);
    return;
  }

  await startStdioTransport(server);
};

main().catch((error: unknown) => {
  logger.error('Fatal startup error', {
    message: error instanceof Error ? error.message : String(error)
  });
  process.exit(1);
});
