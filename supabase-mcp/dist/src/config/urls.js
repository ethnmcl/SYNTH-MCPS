export function deriveSupabaseUrls(projectRef, overrides) {
    const base = `https://${projectRef}.supabase.co`;
    return {
        supabaseUrl: overrides?.supabaseUrl ?? base,
        restUrl: overrides?.restUrl ?? `${base}/rest/v1`,
        authUrl: overrides?.authUrl ?? `${base}/auth/v1`,
        storageUrl: overrides?.storageUrl ?? `${base}/storage/v1`,
        functionsUrl: overrides?.functionsUrl ?? `${base}/functions/v1`,
        managementApiUrl: overrides?.managementApiUrl ?? "https://api.supabase.com/v1",
    };
}
