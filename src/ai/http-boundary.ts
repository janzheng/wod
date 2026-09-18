export const MAX_AGENT_REQUEST_BYTES = 32 * 1024;

// Browser mutations are same-origin. Cloudflared retains Host and provides the
// external scheme; native clients without browser headers remain supported.
export function isSameOriginAgentRequest(request: Request): boolean {
  if (request.headers.get("sec-fetch-site")?.toLowerCase() === "cross-site") {
    return false;
  }
  const origin = request.headers.get("origin");
  if (origin === null) return true;
  const target = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto !== null) {
    if (!["http", "https"].includes(forwardedProto)) return false;
    target.protocol = `${forwardedProto}:`;
  }
  return origin === target.origin;
}

export function builderReturnTo(value: string): string {
  if (
    !value.startsWith("/") || value.startsWith("//") || value.length > 8192 ||
    /[\\\u0000-\u0020\u007f]/.test(value)
  ) throw new TypeError("invalid return path");
  const rawPath = value.split(/[?#]/, 1)[0];
  let decoded: string;
  try {
    decoded = decodeURIComponent(rawPath);
  } catch {
    throw new TypeError("invalid return path");
  }
  if (
    /[\\%?#\u0000-\u0020\u007f]/.test(decoded) || decoded.includes("//") ||
    decoded.split("/").some((part) => part === "." || part === "..") ||
    decoded === "/_smolbox" || decoded.startsWith("/_smolbox/") ||
    decoded === "/cdn-cgi/access" || decoded.startsWith("/cdn-cgi/access/")
  ) {
    throw new TypeError("invalid return path");
  }
  return value;
}

export function builderAccessResponse(): Response {
  // This is not application authentication. Access challenges at the host edge;
  // private local connections deliberately reach the ordinary computer directly.
  return Response.json({ ok: true, surface: "wod-builder" }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export function builderLoginResponse(request: Request): Response {
  try {
    const target = builderReturnTo(
      new URL(request.url).searchParams.get("returnTo") ?? "/",
    );
    return new Response(null, {
      status: 303,
      headers: { "Location": target, "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json({ error: "Invalid return path." }, {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }
}

export class RequestBodyTooLargeError extends Error {
  constructor() {
    super(`request body exceeds ${MAX_AGENT_REQUEST_BYTES} bytes`);
    this.name = "RequestBodyTooLargeError";
  }
}

export async function readAgentJson(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length"));
  if (
    Number.isFinite(contentLength) && contentLength > MAX_AGENT_REQUEST_BYTES
  ) {
    throw new RequestBodyTooLargeError();
  }
  if (!request.body) return null;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_AGENT_REQUEST_BYTES) {
        await reader.cancel();
        throw new RequestBodyTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(body));
}
