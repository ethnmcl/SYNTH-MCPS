import { PolicyError } from "../lib/errors.js";
import type { AppConfig } from "../config/appConfig.js";

export function assertWriteAllowed(config: AppConfig): void {
  if (config.safety.readOnlyMode) {
    throw new PolicyError("Write operation blocked: READ_ONLY_MODE is enabled", {
      meta: {
        readOnlyMode: true
      }
    });
  }
}

export function assertProdWriteAllowed(
  config: AppConfig,
  environmentName?: string,
  serviceNameOrId?: string
): void {
  if (!environmentName) {
    return;
  }

  const normalized = environmentName.toLowerCase();
  const isProd = config.safety.prodEnvNames.includes(normalized);
  if (!isProd) {
    return;
  }

  if (!serviceNameOrId || config.safety.prodServiceAllowlist.includes(serviceNameOrId)) {
    return;
  }

  throw new PolicyError("Write operation blocked for production target not in PROD_SERVICE_ALLOWLIST", {
    meta: {
      environmentName,
      serviceNameOrId
    }
  });
}
