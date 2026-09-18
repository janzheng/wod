import { assert, assertEquals, assertThrows } from "@std/assert";
import {
  builderAccessResponse,
  builderLoginResponse,
  builderReturnTo,
  isSameOriginAgentRequest,
} from "../http-boundary.ts";
import "../../../static/chat.js";

Deno.test("Builder access: accepts exact browser origin and native requests, rejects foreign or cross-site writes", () => {
  const request = (headers: HeadersInit = {}) =>
    new Request("http://wod.example/api/ai/chat", { method: "POST", headers });
  assert(isSameOriginAgentRequest(request()));
  assert(isSameOriginAgentRequest(request({ origin: "http://wod.example" })));
  assert(
    isSameOriginAgentRequest(
      request({ origin: "https://wod.example", "x-forwarded-proto": "https" }),
    ),
  );
  for (
    const headers of [
      { origin: "https://evil.example" },
      { origin: "http://wod.example", "sec-fetch-site": "cross-site" },
      { "sec-fetch-site": "cross-site" },
      { origin: "null" },
      { origin: "https://wod.example/", "x-forwarded-proto": "https" },
      {
        origin: "https://evil.example",
        "x-forwarded-host": "evil.example",
        "x-forwarded-proto": "https",
      },
      { origin: "https://wod.example", "x-forwarded-proto": "https,http" },
    ] as HeadersInit[]
  ) {
    assertEquals(
      isSameOriginAgentRequest(request(headers)),
      false,
      JSON.stringify(headers),
    );
  }
});

Deno.test("Builder access: private readiness and login are no-store and cannot redirect off-site or loop", async () => {
  const ready = builderAccessResponse();
  assertEquals(ready.status, 200);
  assertEquals(await ready.json(), { ok: true, surface: "wod-builder" });
  assertEquals(ready.headers.get("cache-control"), "no-store");
  assertEquals(ready.headers.get("access-control-allow-origin"), null);
  const target = "/notes/week-29?view=notes#warmup";
  assertEquals(builderReturnTo(target), target);
  const response = builderLoginResponse(
    new Request(
      "https://wod.example/_smolbox/login?returnTo=" +
        encodeURIComponent(target),
    ),
  );
  assertEquals(response.status, 303);
  assertEquals(response.headers.get("location"), target);
  assertEquals(response.headers.get("cache-control"), "no-store");
  for (
    const path of [
      "https://evil.example",
      "//evil.example",
      "/%2fevil.example",
      "/%252fevil.example",
      "/%5cevil.example",
      "/../evil",
      "/%0aevil",
      "/_smolbox/login",
      "/cdn-cgi/access/login",
    ]
  ) {
    assertThrows(() => builderReturnTo(path), TypeError);
    const bad = builderLoginResponse(
      new Request(
        "https://wod.example/_smolbox/login?returnTo=" +
          encodeURIComponent(path),
      ),
    );
    assertEquals(bad.status, 400);
  }
});

type Panel = Record<string, any>;
async function browserFixture(
  run: (
    panel: Panel,
    stored: Map<string, string>,
    navigated: string[],
  ) => Promise<void>,
) {
  const names = ["localStorage", "location"];
  const descriptors = names.map((name) =>
    Object.getOwnPropertyDescriptor(globalThis, name)
  );
  const originalFetch = globalThis.fetch;
  const stored = new Map<string, string>();
  const navigated: string[] = [];
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => stored.set(key, value),
      removeItem: (key: string) => stored.delete(key),
    },
  });
  Object.defineProperty(globalThis, "location", {
    configurable: true,
    value: {
      pathname: "/notes/week-29",
      search: "?view=notes",
      hash: "#warmup",
      assign: (target: string) => navigated.push(target),
    },
  });
  try {
    const panel = (globalThis as unknown as { wodChatPanel: () => Panel })
      .wodChatPanel();
    panel.$nextTick = (callback: () => void) => callback();
    panel.scrollChatToBottom = () => {};
    panel.focusChatInput = () => {};
    panel.getAgentPageContext = () => ({
      kind: "app",
      title: "WOD",
      route: "/",
      sourcePath: "main.ts",
    });
    await run(panel, stored, navigated);
  } finally {
    globalThis.fetch = originalFetch;
    names.forEach((name, index) => {
      const descriptor = descriptors[index];
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete (globalThis as Record<string, unknown>)[name];
    });
  }
}

