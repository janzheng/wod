export const MAX_AGENT_REQUEST_BYTES = 32 * 1024;

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
