import { PolicyError } from "../lib/errors.js";
import type { AppConfig } from "../config/appConfig.js";

export function assertApprovalIfRequired(
  config: AppConfig,
  destructive: boolean,
  approvalToken?: string
): void {
  if (!destructive || !config.safety.requireApprovalForDestructive) {
    return;
  }

  if (!approvalToken || approvalToken !== config.safety.approvalToken) {
    throw new PolicyError("Destructive action requires valid approval token", {
      meta: {
        approvalRequired: true
      }
    });
  }
}
