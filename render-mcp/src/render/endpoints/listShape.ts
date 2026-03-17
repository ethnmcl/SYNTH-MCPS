export function extractList(
  payload: unknown,
  preferredKeys: string[]
): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is Record<string, unknown> => {
      return Boolean(item) && typeof item === "object" && !Array.isArray(item);
    });
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const asRecord = payload as Record<string, unknown>;

  for (const key of preferredKeys) {
    const value = asRecord[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is Record<string, unknown> => {
        return Boolean(item) && typeof item === "object" && !Array.isArray(item);
      });
    }
  }

  for (const key of ["data", "items", "results"]) {
    const value = asRecord[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is Record<string, unknown> => {
        return Boolean(item) && typeof item === "object" && !Array.isArray(item);
      });
    }
  }

  return [];
}

export function isLimitTooLargeError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as {
    code?: unknown;
    details?: { status?: unknown };
    message?: unknown;
  };

  const hasBadRequestStatus = maybeError.details?.status === 400;
  const message =
    typeof maybeError.message === "string" ? maybeError.message.toLowerCase() : "";

  return hasBadRequestStatus && message.includes("invalid limit");
}
