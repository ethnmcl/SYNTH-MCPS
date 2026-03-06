import { qualifyTable, quoteIdent } from "../../utils/sql.js";
import type { RequestContext } from "../../server/context.js";

export type ToolHandler = (context: RequestContext, input: Record<string, unknown>) => Promise<Record<string, unknown>>;

async function ensureMigrationTable(context: RequestContext): Promise<void> {
  await context.managementApi.executeSql(`
    create table if not exists public.mcp_migrations (
      id text primary key,
      name text not null,
      sql text not null,
      applied_at timestamptz not null default now()
    );
  `);
}

export const databaseSchemaTools: Record<string, ToolHandler> = {
  async list_tables(context, input) {
    const schema = String(input.schema ?? "public");
    const rows = await context.managementApi.executeSql(`
      select table_name as name, table_schema as schema
      from information_schema.tables
      where table_schema = '${schema.replace(/'/g, "''")}'
      and table_type = 'BASE TABLE'
      order by table_name;
    `);
    return { tables: rows };
  },

  async get_table_schema(context, input) {
    const schema = String(input.schema ?? "public");
    const table = String(input.table);
    const rows = await context.managementApi.executeSql(`
      select
        c.column_name as name,
        c.data_type as type,
        (c.is_nullable = 'YES') as nullable,
        c.column_default as "default",
        exists (
          select 1
          from information_schema.table_constraints tc
          join information_schema.key_column_usage kcu
            on tc.constraint_name = kcu.constraint_name
           and tc.table_schema = kcu.table_schema
         where tc.constraint_type = 'PRIMARY KEY'
           and tc.table_schema = c.table_schema
           and tc.table_name = c.table_name
           and kcu.column_name = c.column_name
        ) as primary_key
      from information_schema.columns c
      where c.table_schema = '${schema.replace(/'/g, "''")}'
        and c.table_name = '${table.replace(/'/g, "''")}'
      order by c.ordinal_position;
    `);
    return { table, columns: rows };
  },

  async create_table(context, input) {
    const schema = String(input.schema ?? "public");
    const tableName = String(input.table_name);
    const columns = input.columns as Array<Record<string, unknown>>;

    const sqlColumns = columns
      .map((column) => {
        const name = quoteIdent(String(column.name));
        const type = String(column.type);
        const nullable = column.nullable === false ? " NOT NULL" : "";
        const pk = column.primary_key === true ? " PRIMARY KEY" : "";
        const unique = column.unique === true ? " UNIQUE" : "";
        const def = column.default !== undefined && column.default !== null ? ` DEFAULT ${column.default}` : "";
        return `${name} ${type}${nullable}${unique}${pk}${def}`;
      })
      .join(",\n");

    const sql = `create table if not exists ${qualifyTable(schema, tableName)} (${sqlColumns});`;
    await context.managementApi.executeSql(sql);
    return { success: true, table_name: tableName };
  },

  async alter_table(context, input) {
    const schema = String(input.schema ?? "public");
    const table = String(input.table);
    const operations = input.operations as Array<Record<string, unknown>>;

    for (const op of operations) {
      const action = String(op.action);
      if (action === "add_column") {
        await context.managementApi.executeSql(
          `alter table ${qualifyTable(schema, table)} add column if not exists ${quoteIdent(String(op.column))} ${String(op.column_type)};`,
        );
      } else if (action === "drop_column") {
        await context.managementApi.executeSql(
          `alter table ${qualifyTable(schema, table)} drop column if exists ${quoteIdent(String(op.column))};`,
        );
      } else if (action === "rename_column") {
        await context.managementApi.executeSql(
          `alter table ${qualifyTable(schema, table)} rename column ${quoteIdent(String(op.column))} to ${quoteIdent(String(op.new_name))};`,
        );
      } else if (action === "alter_column_type") {
        await context.managementApi.executeSql(
          `alter table ${qualifyTable(schema, table)} alter column ${quoteIdent(String(op.column))} type ${String(op.column_type)};`,
        );
      }
    }

    return { success: true, applied_operations: operations.length };
  },

  async create_index(context, input) {
    const schema = String(input.schema ?? "public");
    const table = String(input.table);
    const columns = (input.columns as string[]).map((col) => quoteIdent(col)).join(", ");
    const unique = input.unique === true ? "unique " : "";
    const derivedName = `${table}_${(input.columns as string[]).join("_")}_idx`;
    const indexName = String(input.index_name ?? derivedName);
    await context.managementApi.executeSql(
      `create ${unique}index if not exists ${quoteIdent(indexName)} on ${qualifyTable(schema, table)} (${columns});`,
    );
    return { success: true, index_name: indexName };
  },

  async list_migrations(context) {
    await ensureMigrationTable(context);
    const rows = await context.managementApi.executeSql(
      "select id, name, applied_at from public.mcp_migrations order by applied_at desc;",
    );
    return { migrations: rows };
  },

  async apply_migration(context, input) {
    await ensureMigrationTable(context);
    const name = String(input.name);
    const sql = String(input.sql);
    const id = `${Date.now()}_${name.replace(/[^a-zA-Z0-9_]/g, "_")}`;

    await context.managementApi.executeSql("begin;");
    try {
      await context.managementApi.executeSql(sql);
      await context.managementApi.executeSql(
        `insert into public.mcp_migrations (id, name, sql) values ('${id}', '${name.replace(/'/g, "''")}', '${sql.replace(/'/g, "''")}');`,
      );
      await context.managementApi.executeSql("commit;");
    } catch (error) {
      await context.managementApi.executeSql("rollback;");
      throw error;
    }

    return { success: true, migration_name: name };
  },
};
