import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SERVER_NAME, SERVER_VERSION } from '../config/constants.js';

export const createServer = (): McpServer => {
  return new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION
  });
};
