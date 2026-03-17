# Tools

## Response contract
All tools return:
- `ok`
- `summary`
- `details`
- `warnings`
- `next_steps`

## Phase 1 (read-only)
- `list_services`
- `get_service_details`
- `list_projects`
- `list_environments`
- `get_latest_deploy`
- `list_deploys`
- `get_deploy_status`
- `get_recent_logs`
- `get_log_snapshot`
- `list_env_var_metadata`
- `get_service_runtime_summary`
- `get_service_health_context`
- `get_incident_context`

## Phase 2 (safe writes)
- `trigger_deploy`
- `restart_service`
- `run_task`
- `update_env_var`
- `bulk_update_env_vars`
- `scale_service`
- `set_service_suspend_state`
- `clear_build_cache_if_supported`

All write tools support `dryRun`. Destructive tools require approval token when enabled.

## Phase 3 (ops workflows)
- `analyze_failed_deploy`
- `prepare_staging_deploy_review`
- `compare_staging_vs_prod_config`
- `suggest_rollback_strategy`
- `preview_environment_summary`
- `audit_env_var_configuration`
- `operational_readiness_check`
- `deployment_risk_assessment`
