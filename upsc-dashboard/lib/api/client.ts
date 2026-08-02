const rawUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const DEFAULT_BACKEND_BASE_URL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;

export function getBackendBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BACKEND_BASE_URL).replace(
    /\/+$/,
    "",
  );
}

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBackendBaseUrl()}${normalizedPath}`;
}

export async function parseJsonSafely<T>(
  response: Response,
): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function toApiErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  const payload = await parseJsonSafely<{ error?: string; message?: string }>(
    response,
  );
  if (payload?.error) return payload.error;
  if (payload?.message) return payload.message;
  return fallbackMessage;
}
