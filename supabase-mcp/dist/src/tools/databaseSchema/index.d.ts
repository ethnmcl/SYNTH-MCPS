import type { RequestContext } from "../../server/context.js";
export type ToolHandler = (context: RequestContext, input: Record<string, unknown>) => Promise<Record<string, unknown>>;
export declare const databaseSchemaTools: Record<string, ToolHandler>;
