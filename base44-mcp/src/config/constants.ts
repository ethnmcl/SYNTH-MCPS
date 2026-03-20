import { env } from './env.js';

export const SERVER_NAME = env.MCP_SERVER_NAME;
export const SERVER_VERSION = env.MCP_SERVER_VERSION;

export const DEFAULTS = {
  pageSize: 20,
  maxListSize: 200
} as const;
