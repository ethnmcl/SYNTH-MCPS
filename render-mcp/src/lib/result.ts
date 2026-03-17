export interface ToolResult<TData = unknown> {
  ok: boolean;
  summary: string;
  details: TData;
  warnings: string[];
  next_steps: string[];
}

export function successResult<TData>(
  summary: string,
  details: TData,
  warnings: string[] = [],
  nextSteps: string[] = []
): ToolResult<TData> {
  return {
    ok: true,
    summary,
    details,
    warnings,
    next_steps: nextSteps
  };
}

export function errorResult(
  summary: string,
  details: Record<string, unknown>,
  warnings: string[] = []
): ToolResult<Record<string, unknown>> {
  return {
    ok: false,
    summary,
    details,
    warnings,
    next_steps: []
  };
}
