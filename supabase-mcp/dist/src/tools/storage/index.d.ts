import type { RequestContext } from "../../server/context.js";
type ToolHandler = (context: RequestContext, input: Record<string, unknown>) => Promise<Record<string, unknown>>;
export declare const storageTools: Record<string, ToolHandler>;
export {};
