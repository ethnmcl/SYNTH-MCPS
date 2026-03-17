import type pino from "pino";
import type { AppConfig } from "../config/appConfig.js";
import { NotFoundError, RenderApiError } from "../lib/errors.js";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

export class RenderClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly retryAttempts: number;
  private readonly retryBaseDelayMs: number;

  public constructor(
    config: AppConfig,
    private readonly logger: pino.Logger
  ) {
    this.baseUrl = config.render.baseUrl.replace(/\/$/, "");
    this.apiKey = config.render.apiKey;
    this.timeoutMs = config.render.requestTimeoutMs;
    this.retryAttempts = config.render.retryAttempts;
    this.retryBaseDelayMs = config.render.retryBaseDelayMs;
  }

  public async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("GET", path, options);
  }

  public async post<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("POST", path, options);
  }

  public async patch<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("PATCH", path, options);
  }

  private async request<T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(path, options.query);

    for (let attempt = 0; attempt <= this.retryAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const payload = (await this.safeJson(response)) as Record<string, unknown>;
          const message =
            typeof payload.message === "string"
              ? payload.message
              : `Render API error for ${method} ${path}`;
          const retryable = this.isRetryableStatus(response.status);

          if (response.status === 404) {
            throw new NotFoundError(message, { status: response.status, meta: { path } });
          }

          if (retryable && attempt < this.retryAttempts) {
            await this.sleep(this.retryBaseDelayMs * (attempt + 1));
            continue;
          }

          throw new RenderApiError(message, {
            status: response.status,
            retryable,
            meta: {
              path,
              payload
            }
          });
        }

        return ((await this.safeJson(response)) ?? {}) as T;
      } catch (error) {
        clearTimeout(timeout);

        const isLast = attempt >= this.retryAttempts;
        const isAbort = error instanceof Error && error.name === "AbortError";
        if (isAbort && !isLast) {
          await this.sleep(this.retryBaseDelayMs * (attempt + 1));
          continue;
        }

        if (error instanceof RenderApiError || error instanceof NotFoundError) {
          throw error;
        }

        const retryable = !isLast;
        this.logger.warn({ event: "render_request_failure", method, path, retryable, attempt, error });
        if (!retryable) {
          throw new RenderApiError(`Render request failed: ${method} ${path}`, {
            retryable: false,
            cause: error,
            meta: { path }
          });
        }
      }
    }

    throw new RenderApiError(`Render request failed after retries: ${method} ${path}`, {
      retryable: false,
      meta: { path }
    });
  }

  private buildUrl(path: string, query?: RequestOptions["query"]): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private async safeJson(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) {
      return {};
    }
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return { raw: text };
    }
  }

  private isRetryableStatus(status: number): boolean {
    return status === 429 || status >= 500;
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
