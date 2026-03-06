import dotenv from "dotenv";
import { getEnv, requiredSecretPresence } from "../src/config/env.js";
import { redactKey } from "../src/utils/redact.js";
dotenv.config({ path: ".env.generated", override: false });
dotenv.config();
function main() {
    const env = getEnv({ allowPartial: true });
    const presence = requiredSecretPresence(env);
    const output = {
        project_ref: env.supabaseProjectRef,
        project_url: env.supabaseUrl,
        rest_url: env.supabaseRestUrl,
        auth_url: env.supabaseAuthUrl,
        storage_url: env.supabaseStorageUrl,
        functions_url: env.supabaseFunctionsUrl,
        management_api_url: env.supabaseManagementApiUrl,
        detected_access_tier: env.mcpAccessLevel,
        required_secrets_present: presence,
        redacted_keys: {
            anon_key: redactKey(env.supabaseAnonKey),
            service_role_key: redactKey(env.supabaseServiceRoleKey),
            access_token: redactKey(env.supabaseAccessToken),
        },
        warnings: env.supabaseProjectRef === "[MISSING]" ? ["SUPABASE_PROJECT_REF is missing"] : [],
    };
    process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}
main();
