import { z } from "zod";

export const IdentifierSchema = z
  .string()
  .min(1)
  .max(63)
  .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Invalid SQL identifier");

export const SchemaNameSchema = IdentifierSchema.default("public");

export const JsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(JsonValueSchema),
  ]),
);

export const FilterOperatorSchema = z.enum([
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "like",
  "ilike",
  "in",
]);

export const FilterSchema = z.object({
  column: IdentifierSchema,
  operator: FilterOperatorSchema,
  value: z.unknown(),
});

export const ConfirmDangerousSchema = z.object({
  confirm: z.boolean().default(false),
});

export const RedactionSensitiveKeys = [
  "password",
  "token",
  "access_token",
  "refresh_token",
  "service_role_key",
  "anon_key",
  "secret",
  "authorization",
  "apikey",
] as const;
