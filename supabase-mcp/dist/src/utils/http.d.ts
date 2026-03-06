export interface HttpRequestOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    headers?: Record<string, string>;
    body?: unknown;
    timeoutMs?: number;
}
export declare function fetchJson<T>(url: string, options?: HttpRequestOptions): Promise<T>;
export declare function fetchReachable(url: string): Promise<{
    reachable: boolean;
    status?: number;
    error?: string;
}>;
