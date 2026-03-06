# supabase-mcp

MCP server for controlled Supabase access across database, storage, vectors, auth, edge functions, and project metadata.

## Overview

`supabase-mcp` is a production-oriented MCP server written in TypeScript for secure, tiered Supabase operations.

- Implements the local schema in `../supabase_mcp_tool_schema.md`
- Uses official MCP TypeScript SDK
- Uses Zod for runtime validation
- Uses `@supabase/supabase-js` for CRUD/storage/auth/functions invoke flows
- Uses Supabase Management API for project metadata, SQL admin paths, function metadata, and diagnostics
- Enforces `read_only`, `builder`, `admin` access tiers
- Adds dangerous-action confirmation and audit logging

## Architecture

- `src/index.ts`: stdio MCP entrypoint
- `src/server/*`: server creation, authz enforcement, audit, errors, context
- `src/http/*`: HTTP handler-friendly MCP transport entrypoints
- `src/config/*`: env parsing, URL derivation, discovery logic
- `src/clients/*`: Supabase and Management API clients
- `src/tools/*`: tool handlers by group
- `src/schemas/*`: Zod schemas + permission metadata
- `src/utils/*`: logger, redaction, SQL helpers, HTTP helpers
- `scripts/*`: setup/discovery CLI helpers

## Security Model

- Tiered tool access:
  - `read_only`: retrieval and non-mutating operations
  - `builder`: read-only + non-destructive build operations
  - `admin`: full access including destructive/admin tools
- Dangerous tools require:
  - `MCP_ENABLE_DANGEROUS_TOOLS=true`
  - `confirm: true` input flag
- Admin and dangerous tools are audit logged to `MCP_AUDIT_LOG_PATH`.
- Secrets are redacted in normal logs and audit payloads.
- Service-role keys are never written unredacted in normal config logs.

## Environment Variables

Required core env:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_ANON_KEY` (optional if server can resolve via Management API)
- `SUPABASE_SERVICE_ROLE_KEY` (optional if server can resolve via Management API)
- `SUPABASE_URL`
- `SUPABASE_REST_URL`
- `SUPABASE_AUTH_URL`
- `SUPABASE_STORAGE_URL`
- `SUPABASE_FUNCTIONS_URL`
- `SUPABASE_MANAGEMENT_API_URL`
- `MCP_ACCESS_LEVEL`
- `MCP_ENABLE_DANGEROUS_TOOLS`
- `MCP_AUDIT_LOG_PATH`

Optional:

- `SUPABASE_DB_PASSWORD` (if you later add direct DB auth flow)
- `MCP_ENABLE_DRY_RUN`
- `MCP_TOOL_GROUPS` (`db,vector,storage,admin`)
- `SUPABASE_FUNCTION_DEPLOY_HOOK` (adapter for deploy/delete edge function)

## URL Derivation Rules

Given project ref `<project_ref>`:

- `SUPABASE_URL=https://<project_ref>.supabase.co`
- `SUPABASE_REST_URL=${SUPABASE_URL}/rest/v1`
- `SUPABASE_AUTH_URL=${SUPABASE_URL}/auth/v1`
- `SUPABASE_STORAGE_URL=${SUPABASE_URL}/storage/v1`
- `SUPABASE_FUNCTIONS_URL=${SUPABASE_URL}/functions/v1`
- `SUPABASE_MANAGEMENT_API_URL=https://api.supabase.com/v1`

## Setup and Discovery

Install:

```bash
npm install
```

Export Supabase access token + project ref in your current shell:

```bash
source scripts/export-supabase-env.sh --prompt
```

or:

```bash
source scripts/export-supabase-env.sh "<SUPABASE_ACCESS_TOKEN>" "<SUPABASE_PROJECT_REF>"
```

Optionally persist both to `.env`:

```bash
source scripts/export-supabase-env.sh --prompt --persist
```

If anon/service-role keys are not present, the server will attempt to resolve them via Management API when tools need them.

Run discovery:

```bash
npm run discover:supabase
```

Include existing secrets in `.env.generated` only when explicitly intended:

```bash
npm run discover:supabase -- --include-existing-secrets
```

Print resolved config:

```bash
npm run print:config
```

Terminal-only MCP tool test (without Inspector):

```bash
npm run tool -- list
npm run tool -- call get_project_info '{}'
npm run tool -- call list_tables '{"schema":"public"}'
```

This CLI runner uses `tsx src/index.ts` by default (no rebuild required after source edits).

Optional server command override for the CLI tester:

