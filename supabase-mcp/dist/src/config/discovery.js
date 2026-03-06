import { deriveSupabaseUrls } from "./urls.js";
import { fetchJson, fetchReachable } from "../utils/http.js";
export async function discoverSupabaseConfig(input) {
    if (!input.projectRef) {
        throw new Error("SUPABASE_PROJECT_REF is required for discovery");
    }
    const urls = deriveSupabaseUrls(input.projectRef);
    let projectMetadata;
    if (input.accessToken) {
        try {
            const project = await fetchJson(`${urls.managementApiUrl}/projects/${input.projectRef}`, {
                headers: {
                    Authorization: `Bearer ${input.accessToken}`,
                },
            });
            projectMetadata = project;
        }
        catch {
            // Optional metadata fetch: keep discovery functional even when denied.
        }
    }
    const [projectUrl, restUrl] = await Promise.all([
        fetchReachable(urls.supabaseUrl),
        fetchReachable(urls.restUrl),
    ]);
    return {
        projectRef: input.projectRef,
        urls,
        projectMetadata,
        checks: {
            projectUrl,
            restUrl,
            authUrlFormatOk: urls.authUrl.endsWith("/auth/v1"),
            storageUrlFormatOk: urls.storageUrl.endsWith("/storage/v1"),
            functionsUrlFormatOk: urls.functionsUrl.endsWith("/functions/v1"),
        },
    };
}
export function toGeneratedEnv(discovery) {
    const lines = [
        `SUPABASE_PROJECT_REF=${discovery.projectRef}`,
        `SUPABASE_URL=${discovery.urls.supabaseUrl}`,
        `SUPABASE_REST_URL=${discovery.urls.restUrl}`,
        `SUPABASE_AUTH_URL=${discovery.urls.authUrl}`,
        `SUPABASE_STORAGE_URL=${discovery.urls.storageUrl}`,
        `SUPABASE_FUNCTIONS_URL=${discovery.urls.functionsUrl}`,
        `SUPABASE_MANAGEMENT_API_URL=${discovery.urls.managementApiUrl}`,
    ];
    return `${lines.join("\n")}\n`;
}
