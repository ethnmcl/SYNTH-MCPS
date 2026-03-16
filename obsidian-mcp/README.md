# obsidian-mcp

`obsidian-mcp` is a production-oriented Model Context Protocol (MCP) server that connects AI clients to a local Obsidian vault with safe-by-default file boundaries and structured tool outputs.

## Overview

This server exposes tools for reading, searching, editing, indexing, and validating Obsidian notes while enforcing vault-root safety constraints and explicit write/delete controls.

## Features

- 41 MCP tools across note CRUD, search, graph, tasks, daily notes, templates, summaries, indexing, and validation.
- JSON Schema 2020-12-compatible tool input schemas.
- Path normalization and traversal prevention for all file operations.
- Soft delete to vault-local trash by default.
- Optional semantic search using a pluggable embedding adapter (`local-stub` included).
- MCP prompt and resource support for discovery-rich clients.
- Dual transport support:
  - STDIO for desktop MCP clients (Claude Desktop, Cursor)
  - Streamable HTTP for remote MCP clients and orchestration tools
- STDERR-only logging (safe for STDIO MCP transport).

## Architecture

- `src/createServer.ts`: shared MCP server construction and tool registration.
- `src/server.ts`: STDIO entrypoint.
- `src/httpServer.ts`: Streamable HTTP entrypoint (`/mcp`, `/health`).
- `src/config.ts`: env loading + validation.
- `src/services/*`: vault, note, search, graph, task, daily note, templates, embeddings, indexing.
- `src/tools/*`: MCP tool definitions and execution.
- `src/prompts/*`: MCP prompt registrations.
- `src/resources/*`: MCP resource registrations.

## Tool Catalog

Core vault + note tools:

- `list_vault_info`
- `list_notes`
- `get_note`
- `get_note_metadata`
- `get_note_frontmatter`
- `create_note`
- `create_note_from_template`
- `update_note`
- `append_to_note`
- `prepend_to_note`
- `replace_in_note`
- `rename_note`
- `move_note`
- `delete_note`
- `bulk_delete_notes`

Search + retrieval:

- `search_notes`
- `search_by_tag`
- `search_by_frontmatter`
- `semantic_search_notes`
- `get_recent_notes`

Links + graph:

- `get_backlinks`
- `get_outgoing_links`
- `get_related_notes`
- `get_graph_neighborhood`
- `auto_link_suggestions`

Structure extraction:

- `get_tags`
- `get_headings`
- `extract_tasks`

Tasks:

- `create_task`
- `complete_task`
- `reopen_task`

Daily notes + templates:

- `list_daily_notes`
- `get_today_note`
- `create_today_note`
- `list_templates`

AI utilities:

- `summarize_note`
- `summarize_notes_batch`
- `generate_outline`

Indexing + health:

- `index_vault`
- `index_note`
- `validate_vault`

## Configuration

Copy `.env.example` to `.env`.

Required:

- `OBSIDIAN_VAULT_PATH`

Main options:

- `OBSIDIAN_TRASH_DIR=.trash`
- `OBSIDIAN_DAILY_NOTES_DIR=Daily`
- `OBSIDIAN_TEMPLATES_DIR=Templates`
- `OBSIDIAN_DEFAULT_NOTE_EXTENSION=.md`
- `OBSIDIAN_ENABLE_SEMANTIC_SEARCH=true|false`
- `OBSIDIAN_EMBEDDING_PROVIDER=local-stub`
- `OBSIDIAN_MAX_FILE_SIZE_MB=5`
- `OBSIDIAN_ALLOWED_WRITE=true|false`
- `OBSIDIAN_ALLOWED_DELETE=true|false`
- `OBSIDIAN_INDEX_CACHE_FILE=.obsidian-mcp/index.json`
- `OBSIDIAN_TIMEZONE=UTC`
- `MCP_HTTP_HOST=127.0.0.1`
- `MCP_HTTP_PORT=8787`

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

## Run

STDIO (desktop clients):

```bash
npm run dev
# or
npm start
```

Streamable HTTP:

```bash
npm run dev:http
# or
npm run start:http
```

HTTP endpoints:

- MCP endpoint: `http://<host>:<port>/mcp`
- Health: `http://<host>:<port>/health`

## STDIO Usage Note

This server is intended to run over STDIO for local desktop MCP clients. It never logs to stdout. Logs are emitted to stderr only.

## Sample MCP Client Config

Claude/Cursor-style STDIO config:

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "node",
      "args": ["/absolute/path/to/obsidian-mcp/dist/server.js"],
      "env": {
        "OBSIDIAN_VAULT_PATH": "/absolute/path/to/your/vault"
      }
    }
  }
}
```

## Example Tool Calls

- `list_vault_info {}`
- `get_note {"note":"Projects/Roadmap"}`
- `search_notes {"query":"vector index","limit":10}`
- `create_note {"title":"Meeting Notes","folder":"Work","content":"# Meeting"}`
- `delete_note {"note":"Old/LegacyNote","permanent":false}`

## Why this MCP server is safe by default

- Vault root restriction: all paths are normalized and forced to remain within `OBSIDIAN_VAULT_PATH`.
- Soft delete: deletes move notes to `.trash/` by default.
- Write/delete permission flags: `OBSIDIAN_ALLOWED_WRITE` and `OBSIDIAN_ALLOWED_DELETE` gate destructive actions.
- No stdout logging in STDIO mode: avoids corrupting MCP protocol frames.
- Explicit semantic search toggle: semantic indexing/search can be disabled with `OBSIDIAN_ENABLE_SEMANTIC_SEARCH=false`.

## Security Notes

- Internal path traversal (`../`) is blocked.
- External link targets are not followed for file operations.
- Oversized notes are reported by validation tooling.

## Extension Roadmap

- Strict per-tool runtime schema validation mapping to Zod.
- Pluggable external embedding providers.
- Persistent graph cache for large vaults.
- Template variable plugins.
- Optional ACL-based folder restrictions.