```bash
MCP_SERVER_COMMAND=node MCP_SERVER_ARGS="dist/src/index.js" npm run tool -- list
```

## Run

Dev:

```bash
npm run dev
```

Build/start:

```bash
npm run build
npm run start
```

Typecheck/lint:

```bash
npm run typecheck
npm run lint
```

## Access Tier Configuration

- `MCP_ACCESS_LEVEL=read_only`
- `MCP_ACCESS_LEVEL=builder`
- `MCP_ACCESS_LEVEL=admin`

Enable dangerous tools explicitly:

```bash
MCP_ENABLE_DANGEROUS_TOOLS=true
```

Dry-run dangerous tools without execution:

```bash
MCP_ENABLE_DRY_RUN=true
```

## Runtime Config Injection

`createServer(config?)` now supports runtime override injection:

- static override: `runtimeConfig`
- per-request override: `resolveRuntimeConfig`

HTTP handlers can inject runtime token/project-ref from headers (validated with Zod):

- `Authorization: Bearer <token>` or `x-supabase-access-token`
- `x-supabase-project-ref`
- optional `x-mcp-access-level`, `x-mcp-enable-dangerous-tools`, `x-mcp-actor`

Use:

- [createServer.ts](/Users/eii_zy/Downloads/SupabaseMCP/supabase-mcp/src/server/createServer.ts)
- [createHttpHandler.ts](/Users/eii_zy/Downloads/SupabaseMCP/supabase-mcp/src/http/createHttpHandler.ts)
- [vercel.ts](/Users/eii_zy/Downloads/SupabaseMCP/supabase-mcp/src/http/vercel.ts)

## Vercel Deployment

This repo now includes:

- [vercel.json](/Users/eii_zy/Downloads/SupabaseMCP/supabase-mcp/vercel.json)
- [api/mcp.ts](/Users/eii_zy/Downloads/SupabaseMCP/supabase-mcp/api/mcp.ts)

It exposes MCP HTTP endpoint at `/mcp` (rewritten to `/api/mcp`).

Set Vercel environment variables:

- `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF` (or inject at runtime via headers)
- Any optional MCP flags you need (`MCP_ACCESS_LEVEL`, `MCP_ENABLE_DANGEROUS_TOOLS`, etc.)

Runtime header injection on deployed endpoint:

- `Authorization: Bearer <supabase_access_token>` or `x-supabase-access-token`
- `x-supabase-project-ref`
- optional `x-mcp-access-level`, `x-mcp-enable-dangerous-tools`, `x-mcp-actor`

## Tool Examples

`select_rows`:

```json
{
  "table": "orders",
  "filters": [{ "column": "status", "operator": "eq", "value": "open" }],
  "limit": 20
}
```

`execute_sql` (admin + dangerous + confirmed):

```json
{
  "sql": "select now()",
  "read_only": true,
  "confirm": true
}
```

`get_api_keys` (redacted default):

```json
{}
```

`get_api_keys` reveal mode (admin + confirmed):

```json
{
  "reveal": true,
  "confirm": true
}
```

`list_projects` (admin):

```json
{}
```

`create_project` (admin + dangerous + confirmed):

```json
{
  "name": "new-project-name",
  "organization_id": "org_xxxxx",
  "region": "us-east-1",
  "confirm": true
}
```

## Warnings

- Do not run with service-role key in broadly shared agent contexts.
- Keep `MCP_ACCESS_LEVEL=admin` limited to tightly controlled operators.
- Keep `MCP_ENABLE_DANGEROUS_TOOLS=false` by default.

## Edge Functions Deploy Adapter

Direct deployment is environment-dependent; this server provides an adapter boundary:

- Set `SUPABASE_FUNCTION_DEPLOY_HOOK`
- `deploy_function` calls `POST {hook}/{project_ref}/{name}` with `source_code` and `verify_jwt`
- `delete_function` uses Management API delete endpoint

## Future Roadmap

- `list_rls_policies`
- `create_rls_policy`
- `list_triggers`
- `create_trigger`
- `list_rpc_functions`
- `invoke_rpc`
- `generate_typescript_types`
- `get_table_relationships`
- `clone_table_structure`

## Honest Limitations

- Management API endpoints can vary by account/plan/version; some operations may return `NOT_IMPLEMENTED` until adapter or endpoint alignment is added.
- `get_logs` includes a graceful typed fallback if log endpoint coverage is unavailable.
- SQL execution/migrations rely on Management API query support in your environment.
