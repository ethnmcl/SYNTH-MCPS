# Incident Triage

1. Gather `get_incident_context` for impacted service.
2. Inspect latest failed deploy with `analyze_failed_deploy`.
3. Pull targeted `get_log_snapshot` around error window.
4. Evaluate rollback strategy and expected blast radius.
5. Log findings and choose mitigation action.
