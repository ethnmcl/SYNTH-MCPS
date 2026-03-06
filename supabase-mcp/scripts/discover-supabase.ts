import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { discoverSupabaseConfig, toGeneratedEnv } from "../src/config/discovery.js";
import { redactKey } from "../src/utils/redact.js";

dotenv.config();

interface Args {
  includeExistingSecrets: boolean;
}

function parseArgs(): Args {
  return {
    includeExistingSecrets: process.argv.includes("--include-existing-secrets"),
  };
}

async function main(): Promise<void> {
  const args = parseArgs();
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  const projectRef = process.env.SUPABASE_PROJECT_REF;

  if (!accessToken) {
    throw new Error("SUPABASE_ACCESS_TOKEN is missing.");
  }
  if (!projectRef) {
    throw new Error("SUPABASE_PROJECT_REF is missing.");
  }

  const discovery = await discoverSupabaseConfig({ accessToken, projectRef });

  const summary = {
    project_ref: discovery.projectRef,
    project_name: discovery.projectMetadata?.name,
    region: discovery.projectMetadata?.region,
    project_url: discovery.urls.supabaseUrl,
    rest_url: discovery.urls.restUrl,
    auth_url: discovery.urls.authUrl,
    storage_url: discovery.urls.storageUrl,
    functions_url: discovery.urls.functionsUrl,
    management_api_url: discovery.urls.managementApiUrl,
    checks: discovery.checks,
    secrets: {
      access_token: redactKey(accessToken),
      anon_key_present: Boolean(process.env.SUPABASE_ANON_KEY),
      service_role_key_present: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
  };

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);

  const outputFile = path.resolve(process.cwd(), ".env.generated");
  let content = toGeneratedEnv(discovery);

  if (args.includeExistingSecrets) {
    const existing = {
      SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_DB_PASSWORD: process.env.SUPABASE_DB_PASSWORD,
    };

    for (const [key, value] of Object.entries(existing)) {
      if (value) content += `${key}=${value}\n`;
    }
  }

  await fs.writeFile(outputFile, content, "utf8");
  process.stdout.write(`Wrote ${outputFile}\n`);
}

main().catch((error) => {
  process.stderr.write(`discover:supabase failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
