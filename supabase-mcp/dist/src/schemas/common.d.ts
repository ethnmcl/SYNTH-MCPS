import { z } from "zod";
export declare const IdentifierSchema: z.ZodString;
export declare const SchemaNameSchema: z.ZodDefault<z.ZodString>;
export declare const JsonValueSchema: z.ZodType<unknown>;
export declare const FilterOperatorSchema: z.ZodEnum<["eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike", "in"]>;
export declare const FilterSchema: z.ZodObject<{
    column: z.ZodString;
    operator: z.ZodEnum<["eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike", "in"]>;
    value: z.ZodUnknown;
}, "strip", z.ZodTypeAny, {
    column: string;
    operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike" | "in";
    value?: unknown;
}, {
    column: string;
    operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike" | "in";
    value?: unknown;
}>;
export declare const ConfirmDangerousSchema: z.ZodObject<{
    confirm: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    confirm: boolean;
}, {
    confirm?: boolean | undefined;
}>;
export declare const RedactionSensitiveKeys: readonly ["password", "token", "access_token", "refresh_token", "service_role_key", "anon_key", "secret", "authorization", "apikey"];
