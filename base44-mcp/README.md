# base44-mcp

A production-grade custom MCP server (TypeScript) for Base44-oriented orchestration workflows.

## Overview

`base44-mcp` is a custom orchestration layer for Base44 backend projects, entities, functions, integrations, connectors, skills, deployment helpers, docs helpers, local project operations, and guarded admin utilities.

This is not an official clone of Base44's hosted MCP. It is intentionally designed as an extensible server scaffold that can be wired to real Base44 APIs, CLI commands, or project files over time.

## Why This Exists

Base44 workflows usually cross multiple domains:

- backend projects
- entities and schema definitions
- functions and runtime logic
- integrations and connectors
- skills and prompt-like assets
- deployment lifecycle
- local repository structure

This server exposes all those domains behind one MCP tool surface with strict validation, safety guards, and audit tracking.

## Architecture

- `src/tools/*`: MCP-facing handlers only (input validation + service delegation)
- `src/services/*`: business logic, safety checks, mutation audit hooks
- `src/clients/*`: external integration adapters (Base44 API, docs, local filesystem)
- `src/schemas/*`: strict Zod contracts for every tool
- `src/core/*`: shared types, errors, registry, result helpers, audit primitives
- `src/config/*`: env parsing, constants, permission guards

## Folder Structure

- `src/config`
- `src/core`
- `src/schemas`
- `src/clients`
- `src/services`
- `src/tools`
- `src/utils`
- `src/templates/base44`
- `src/tests`

## Environment Variables

See `.env.example`:

- `BASE44_API_BASE_URL`
- `BASE44_DOCS_BASE_URL`
- `BASE44_CLIENT_ID`
- `BASE44_CLIENT_SECRET`
- `BASE44_REDIRECT_URI`
- `BASE44_ACCESS_TOKEN`
- `BASE44_REFRESH_TOKEN`
- `BASE44_WORKSPACE_ID`
- `BASE44_PROJECT_ID`
- `BASE44_MOCK_MODE`
- `LOG_LEVEL`
- `ALLOW_DESTRUCTIVE_TOOLS`
- `MCP_SERVER_NAME`
- `MCP_SERVER_VERSION`

## Install

```bash
npm install
```

## Run In Dev

```bash
npm run dev
```

## Build + Start

```bash
npm run build
npm run start
```

## Quality Commands

```bash
npm run typecheck
npm run lint
npm run test
```

## MCP Client Connection (stdio)

Use stdio transport:

- command: `node`
- args: `dist/index.js`

For development, run `tsx src/index.ts`.

## Full Tool Catalog

### Auth

- `login`
- `logout`
- `whoami`
- `list_workspaces`

### Projects

- `create_project`
- `list_projects`
- `get_project`
- `update_project`
- `delete_project`
- `clone_project`
- `set_active_project`

### Entities

- `list_entities`
- `get_entity`
- `create_entity`
- `update_entity`
- `delete_entity`
- `validate_entity_schema`
- `generate_entity_from_json`

### Functions

- `list_functions`
- `get_function`
- `create_function`
- `update_function`
- `delete_function`
- `run_function_local`
- `generate_function_boilerplate`

### Integrations

- `list_integrations`
- `get_integration`
- `create_workspace_integration_from_openapi`
- `update_integration`
- `delete_integration`
- `test_integration`
- `set_integration_secret_reference`

### Connectors

- `list_connectors`
- `get_connector`
- `configure_connector`
- `disconnect_connector`

### Skills

- `list_skills`
- `get_skill`
- `create_skill`
- `update_skill`
- `delete_skill`

### Deployments / Structure

- `deploy_project`
- `check_deploy_status`
- `validate_project_structure`
- `sync_local_project`

### Files

- `read_project_file`
- `write_project_file`
- `list_project_files`
- `create_config_jsonc`

### Docs

- `search_base44_docs`
- `get_doc_page`
- `recommend_next_steps`

### Admin

- `get_server_health`
- `get_audit_log`
- `clear_audit_log`
- `get_tool_metadata`

## Local Project Awareness

`validate_project_structure` checks for:

- `base44/config.jsonc`
- `base44/entities`
- `base44/functions`
- `base44/skills`
- `base44/connectors`
- `base44/integrations`

`create_config_jsonc` generates starter config content from `src/templates/base44/config.jsonc.template`.

## Mock Mode

When `BASE44_MOCK_MODE=true`, client operations return realistic mock data for orchestration and testing.

When `BASE44_MOCK_MODE=false`, `Base44Client` intentionally throws `501` until real API wiring is implemented.

## Safety / Guardrails

Destructive tools require both:

- `confirmDangerous: true` in tool input
- `ALLOW_DESTRUCTIVE_TOOLS=true` in environment

Destructive domains include project/entity/function/integration/skill delete actions and audit log clear actions.

Every mutating tool writes an in-memory audit entry.

## Extension Roadmap

1. Replace mock `Base44Client` methods with real HTTP/OAuth flows.
2. Add optional Base44 CLI bridge client.
3. Add persistent audit storage (SQLite/Postgres).
4. Add richer sync logic for local Base44 project manifests.
5. Add schema parity with future Base44 public API contracts.

## Future Wiring Examples

- Wire `src/clients/base44-client.ts` to typed API calls and token refresh logic.
- Keep `src/services/*` stable as domain orchestration layer.
- Keep `src/tools/*` stable so MCP clients do not need to change.
