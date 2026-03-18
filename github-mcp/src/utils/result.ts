export interface ToolOutput<T = unknown> {
  summary: string;
  data: T;
}

export const result = <T>(summary: string, data: T): ToolOutput<T> => ({ summary, data });
