export async function fetchJson(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15_000);
    try {
        const response = await fetch(url, {
            method: options.method ?? "GET",
            headers: {
                "content-type": "application/json",
                ...(options.headers ?? {}),
            },
            body: options.body === undefined ? undefined : JSON.stringify(options.body),
            signal: controller.signal,
        });
        const text = await response.text();
        const parsed = text ? JSON.parse(text) : {};
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${JSON.stringify(parsed)}`);
        }
        return parsed;
    }
    finally {
        clearTimeout(timeout);
    }
}
export async function fetchReachable(url) {
    try {
        const response = await fetch(url, { method: "GET" });
        return { reachable: response.ok, status: response.status };
    }
    catch (error) {
        return { reachable: false, error: error instanceof Error ? error.message : "unknown error" };
    }
}
