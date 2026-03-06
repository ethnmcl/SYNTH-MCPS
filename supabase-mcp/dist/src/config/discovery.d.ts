import { deriveSupabaseUrls } from "./urls.js";
export interface DiscoveryInput {
    accessToken?: string;
    projectRef?: string;
}
export interface ProjectMetadata {
    id: string;
    name: string;
    region?: string;
    organization_id?: string;
}
export interface DiscoveryResult {
    projectRef: string;
    urls: ReturnType<typeof deriveSupabaseUrls>;
    projectMetadata?: ProjectMetadata;
    checks: {
        projectUrl: {
            reachable: boolean;
            status?: number;
            error?: string;
        };
        restUrl: {
            reachable: boolean;
            status?: number;
            error?: string;
        };
        authUrlFormatOk: boolean;
        storageUrlFormatOk: boolean;
        functionsUrlFormatOk: boolean;
    };
}
export declare function discoverSupabaseConfig(input: DiscoveryInput): Promise<DiscoveryResult>;
export declare function toGeneratedEnv(discovery: DiscoveryResult): string;
