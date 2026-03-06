import { z } from "zod";
import { ConfirmDangerousSchema, FilterSchema, IdentifierSchema, JsonValueSchema, SchemaNameSchema } from "./common.js";
const SuccessOut = z.object({ success: z.boolean() });
const ListTablesIn = z.object({ schema: SchemaNameSchema.optional().default("public") });
const ListTablesOut = z.object({ tables: z.array(z.object({ name: z.string(), schema: z.string() })) });
const TableSchemaIn = z.object({ schema: SchemaNameSchema.optional().default("public"), table: IdentifierSchema });
const TableSchemaOut = z.object({
    table: z.string(),
    columns: z.array(z.object({
        name: z.string(),
        type: z.string(),
        nullable: z.boolean(),
        default: z.string().nullable(),
        primary_key: z.boolean(),
    })),
});
const CreateTableIn = z.object({
    schema: SchemaNameSchema.optional().default("public"),
    table_name: IdentifierSchema,
    columns: z.array(z.object({
        name: IdentifierSchema,
        type: z.string().min(1),
        nullable: z.boolean().default(true),
        primary_key: z.boolean().default(false),
        unique: z.boolean().default(false),
        default: z.string().nullable().optional(),
    })).min(1),
});
const AlterTableIn = z.object({
    schema: SchemaNameSchema.optional().default("public"),
    table: IdentifierSchema,
    operations: z.array(z.object({
        action: z.enum(["add_column", "drop_column", "rename_column", "alter_column_type"]),
        column: IdentifierSchema.optional(),
        new_name: IdentifierSchema.optional(),
        column_type: z.string().optional(),
    })).min(1),
});
const CreateIndexIn = z.object({
    schema: SchemaNameSchema.optional().default("public"),
    table: IdentifierSchema,
    columns: z.array(IdentifierSchema).min(1),
    index_name: IdentifierSchema.optional(),
    unique: z.boolean().default(false),
});
const ListMigrationsOut = z.object({ migrations: z.array(z.object({ id: z.string(), name: z.string(), applied_at: z.string() })) });
const ApplyMigrationIn = z.object({ name: z.string().min(1), sql: z.string().min(1) }).merge(ConfirmDangerousSchema);
const SelectRowsIn = z.object({
    schema: SchemaNameSchema.optional().default("public"),
    table: IdentifierSchema,
    columns: z.array(z.union([IdentifierSchema, z.literal("*")])).optional().default(["*"]),
    filters: z.array(FilterSchema).optional().default([]),
    limit: z.number().int().positive().max(1000).default(50),
    order_by: IdentifierSchema.optional(),
    ascending: z.boolean().default(true),
});
const SelectRowsOut = z.object({ rows: z.array(z.record(JsonValueSchema)), count: z.number().int() });
const InsertRowsIn = z.object({ schema: SchemaNameSchema.optional().default("public"), table: IdentifierSchema, rows: z.array(z.record(JsonValueSchema)).min(1) });
const UpdateRowsIn = z.object({ schema: SchemaNameSchema.optional().default("public"), table: IdentifierSchema, values: z.record(JsonValueSchema), filters: z.array(FilterSchema).min(1) });
const DeleteRowsIn = z.object({ schema: SchemaNameSchema.optional().default("public"), table: IdentifierSchema, filters: z.array(FilterSchema).min(1) }).merge(ConfirmDangerousSchema);
const UpsertRowsIn = z.object({
    schema: SchemaNameSchema.optional().default("public"),
    table: IdentifierSchema,
    rows: z.array(z.record(JsonValueSchema)).min(1),
    on_conflict: z.array(IdentifierSchema).min(1),
});
const ExecuteSqlIn = z.object({ sql: z.string().min(1), read_only: z.boolean().default(false) }).merge(ConfirmDangerousSchema);
const ExecuteSqlOut = z.object({ rows: z.array(z.record(JsonValueSchema)), row_count: z.number().int(), success: z.boolean() });
const CreateVectorTableIn = z.object({
    schema: SchemaNameSchema.optional().default("public"),
    table_name: IdentifierSchema,
    dimension: z.number().int().positive().max(8192),
    metadata_columns: z.array(z.object({ name: IdentifierSchema, type: z.string().min(1) })).optional().default([]),
});
const InsertEmbeddingIn = z.object({
    schema: SchemaNameSchema.optional().default("public"),
    table: IdentifierSchema,
    content: z.string(),
    embedding: z.array(z.number()).min(1),
    metadata: z.record(JsonValueSchema).optional(),
});
const SearchEmbeddingsIn = z.object({
    schema: SchemaNameSchema.optional().default("public"),
    table: IdentifierSchema,
    query_embedding: z.array(z.number()).min(1),
    top_k: z.number().int().positive().max(100).default(5),
    similarity_threshold: z.number().min(0).max(1).optional(),
});
const DeleteEmbeddingIn = z.object({ schema: SchemaNameSchema.optional().default("public"), table: IdentifierSchema, id: z.union([z.string(), z.number()]) }).merge(ConfirmDangerousSchema);
const ListBucketsOut = z.object({ buckets: z.array(z.object({ name: z.string(), public: z.boolean().nullable().optional() })) });
const CreateBucketIn = z.object({ name: z.string().min(1), public: z.boolean().default(false) });
const ListFilesIn = z.object({ bucket: z.string().min(1), path: z.string().default("") });
const UploadFileIn = z.object({
    bucket: z.string().min(1),
    path: z.string().min(1),
    content: z.string(),
    content_type: z.string().optional(),
    encoding: z.enum(["text", "base64"]).default("text"),
});
const DownloadFileIn = z.object({ bucket: z.string().min(1), path: z.string().min(1) });
const DeleteFileIn = z.object({ bucket: z.string().min(1), path: z.string().min(1) }).merge(ConfirmDangerousSchema);
const ListUsersIn = z.object({ page: z.number().int().positive().default(1), per_page: z.number().int().positive().max(200).default(50) });
const CreateUserIn = z.object({ email: z.string().email(), password: z.string().optional(), email_confirm: z.boolean().default(true), user_metadata: z.record(JsonValueSchema).optional() });
const UpdateUserIn = z.object({ user_id: z.string().min(1), updates: z.record(JsonValueSchema) });
const DeleteUserIn = z.object({ user_id: z.string().min(1) }).merge(ConfirmDangerousSchema);
const DeployFunctionIn = z.object({ name: IdentifierSchema, source_code: z.string().min(1), verify_jwt: z.boolean().default(true) }).merge(ConfirmDangerousSchema);
const InvokeFunctionIn = z.object({ name: IdentifierSchema, payload: z.record(JsonValueSchema).optional().default({}) });
const DeleteFunctionIn = z.object({ name: IdentifierSchema }).merge(ConfirmDangerousSchema);
const GetApiKeysIn = z.object({ reveal: z.boolean().default(false) }).merge(ConfirmDangerousSchema);
const GetLogsIn = z.object({ log_type: z.enum(["database", "auth", "functions", "storage"]), limit: z.number().int().positive().max(1000).default(100) });
export const TOOL_DEFINITIONS = [
    { name: "list_tables", description: "List all tables in the connected Supabase database.", group: "database_schema", access_level: "read_only", dangerous: false, confirmation_required: false, audit_log: false, inputSchema: ListTablesIn, outputSchema: ListTablesOut },
    { name: "get_table_schema", description: "Return column definitions, constraints, and metadata for a table.", group: "database_schema", access_level: "read_only", dangerous: false, confirmation_required: false, audit_log: false, inputSchema: TableSchemaIn, outputSchema: TableSchemaOut },
    { name: "create_table", description: "Create a new table with specified columns.", group: "database_schema", access_level: "builder", dangerous: false, confirmation_required: false, audit_log: true, inputSchema: CreateTableIn, outputSchema: SuccessOut.extend({ table_name: z.string() }) },
    { name: "alter_table", description: "Add, modify, or drop columns in an existing table.", group: "database_schema", access_level: "builder", dangerous: false, confirmation_required: false, audit_log: true, inputSchema: AlterTableIn, outputSchema: SuccessOut.extend({ applied_operations: z.number().int() }) },
    { name: "create_index", description: "Create an index on one or more columns.", group: "database_schema", access_level: "builder", dangerous: false, confirmation_required: false, audit_log: true, inputSchema: CreateIndexIn, outputSchema: SuccessOut.extend({ index_name: z.string() }) },
    { name: "list_migrations", description: "List migration history for the Supabase project.", group: "database_schema", access_level: "admin", dangerous: false, confirmation_required: false, audit_log: true, inputSchema: z.object({}), outputSchema: ListMigrationsOut },
    { name: "apply_migration", description: "Apply a SQL migration to the Supabase database.", group: "database_schema", access_level: "admin", dangerous: true, confirmation_required: true, audit_log: true, inputSchema: ApplyMigrationIn, outputSchema: SuccessOut.extend({ migration_name: z.string() }) },
    { name: "select_rows", description: "Select rows from a table with optional filters, ordering, and limits.", group: "database_data", access_level: "read_only", dangerous: false, confirmation_required: false, audit_log: false, inputSchema: SelectRowsIn, outputSchema: SelectRowsOut },
    { name: "insert_rows", description: "Insert one or more rows into a table.", group: "database_data", access_level: "builder", dangerous: false, confirmation_required: false, audit_log: true, inputSchema: InsertRowsIn, outputSchema: SuccessOut.extend({ inserted_count: z.number().int() }) },
    { name: "update_rows", description: "Update rows in a table matching filters.", group: "database_data", access_level: "builder", dangerous: false, confirmation_required: false, audit_log: true, inputSchema: UpdateRowsIn, outputSchema: SuccessOut.extend({ updated_count: z.number().int() }) },
    { name: "delete_rows", description: "Delete rows from a table matching filters.", group: "database_data", access_level: "admin", dangerous: true, confirmation_required: true, audit_log: true, inputSchema: DeleteRowsIn, outputSchema: SuccessOut.extend({ deleted_count: z.number().int() }) },
    { name: "upsert_rows", description: "Insert or update rows based on conflict columns.", group: "database_data", access_level: "builder", dangerous: false, confirmation_required: false, audit_log: true, inputSchema: UpsertRowsIn, outputSchema: SuccessOut.extend({ affected_count: z.number().int() }) },
    { name: "execute_sql", description: "Execute SQL directly. Should be admin-restricted.", group: "database_data", access_level: "admin", dangerous: true, confirmation_required: true, audit_log: true, inputSchema: ExecuteSqlIn, outputSchema: ExecuteSqlOut },
    { name: "create_vector_table", description: "Create a vector-enabled table for embeddings.", group: "vector_search", access_level: "builder", dangerous: false, confirmation_required: false, audit_log: true, inputSchema: CreateVectorTableIn, outputSchema: SuccessOut.extend({ table_name: z.string() }) },
    { name: "insert_embedding", description: "Insert an embedding row with metadata.", group: "vector_search", access_level: "builder", dangerous: false, confirmation_required: false, audit_log: true, inputSchema: InsertEmbeddingIn, outputSchema: SuccessOut.extend({ id: z.union([z.string(), z.number()]) }) },
    { name: "search_embeddings", description: "Perform similarity search against stored embeddings.", group: "vector_search", access_level: "read_only", dangerous: false, confirmation_required: false, audit_log: false, inputSchema: SearchEmbeddingsIn, outputSchema: z.object({ matches: z.array(z.object({ id: z.unknown(), content: z.string(), metadata: z.record(JsonValueSchema).optional(), score: z.number() })) }) },
    { name: "delete_embedding", description: "Delete an embedding by id.", group: "vector_search", access_level: "admin", dangerous: true, confirmation_required: true, audit_log: true, inputSchema: DeleteEmbeddingIn, outputSchema: SuccessOut },
    { name: "list_buckets", description: "List storage buckets.", group: "storage", access_level: "read_only", dangerous: false, confirmation_required: false, audit_log: false, inputSchema: z.object({}), outputSchema: ListBucketsOut },
    { name: "create_bucket", description: "Create a storage bucket.", group: "storage", access_level: "builder", dangerous: false, confirmation_required: false, audit_log: true, inputSchema: CreateBucketIn, outputSchema: SuccessOut.extend({ bucket: z.string() }) },
    { name: "list_files", description: "List files in a bucket path.", group: "storage", access_level: "read_only", dangerous: false, confirmation_required: false, audit_log: false, inputSchema: ListFilesIn, outputSchema: z.object({ files: z.array(z.record(JsonValueSchema)) }) },
    { name: "upload_file", description: "Upload a file or binary payload to storage.", group: "storage", access_level: "builder", dangerous: false, confirmation_required: false, audit_log: true, inputSchema: UploadFileIn, outputSchema: SuccessOut.extend({ path: z.string() }) },
    { name: "download_file", description: "Download a file from storage.", group: "storage", access_level: "builder", dangerous: false, confirmation_required: false, audit_log: false, inputSchema: DownloadFileIn, outputSchema: z.object({ content: z.string(), content_type: z.string().optional() }) },
    { name: "delete_file", description: "Delete a file from storage.", group: "storage", access_level: "admin", dangerous: true, confirmation_required: true, audit_log: true, inputSchema: DeleteFileIn, outputSchema: SuccessOut },
    { name: "list_users", description: "List users in Supabase Auth.", group: "auth", access_level: "admin", dangerous: false, confirmation_required: false, audit_log: true, inputSchema: ListUsersIn, outputSchema: z.object({ users: z.array(z.record(JsonValueSchema)) }) },
    { name: "create_user", description: "Create a new auth user.", group: "auth", access_level: "admin", dangerous: true, confirmation_required: true, audit_log: true, inputSchema: CreateUserIn.merge(ConfirmDangerousSchema), outputSchema: SuccessOut.extend({ user_id: z.string() }) },
    { name: "update_user", description: "Update an auth user.", group: "auth", access_level: "admin", dangerous: true, confirmation_required: true, audit_log: true, inputSchema: UpdateUserIn.merge(ConfirmDangerousSchema), outputSchema: SuccessOut },
    { name: "delete_user", description: "Delete an auth user.", group: "auth", access_level: "admin", dangerous: true, confirmation_required: true, audit_log: true, inputSchema: DeleteUserIn, outputSchema: SuccessOut },
    { name: "list_functions", description: "List edge functions in the project.", group: "edge_functions", access_level: "builder", dangerous: false, confirmation_required: false, audit_log: true, inputSchema: z.object({}), outputSchema: z.object({ functions: z.array(z.object({ name: z.string() })) }) },
    { name: "deploy_function", description: "Deploy an edge function from source code.", group: "edge_functions", access_level: "builder", dangerous: true, confirmation_required: true, audit_log: true, inputSchema: DeployFunctionIn, outputSchema: SuccessOut.extend({ name: z.string() }) },
    { name: "invoke_function", description: "Invoke an edge function with JSON payload.", group: "edge_functions", access_level: "builder", dangerous: false, confirmation_required: false, audit_log: true, inputSchema: InvokeFunctionIn, outputSchema: z.object({ response: z.unknown() }) },
    { name: "delete_function", description: "Delete an edge function.", group: "edge_functions", access_level: "admin", dangerous: true, confirmation_required: true, audit_log: true, inputSchema: DeleteFunctionIn, outputSchema: SuccessOut },
    { name: "get_project_info", description: "Get project metadata such as project ref and region.", group: "project_admin", access_level: "read_only", dangerous: false, confirmation_required: false, audit_log: false, inputSchema: z.object({}), outputSchema: z.object({ project_ref: z.string(), name: z.string().optional(), region: z.string().optional() }) },
    { name: "get_project_url", description: "Return the project URL.", group: "project_admin", access_level: "read_only", dangerous: false, confirmation_required: false, audit_log: false, inputSchema: z.object({}), outputSchema: z.object({ url: z.string() }) },
    { name: "get_api_keys", description: "Return project API keys. Admin only.", group: "project_admin", access_level: "admin", dangerous: true, confirmation_required: true, audit_log: true, inputSchema: GetApiKeysIn, outputSchema: z.object({ anon_key: z.string().optional(), service_role_key: z.string().optional() }) },
    { name: "get_logs", description: "Fetch logs for database, auth, functions, or storage.", group: "project_admin", access_level: "read_only", dangerous: false, confirmation_required: false, audit_log: false, inputSchema: GetLogsIn, outputSchema: z.object({ logs: z.array(z.record(JsonValueSchema)) }) },
];
export const TOOL_BY_NAME = new Map(TOOL_DEFINITIONS.map((tool) => [tool.name, tool]));
