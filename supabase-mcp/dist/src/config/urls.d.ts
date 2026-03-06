export interface DerivedSupabaseUrls {
    supabaseUrl: string;
    restUrl: string;
    authUrl: string;
    storageUrl: string;
    functionsUrl: string;
    managementApiUrl: string;
}
export declare function deriveSupabaseUrls(projectRef: string, overrides?: Partial<DerivedSupabaseUrls>): DerivedSupabaseUrls;
