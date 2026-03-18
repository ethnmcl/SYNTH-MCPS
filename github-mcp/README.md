# github-mcp

A production-style, extensible GitHub MCP server built with TypeScript, Node.js, MCP TypeScript SDK, Octokit, and Zod.

## What this project is

`github-mcp` is a custom Model Context Protocol (MCP) server that exposes GitHub operations as MCP tools for AI clients.

It is designed for:
- safe repository inspection and automation
- controlled write operations with policy guardrails
- easy extension for internal workflows
- local development first, deployment-ready structure

## Why this exists

GitHub workflows are often highly organization-specific. This server gives you direct control over:
- tool shape and naming
- auth behavior and safety rules
- owner/repo allowlists
- future custom tools (internal process automation)

## Why build this when GitHub has an official MCP server?

This repo is intended for custom internal workflows, tighter operational control, rapid experimentation, and extension points that can be adapted without waiting for upstream changes.

## Features

- TypeScript + strict compiler settings
- MCP tool registration with centralized registry
- GitHub REST + GraphQL integrations via Octokit
- Zod validation on all tool inputs
- clear error normalization and structured tool outputs
- read-only mode and allowlist scaffolding
- stdio MCP transport for local usage
- HTTP transport scaffold for future remote hosting
- test scaffolding (Vitest)

## Architecture

- `src/index.ts`: startup entry
- `src/server/createServer.ts`: MCP server factory
- `src/server/registerTools.ts`: central tool registration
- `src/server/transport/stdio.ts`: stdio transport runtime
- `src/server/transport/http.ts`: HTTP scaffold runtime
- `src/config/*`: environment loading and constants
- `src/github/*`: GitHub client/auth/graphql/permissions
- `src/tools/*`: category-based tool modules
- `src/utils/*`: logger/errors/result/text/pagination helpers
- `tests/*`: smoke and unit tests

## Tool inventory

### Repository / files
- `github_get_repo`
- `github_list_user_repos`
- `github_list_org_repos`
- `github_list_repo_branches`
- `github_list_repo_tags`
- `github_get_repo_contents`
- `github_get_directory_contents`
- `github_read_file`
- `github_get_default_branch`
- `github_get_commit`
- `github_compare_commits`

### Search
- `github_search_code`
- `github_search_repositories`
- `github_search_issues_and_pull_requests`
- `github_search_users`

### Issues
- `github_list_issues`
- `github_get_issue`
- `github_create_issue`
- `github_update_issue`
- `github_close_issue`
- `github_reopen_issue`
- `github_add_issue_comment`
- `github_list_issue_comments`
- `github_add_labels_to_issue`
- `github_remove_label_from_issue`
- `github_assign_issue`
- `github_unassign_issue`

### Pull requests
- `github_list_pull_requests`
- `github_get_pull_request`
- `github_create_pull_request`
- `github_update_pull_request`
- `github_merge_pull_request`
- `github_close_pull_request`
- `github_reopen_pull_request`
- `github_request_reviewers`
- `github_submit_pull_request_review_comment`
- `github_list_pull_request_files`
- `github_list_pull_request_commits`
- `github_get_pull_request_diff`

### Branch/file commits
- `github_create_branch`
- `github_create_or_update_file`
- `github_delete_file`
- `github_create_commit_from_file_changes`

### Actions
- `github_list_workflows`
- `github_get_workflow`
- `github_list_workflow_runs`
- `github_get_workflow_run`
- `github_rerun_workflow`
- `github_cancel_workflow_run`
- `github_dispatch_workflow`
- `github_get_workflow_run_logs_info`

### Releases
- `github_list_releases`
- `github_get_release`
- `github_create_release`
- `github_update_release`

### Orgs/users
- `github_get_user`
- `github_get_org`
- `github_list_org_members`
- `github_list_teams`

### Discussions (GraphQL)
- `github_list_discussions`
- `github_get_discussion`
- `github_create_discussion`

### Projects (GraphQL)
- `github_list_projects`
- `github_get_project`

### Diagnostics
- `github_get_rate_limit`
- `github_get_viewer`
- `github_validate_auth`

## Environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Supported environment variables:
- `GITHUB_TOKEN=`
- `GITHUB_API_URL=https://api.github.com`
- `GITHUB_USER_AGENT=github-mcp`
- `MCP_TRANSPORT=stdio`
- `PORT=8787`
- `GITHUB_READ_ONLY=false`
- `GITHUB_ALLOWED_OWNERS=` (comma-separated)
- `GITHUB_ALLOWED_REPOS=` (comma-separated `owner/repo`)

## Setup

```bash
npm install
npm run build
```

## Development commands

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run start
```

## MCP transport modes

### stdio mode

Default mode. Set:

```env
MCP_TRANSPORT=stdio
```

Then run:

```bash
npm run dev
```

Use this in local MCP clients that spawn the server process.

### HTTP scaffold mode

Set:

```env
MCP_TRANSPORT=http
PORT=8787
```

Then run:

```bash
npm run dev
```

Exposes:
- `GET /health` (ready)
- `POST /mcp` (scaffold placeholder)

## GitHub PAT setup guidance

1. Create a fine-grained PAT or classic PAT with least privilege.
2. For read-only usage, grant read scopes only.
3. For write tools, include repository write permissions (issues, pulls, contents, actions, releases as needed).
4. Set token in `.env` as `GITHUB_TOKEN=...`.

## GitHub Enterprise notes

Set:

```env
GITHUB_API_URL=https://your-ghes.example.com/api/v3
```

Octokit uses this base URL for REST and derives GraphQL calls from the same client.

## Security notes

- Secrets are never logged.
- Write operations can be globally disabled with `GITHUB_READ_ONLY=true`.
- Repository access can be constrained with allowlists.
- File delete/update tools require explicit SHA safety checks.

## Example MCP client config

Example (client-specific shape may vary):

```json
{
  "mcpServers": {
    "github-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/github-mcp/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}",
        "MCP_TRANSPORT": "stdio"
      }
    }
  }
}
```

## Example prompts

- "List open pull requests in `owner/repo`."
- "Read `src/index.ts` from `owner/repo` on branch `main`."
- "Create an issue in `owner/repo` titled 'Bug: ...'."
- "Dispatch workflow `ci.yml` on branch `main` with input `target=staging`."
- "Show my current GitHub API rate limit and auth status."

## Roadmap

- full HTTP MCP request handling
- richer permission policy engine (per-tool toggles)
- granular audit logging hooks
- pagination cursor helpers for very large repositories
- optional caching and retry/backoff configuration

## Known limitations

- HTTP transport is scaffolded, not fully wired to MCP request handling yet.
- Some Discussions/Projects operations rely on GraphQL IDs and repository/category setup.
- Tool responses are intentionally concise and may omit rarely used response fields.
