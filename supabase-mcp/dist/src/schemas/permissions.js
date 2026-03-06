import { z } from "zod";
export const AccessLevelSchema = z.enum(["read_only", "builder", "admin"]);
export const ToolGroupSchema = z.enum(["db", "vector", "storage", "admin"]);
const READ_ONLY_TOOLS = [
    "list_tables",
    "get_table_schema",
    "select_rows",
    "search_embeddings",
    "list_buckets",
    "list_files",
    "get_project_info",
    "get_project_url",
    "get_logs",
];
const BUILDER_EXTRA_TOOLS = [
    "create_table",
    "alter_table",
    "create_index",
    "insert_rows",
    "update_rows",
    "upsert_rows",
    "create_vector_table",
    "insert_embedding",
    "create_bucket",
    "upload_file",
    "download_file",
    "list_functions",
    "deploy_function",
    "invoke_function",
];
export const ADMIN_ONLY_TOOLS = [
    "delete_rows",
    "execute_sql",
    "list_users",
    "create_user",
    "update_user",
    "delete_user",
    "delete_file",
    "delete_embedding",
    "delete_function",
    "list_migrations",
    "apply_migration",
    "get_api_keys",
];
export const TOOL_ACCESS = Object.fromEntries([
    ...READ_ONLY_TOOLS.map((t) => [t, "read_only"]),
    ...BUILDER_EXTRA_TOOLS.map((t) => [t, "builder"]),
    ...ADMIN_ONLY_TOOLS.map((t) => [t, "admin"]),
]);
export function canAccess(current, required) {
    const rank = {
        read_only: 1,
        builder: 2,
        admin: 3,
    };
    return rank[current] >= rank[required];
}
export const DANGEROUS_TOOLS = new Set([
    "delete_rows",
    "execute_sql",
    "delete_file",
    "delete_embedding",
    "delete_user",
    "apply_migration",
    "deploy_function",
    "delete_function",
    "get_api_keys",
]);
export const TOOL_GROUP_MEMBERSHIP = {
    db: new Set([
        "list_tables",
        "get_table_schema",
        "create_table",
        "alter_table",
        "create_index",
        "list_migrations",
        "apply_migration",
        "select_rows",
        "insert_rows",
        "update_rows",
        "delete_rows",
        "upsert_rows",
        "execute_sql",
    ]),
    vector: new Set([
        "create_vector_table",
        "insert_embedding",
        "search_embeddings",
        "delete_embedding",
    ]),
    storage: new Set([
        "list_buckets",
        "create_bucket",
        "list_files",
        "upload_file",
        "download_file",
        "delete_file",
        "list_functions",
        "deploy_function",
        "invoke_function",
        "delete_function",
    ]),
    admin: new Set([
        "list_users",
        "create_user",
        "update_user",
        "delete_user",
        "get_project_info",
        "get_project_url",
        "get_api_keys",
        "get_logs",
    ]),
};
