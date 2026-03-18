import type { z } from 'zod';
import type { GitHubContext } from './github.js';
import type { ToolOutput } from '../utils/result.js';

export interface GithubTool<TSchema extends z.ZodTypeAny = z.ZodTypeAny> {
  name: string;
  description: string;
  inputSchema: TSchema;
  readOnly?: boolean;
  execute: (ctx: GitHubContext, input: z.infer<TSchema>) => Promise<ToolOutput>;
}
