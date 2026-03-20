import type { ToolResult } from './types.js';

export const ok = <T>(summary: string, data: T): ToolResult<T> => ({
  summary,
  data
});
