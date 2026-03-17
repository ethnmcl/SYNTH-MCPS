# Safety

## Guardrails
- Secret values are hidden by default.
- Env var tools return metadata and hints only.
- Write tools are policy-gated.
- Destructive writes can require approval token.
- Production writes are allowlist-controlled.

## Flags
- `READ_ONLY_MODE`
- `REQUIRE_APPROVAL_FOR_DESTRUCTIVE`
- `PROD_SERVICE_ALLOWLIST`
- `PROD_ENV_NAMES`
- `ALLOW_SECRET_VALUE_READ`

## Audit
Mutating tools write redacted entries to `AUDIT_LOG_PATH`.
