import type { AppConfig } from "../config/appConfig.js";
import { assertApprovalIfRequired } from "./approvals.js";
import { assertProdWriteAllowed, assertWriteAllowed } from "./guards.js";

export interface PolicyCheckInput {
  toolName: string;
  mutating: boolean;
  destructive: boolean;
  environmentName?: string;
  serviceNameOrId?: string;
  approvalToken?: string;
}

export class PolicyEngine {
  public constructor(private readonly config: AppConfig) {}

  public check(input: PolicyCheckInput): void {
    if (!input.mutating) {
      return;
    }

    assertWriteAllowed(this.config);
    assertProdWriteAllowed(this.config, input.environmentName, input.serviceNameOrId);
    assertApprovalIfRequired(this.config, input.destructive, input.approvalToken);
  }
}
