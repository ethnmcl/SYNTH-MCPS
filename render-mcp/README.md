# render-mcp

`render-mcp` is a production-ready Model Context Protocol server that provides a controlled AI operator layer over Render infrastructure.

## Why this MCP exists
AI agents need rich infrastructure context, but production operations require policy guardrails, auditability, and strict control of destructive actions. This server separates read-heavy reasoning from controlled write execution.

## Features
- TypeScript MCP server using the official MCP SDK
- Modular architecture: server, config, policy, render adapter, mcp domain, audit
- Phase 1 read tools, Phase 2 safe write tools, Phase 3 ops workflows
- Structured resources for reasoning context
- Operational prompt templates
- Policy guardrails for read-only mode, production protection, approvals
- Structured audit logging for all mutating tools
- Zod validation and normalized error handling

## Architecture overview
- `src/server`: bootstrap + MCP registrations
- `src/config`: env loading and typed app config
- `src/policy`: read-only/prod/approval policy engine
- `src/render`: Render API adapter and endpoint modules
- `src/mcp`: tools/resources/prompts/schemas/formatters
- `src/lib`: logger, audit logger, redaction, errors, result helpers

See `docs/architecture.md` for details.

## Tools by phase
### Phase 1
`list_services`, `get_service_details`, `list_projects`, `list_environments`, `get_latest_deploy`, `list_deploys`, `get_deploy_status`, `get_recent_logs`, `get_log_snapshot`, `list_env_var_metadata`, `get_service_runtime_summary`, `get_service_health_context`, `get_incident_context`

### Phase 2
`trigger_deploy`, `restart_service`, `run_task`, `update_env_var`, `bulk_update_env_vars`, `scale_service`, `set_service_suspend_state`, `clear_build_cache_if_supported`

### Phase 3
`analyze_failed_deploy`, `prepare_staging_deploy_review`, `compare_staging_vs_prod_config`, `suggest_rollback_strategy`, `preview_environment_summary`, `audit_env_var_configuration`, `operational_readiness_check`, `deployment_risk_assessment`

Full catalog: `docs/tools.md`

## Resources
- `render://projects`
- `render://projects/{projectId}`
- `render://services`
- `render://services/{serviceId}`
- `render://services/{serviceId}/deploys`
- `render://services/{serviceId}/logs/recent`
- `render://services/{serviceId}/runtime-summary`
- `render://services/{serviceId}/env-schema`
- `render://environments`
- `render://runbooks/deploy-checklist`
- `render://runbooks/incident-triage`
- `render://runbooks/env-audit`

## Prompts
`debug_failed_deploy`, `prepare_staging_deploy_review`, `analyze_logs_for_startup_crash`, `audit_env_var_configuration`, `review_service_operational_health`, `assess_deployment_risk`, `compare_environment_configurations`

## Safety model
- Default `ALLOW_SECRET_VALUE_READ=false`
- Environment variable tools return metadata only
- Mutating tools marked `[MUTATING]`; risky actions marked `[DESTRUCTIVE]`
- `READ_ONLY_MODE` blocks all writes
- `REQUIRE_APPROVAL_FOR_DESTRUCTIVE` enforces approval token check
- Production writes gated by `PROD_ENV_NAMES` + `PROD_SERVICE_ALLOWLIST`
- All write actions generate redacted audit entries

See `docs/safety.md`.

## Required environment variables
Copy `.env.example` to `.env` and set:
- `RENDER_API_KEY`
- `RENDER_API_BASE_URL` (default `https://api.render.com/v1`)
- safety flags and retry/log settings as needed

## Install
```bash
npm install
cp .env.example .env
```

## Run locally
```bash
npm run dev
```

## Build and start
```bash
npm run build
npm run start
```

## Test and quality checks
```bash
npm run test
npm run lint
npm run typecheck
```

## Extend with a new tool
1. Add schema and handler in `src/mcp/tools/phase*/index.ts`.
2. Mark `mutating` / `destructive` when applicable.
3. Use `ctx.policyEngine.check` inputs via registration pipeline.
4. Return `successResult` with summary/details/warnings/next steps.
5. Add tests under `src/tests`.

## Example usage
- Use `list_services` to enumerate IDs
- Use `get_service_runtime_summary` for quick health context
- Use `trigger_deploy` with `dryRun=true` first
- Use `deployment_risk_assessment` before production release

## Limitations and assumptions
- Some Render endpoints are provider-plan dependent (`metrics summary`, task run route, clear build cache route)
- Template resources with URI parameters are exposed as MCP resource templates; concrete fetch is performed through tools
- Endpoint mapping is centralized so uncertain routes can be swapped without touching tool logic

## Developer docs
- `docs/architecture.md`
- `docs/tools.md`
- `docs/resources.md`
- `docs/prompts.md`
- `docs/safety.md`
- `docs/development.md`
- `docs/future-roadmap.md`
