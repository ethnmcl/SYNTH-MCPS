import dotenv from 'dotenv';
import { z } from 'zod';
import { DEFAULT_API_URL, TRANSPORTS } from './constants.js';

dotenv.config({ quiet: true });

const envSchema = z.object({
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_API_URL: z.string().url().default(DEFAULT_API_URL),
  GITHUB_USER_AGENT: z.string().default('github-mcp'),
  MCP_TRANSPORT: z.enum([TRANSPORTS.STDIO, TRANSPORTS.HTTP]).default(TRANSPORTS.STDIO),
  PORT: z.coerce.number().int().positive().default(8787),
  GITHUB_READ_ONLY: z
    .string()
    .optional()
    .transform((v) => (v ? v.toLowerCase() === 'true' : false)),
  GITHUB_ALLOWED_OWNERS: z.string().optional().default(''),
  GITHUB_ALLOWED_REPOS: z.string().optional().default('')
});

const parsed = envSchema.parse(process.env);

const splitCsv = (value: string): string[] =>
  value
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);

export const env = {
  githubToken: parsed.GITHUB_TOKEN,
  githubApiUrl: parsed.GITHUB_API_URL,
  githubUserAgent: parsed.GITHUB_USER_AGENT,
  mcpTransport: parsed.MCP_TRANSPORT,
  port: parsed.PORT,
  githubReadOnly: parsed.GITHUB_READ_ONLY,
  allowedOwners: splitCsv(parsed.GITHUB_ALLOWED_OWNERS),
  allowedRepos: splitCsv(parsed.GITHUB_ALLOWED_REPOS)
};

export type AppEnv = typeof env;
