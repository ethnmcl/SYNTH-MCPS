import type { RequestContext } from "../../server/context.js";
import { ValidationError } from "../../server/errors.js";
import { requireServiceRoleClient } from "../../server/apiKeys.js";
import { isReadOnlySql } from "../../utils/sql.js";

type ToolHandler = (context: RequestContext, input: Record<string, unknown>) => Promise<Record<string, unknown>>;

function applyFilters(query: any, filters: Array<Record<string, unknown>>): any {
  let current = query;
  for (const filter of filters) {
    const column = String(filter.column);
    const op = String(filter.operator);
    const value = filter.value;

    switch (op) {
      case "eq":
        current = current.eq(column, value);
        break;
      case "neq":
        current = current.neq(column, value);
        break;
      case "gt":
        current = current.gt(column, value);
        break;
      case "gte":
        current = current.gte(column, value);
        break;
      case "lt":
        current = current.lt(column, value);
        break;
      case "lte":
        current = current.lte(column, value);
        break;
      case "like":
        current = current.like(column, String(value));
        break;
      case "ilike":
        current = current.ilike(column, String(value));
        break;
      case "in": {
        const array = Array.isArray(value) ? value : [value];
        current = current.in(column, array as any[]);
        break;
      }
      default:
        throw new ValidationError(`Unsupported filter operator: ${op}`);
    }
  }
  return current;
}

export const databaseDataTools: Record<string, ToolHandler> = {
  async select_rows(context, input) {
    const client = await requireServiceRoleClient(context);
    const schema = String(input.schema ?? "public");
    const table = String(input.table);
    const columns = Array.isArray(input.columns) ? (input.columns as string[]).join(",") : "*";
    const filters = (input.filters as Array<Record<string, unknown>> | undefined) ?? [];
    const limit = Number(input.limit ?? 50);

    const db: any = schema === "public" ? client : client.schema(schema);
    let query = db.from(table).select(columns, { count: "exact" }).limit(limit);
    query = applyFilters(query, filters);

    if (input.order_by) {
      query = query.order(String(input.order_by), { ascending: Boolean(input.ascending ?? true) });
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return { rows: data ?? [], count: count ?? 0 };
  },

  async insert_rows(context, input) {
    const client = await requireServiceRoleClient(context);
    const schema = String(input.schema ?? "public");
    const table = String(input.table);
    const rows = input.rows as Array<Record<string, unknown>>;

    const db: any = schema === "public" ? client : client.schema(schema);
    const { data, error } = await db.from(table).insert(rows).select();
    if (error) throw error;
    return { success: true, inserted_count: data?.length ?? rows.length };
  },

  async update_rows(context, input) {
    const client = await requireServiceRoleClient(context);
    const schema = String(input.schema ?? "public");
    const table = String(input.table);
    const filters = (input.filters as Array<Record<string, unknown>> | undefined) ?? [];
    const values = input.values as Record<string, unknown>;

    const db: any = schema === "public" ? client : client.schema(schema);
    let query = db.from(table).update(values).select();
    query = applyFilters(query, filters);

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, updated_count: data?.length ?? 0 };
  },

  async delete_rows(context, input) {
    const client = await requireServiceRoleClient(context);
    const schema = String(input.schema ?? "public");
    const table = String(input.table);
    const filters = (input.filters as Array<Record<string, unknown>> | undefined) ?? [];

    const db: any = schema === "public" ? client : client.schema(schema);
    let query = db.from(table).delete().select();
    query = applyFilters(query, filters);

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, deleted_count: data?.length ?? 0 };
  },

  async upsert_rows(context, input) {
    const client = await requireServiceRoleClient(context);
    const schema = String(input.schema ?? "public");
    const table = String(input.table);
    const rows = input.rows as Array<Record<string, unknown>>;
    const onConflict = (input.on_conflict as string[]).join(",");

    const db: any = schema === "public" ? client : client.schema(schema);
    const { data, error } = await db
      .from(table)
      .upsert(rows, { onConflict })
      .select();

    if (error) throw error;
    return { success: true, affected_count: data?.length ?? rows.length };
  },

  async execute_sql(context, input) {
    const sql = String(input.sql);
    const readOnly = Boolean(input.read_only ?? false);

    if (readOnly && !isReadOnlySql(sql)) {
      throw new ValidationError("SQL is not read-only but read_only=true was requested.");
    }

    const rows = await context.managementApi.executeSql(sql);
    return { rows, row_count: rows.length, success: true };
  },
};
