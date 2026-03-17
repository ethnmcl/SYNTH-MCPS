# Architecture

## Layers
1. MCP server layer: bootstrap, registration, lifecycle.
2. Config layer: env loading + typed config.
3. Auth/policy layer: read-only, prod protections, approval guards.
4. Render adapter layer: endpoint modules and normalized models.
5. MCP domain layer: tools/resources/prompts/schemas/formatters.
6. Audit/observability layer: structured app logs and redacted audit file logs.

## Request flow
1. MCP tool receives input.
2. Zod input parsing.
3. Policy checks for mutating tools.
4. Render adapter call(s).
5. Standardized response formatting.
6. Audit entry for mutating tools.

## Error model
- `ValidationError`
- `PolicyError`
- `RenderApiError`
- `NotFoundError`
- `UnsupportedOperationError`

All normalized via `normalizeUnknownError` with retryable/status details.
