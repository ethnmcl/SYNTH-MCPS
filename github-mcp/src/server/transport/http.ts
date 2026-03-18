import express from 'express';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../../utils/logger.js';

export const startHttpTransport = async (_server: McpServer, port: number): Promise<void> => {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', transport: 'http-scaffold' });
  });

  app.post('/mcp', (_req, res) => {
    res.status(501).json({
      error: 'HTTP MCP transport scaffold is present, but request handling is not wired yet.'
    });
  });

  await new Promise<void>((resolve) => {
    app.listen(port, () => {
      logger.info(`HTTP scaffold listening on :${port}`);
      resolve();
    });
  });
};