Deno.test("Builder login: explicit challenge saves draft and returns to the current page without posting", () =>
  browserFixture(async (panel, stored, navigated) => {
    let calls = 0;
    globalThis.fetch = (_input, init) => {
      calls += 1;
      assertEquals(init?.redirect, "manual");
      assertEquals(init?.credentials, "same-origin");
      return Promise.resolve(
        new Response(null, {
          status: 302,
          headers: { location: "https://team.cloudflareaccess.com" },
        }),
      );
    };
    panel.chatInput = "keep this draft";
    assertEquals(await panel.checkChatAccess(), false);
    assertEquals(calls, 1);
    assertEquals(stored.get("wod-chat-draft"), "keep this draft");
    assertEquals(navigated, [
      "/_smolbox/login?returnTo=" +
      encodeURIComponent("/notes/week-29?view=notes#warmup"),
    ]);
    assertEquals(panel.chatSignInRequired, true);
    assertEquals(panel.chatMessages.length, 0);
  }));

Deno.test("Builder login: local readiness succeeds without navigation or an external identity", () =>
  browserFixture(async (panel, _stored, navigated) => {
    globalThis.fetch = () => Promise.resolve(builderAccessResponse());
    assertEquals(await panel.checkChatAccess(), true);
    assertEquals(panel.chatSignInRequired, false);
    assertEquals(navigated, []);
  }));

Deno.test("Builder login: optional probe supports an older backend but subsequent writes still require sign-in", async () => {
  for (const html of [false, true]) {
    await browserFixture(async (panel, stored, navigated) => {
      const calls: string[] = [];
      globalThis.fetch = (_input, init) => {
        calls.push(init?.method || "GET");
        if (init?.method === "POST") {
          return Promise.resolve(new Response(null, { status: 403 }));
        }
        return Promise.resolve(
          html
            ? new Response(
              '<!DOCTYPE html><div id="app" x-data="routineStackApp()"></div>',
              {
                headers: { "content-type": "text/html; charset=UTF-8" },
              },
            )
            : new Response("Not found", { status: 404 }),
        );
      };
      assertEquals(await panel.checkChatAccess(), true);
      assertEquals(panel.chatAccessMessage, "");
      assertEquals(panel.chatSignInRequired, false);
      assertEquals(navigated, []);
      panel.chatInput = "keep the unsent turn";
      await panel.sendChatMessage();
      assertEquals(panel.chatSignInRequired, true);
      assertEquals(stored.get("wod-chat-draft"), "keep the unsent turn");
      assertEquals(panel.chatMessages, []);
      await panel.sendChatMessage();
      assertEquals(calls, ["GET", "POST"]);
    });
  }
});

Deno.test("Builder login: arbitrary HTML and backend failures are not legacy readiness", async () => {
  for (const status of [200, 503]) {
    await browserFixture(async (panel, _stored, navigated) => {
      globalThis.fetch = () =>
        Promise.resolve(
          new Response("<html>Sign in</html>", {
            status,
            headers: { "content-type": "text/html" },
          }),
        );
      assertEquals(await panel.checkChatAccess(), false);
      assertEquals(
        panel.chatAccessMessage,
        "Builder is unavailable. Try again.",
      );
      assertEquals(navigated, []);
    });
  }
});

Deno.test("Builder login: manual browser redirects are explicit challenges, not retryable poll failures", () =>
  browserFixture(async (panel) => {
    assertThrows(
      () => panel.requireChatSignIn({ type: "opaqueredirect", status: 0 }),
      Error,
      "Sign in",
    );
    assertEquals(panel.chatSignInRequired, true);
    panel.chatSignInRequired = false;
    panel.requireChatSignIn({ type: "basic", status: 503 });
    assertEquals(panel.chatSignInRequired, false);
  }));

