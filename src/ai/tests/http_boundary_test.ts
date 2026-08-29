import { assertEquals, assertRejects } from "@std/assert";
import {
  MAX_AGENT_REQUEST_BYTES,
  readAgentJson,
  RequestBodyTooLargeError,
} from "../http-boundary.ts";

Deno.test("agent HTTP boundary: parses a bounded JSON request", async () => {
  const request = new Request("http://wod.test/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({ prompt: "hello" }),
  });
  assertEquals(await readAgentJson(request), { prompt: "hello" });
});

Deno.test("agent HTTP boundary: rejects a declared oversized request", async () => {
  const request = new Request("http://wod.test/api/ai/chat", {
    method: "POST",
    headers: { "content-length": String(MAX_AGENT_REQUEST_BYTES + 1) },
    body: "{}",
  });
  await assertRejects(
    () => readAgentJson(request),
    RequestBodyTooLargeError,
  );
});

Deno.test("agent HTTP boundary: stops reading an oversized streamed body", async () => {
  const request = new Request("http://wod.test/api/ai/chat", {
    method: "POST",
    body: "x".repeat(MAX_AGENT_REQUEST_BYTES + 1),
  });
  await assertRejects(
    () => readAgentJson(request),
    RequestBodyTooLargeError,
  );
});
