import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv({ quiet: true });

const envSchema = z.object({
  BASE44_API_BASE_URL: z.url().default('https://api.base44.dev'),
  BASE44_DOCS_BASE_URL: z.url().default('https://docs.base44.dev'),
  BASE44_CLIENT_ID: z.string().default(''),
  BASE44_CLIENT_SECRET: z.string().default(''),
  BASE44_REDIRECT_URI: z.string().default(''),
  BASE44_ACCESS_TOKEN: z.string().default(''),
  BASE44_REFRESH_TOKEN: z.string().default(''),
  BASE44_WORKSPACE_ID: z.string().default(''),
  BASE44_PROJECT_ID: z.string().default(''),
  BASE44_MOCK_MODE: z.stringbool().default(true),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  ALLOW_DESTRUCTIVE_TOOLS: z.stringbool().default(false),
  MCP_SERVER_NAME: z.string().default('base44-mcp'),
  MCP_SERVER_VERSION: z.string().default('0.1.0')
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
