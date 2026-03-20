import pino from 'pino';
import { env } from '../config/env.js';

export const logger = pino({
  name: env.MCP_SERVER_NAME,
  level: env.LOG_LEVEL
}, pino.destination(2));
