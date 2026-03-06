import type { RequestContext } from "../../server/context.js";
import { qualifyTable, quoteIdent, vectorToSql } from "../../utils/sql.js";

type ToolHandler = (context: RequestContext, input: Record<string, unknown>) => Promise<Record<string, unknown>>;

export const vectorSearchTools: Record<string, ToolHandler> = {
  async create_vector_table(context, input) {
    const schema = String(input.schema ?? "public");
    const tableName = String(input.table_name);
    const dimension = Number(input.dimension);
    const metadataColumns = (input.metadata_columns as Array<Record<string, unknown>> | undefined) ?? [];

    const extraCols = metadataColumns
      .map((c) => `${quoteIdent(String(c.name))} ${String(c.type)}`)
      .join(", ");

    await context.managementApi.executeSql(`create extension if not exists vector;`);
    await context.managementApi.executeSql(`
      create table if not exists ${qualifyTable(schema, tableName)} (
        id bigserial primary key,
        content text not null,
        embedding vector(${dimension}) not null,
        metadata jsonb default '{}'::jsonb
        ${extraCols ? `, ${extraCols}` : ""}
      );
    `);

    await context.managementApi.executeSql(
      `create index if not exists ${quoteIdent(`${tableName}_embedding_idx`)} on ${qualifyTable(schema, tableName)} using ivfflat (embedding vector_cosine_ops);`,
    );

    return { success: true, table_name: tableName };
  },

  async insert_embedding(context, input) {
    const schema = String(input.schema ?? "public");
    const table = String(input.table);
    const content = String(input.content);
    const embedding = input.embedding as number[];
    const metadata = (input.metadata ?? {}) as Record<string, unknown>;

    const sql = `
      insert into ${qualifyTable(schema, table)} (content, embedding, metadata)
      values ('${content.replace(/'/g, "''")}', ${vectorToSql(embedding)}, '${JSON.stringify(metadata).replace(/'/g, "''")}'::jsonb)
      returning id;
    `;

    const rows = await context.managementApi.executeSql(sql);
    return { success: true, id: rows[0]?.id ?? "unknown" };
  },

  async search_embeddings(context, input) {
    const schema = String(input.schema ?? "public");
    const table = String(input.table);
    const queryEmbedding = input.query_embedding as number[];
    const topK = Number(input.top_k ?? 5);
    const threshold = input.similarity_threshold;

    const thresholdClause =
      typeof threshold === "number"
        ? `where (1 - (embedding <=> ${vectorToSql(queryEmbedding)})) >= ${threshold}`
        : "";

    const rows = await context.managementApi.executeSql(`
      select
        id,
        content,
        metadata,
        greatest(0, least(1, 1 - (embedding <=> ${vectorToSql(queryEmbedding)}))) as score
      from ${qualifyTable(schema, table)}
      ${thresholdClause}
      order by embedding <=> ${vectorToSql(queryEmbedding)}
      limit ${topK};
    `);

    return { matches: rows };
  },

  async delete_embedding(context, input) {
    const schema = String(input.schema ?? "public");
    const table = String(input.table);
    const id = input.id;
    const idLiteral = typeof id === "number" ? String(id) : `'${String(id).replace(/'/g, "''")}'`;

    await context.managementApi.executeSql(`delete from ${qualifyTable(schema, table)} where id = ${idLiteral};`);
    return { success: true };
  },
};
