const rawUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const cleanUrl = rawUrl.replace(/\/+$/, "");
const baseHref = cleanUrl.replace(/\/api$/, "");
const DEFAULT_BACKEND_BASE_URL = `${baseHref}/api`;

export function getBackendBaseUrl(): string {
  return DEFAULT_BACKEND_BASE_URL;
}

export function buildApiUrl(path: string): string {
  const baseApi = getBackendBaseUrl();
  // 🛡️ PRO FIX: Automatically removes extra 'api/' to strictly prevent /api/api/ bugs
  let cleanPath = path.replace(/^\/?api\//, "/");
  if (!cleanPath.startsWith("/")) {
    cleanPath = `/${cleanPath}`;
  }
  return `${baseApi}${cleanPath}`;
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