Deno.test("Builder login: rejected POST restores draft, does not duplicate transcript and never replays", () =>
  browserFixture(async (panel, stored, navigated) => {
    const calls: string[] = [];
    globalThis.fetch = (_input, init) => {
      calls.push(init?.method || "GET");
      assertEquals(init?.redirect, "manual");
      return Promise.resolve(new Response(null, { status: 403 }));
    };
    panel.chatInput = "make the change";
    await panel.sendChatMessage();
    assertEquals(panel.chatInput, "make the change");
    assertEquals(stored.get("wod-chat-draft"), "make the change");
    assertEquals(panel.chatMessages, []);
    assertEquals(panel.chatSignInRequired, true);
    await panel.sendChatMessage();
    assertEquals(calls, ["POST"]);
    assertEquals(navigated, []);
  }));

Deno.test("Builder login: expired polling keeps accepted job/session and resumes only GET after login", () =>
  browserFixture(async (panel, stored) => {
    const calls: string[] = [];
    globalThis.fetch = (_input, init) => {
      calls.push(init?.method || "GET");
      return Promise.resolve(
        init?.method === "POST"
          ? Response.json({
            jobId: "accepted",
            sessionId: "session",
            status: "pending",
          }, { status: 202 })
          : new Response(null, { status: 302 }),
      );
    };
    panel.chatInput = "accepted turn";
    await panel.sendChatMessage();
    assertEquals(calls, ["POST", "GET"]);
    assertEquals(panel.chatJobId, "accepted");
    assertEquals(stored.get("wod-chat-job-id"), "accepted");
    assertEquals(panel.chatSessionId, "session");
    assertEquals(panel.chatMessages.length, 1);
    assertEquals(panel.chatInput, "");
    assertEquals(panel.chatLoading, false);
    globalThis.fetch = (_input, init) => {
      calls.push(init?.method || "GET");
      return Promise.resolve(
        Response.json({
          status: "completed",
          result: { message: "done", sessionId: "session" },
        }),
      );
    };
    panel.chatSignInRequired = false;
    panel.resumeChatJob();
    for (let n = 0; n < 20 && panel.chatLoading; n += 1) {
      await Promise.resolve();
    }
    assertEquals(calls, ["POST", "GET", "GET"]);
    assertEquals(panel.chatJobId, null);
    assertEquals(panel.chatMessages.at(-1).content, "done");
  }));

Deno.test("Builder login: failed DELETE preserves conversation and pending job; successful clear removes them", () =>
  browserFixture(async (panel, stored) => {
    panel.chatSessionId = "session";
    panel.chatJobId = "pending";
    panel.chatMessages = [{ role: "user", content: "keep me" }];
    stored.set("wod-chat-session-id", "session");
    stored.set("wod-chat-job-id", "pending");
    globalThis.fetch = () =>
      Promise.resolve(new Response(null, { status: 403 }));
    await panel.clearChat();
    assertEquals(panel.chatSessionId, "session");
    assertEquals(panel.chatJobId, "pending");
    assertEquals(panel.chatMessages.length, 1);
    assertEquals(stored.get("wod-chat-job-id"), "pending");
    globalThis.fetch = () =>
      Promise.resolve(new Response(null, { status: 204 }));
    await panel.clearChat();
    assertEquals(panel.chatSessionId, null);
    assertEquals(panel.chatJobId, null);
    assertEquals(panel.chatMessages, []);
  }));

Deno.test("Builder access: HTTP routes use the boundary and service worker skips login/status caching", async () => {
  const main = await Deno.readTextFile(
    new URL("../../../main.ts", import.meta.url),
  );
  assert(
    main.includes('app.get("/_smolbox/access", () => builderAccessResponse())'),
  );
  assert(
    main.includes(
      'app.get("/_smolbox/login", (c) => builderLoginResponse(c.req.raw))',
    ),
  );
  assert(
    main.indexOf('app.use("/api/ai/*"') <
      main.indexOf('app.post("/api/ai/chat"'),
  );
  assert(main.includes("!isSameOriginAgentRequest(c.req.raw)"));
  assert(!main.includes('"Access-Control-Allow-Origin": "*"'));
  assert(main.includes("requestUrl.pathname.startsWith('/_smolbox/')"));
  assert(main.includes("requestUrl.pathname.startsWith('/cdn-cgi/access/')"));
});
