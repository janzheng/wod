import { assert, assertEquals } from "@std/assert";
import "../../../static/chat.js";

type ChatPanel = {
  chatInput: string;
  chatLoading: boolean;
  chatMessages: Array<{ role: string; content: string }>;
  chatSessionId: string | null;
  chatJobId: string | null;
  $nextTick: (callback: () => void) => void;
  getAgentPageContext: () => Record<string, string>;
  scrollChatToBottom: () => void;
  focusChatInput: () => void;
  sendChatMessage: () => Promise<void>;
  clearChat: () => void;
};

const createPanel = (
  globalThis as unknown as { wodChatPanel: () => ChatPanel }
).wodChatPanel;

Deno.test("chat lifecycle: persists the user turn and aborts it on clear", async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  const stored = new Map<string, string>();
  const calls: Array<{ url: string; init?: RequestInit }> = [];

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => stored.set(key, value),
      removeItem: (key: string) => stored.delete(key),
    },
  });
  globalThis.fetch = (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    if (init?.method === "DELETE") {
      return Promise.resolve(new Response(null, { status: 204 }));
    }
    if (init?.method === "POST") {
      return Promise.resolve(Response.json({
        jobId: "job-clear",
        status: "pending",
        sessionId: "browser-session",
      }, { status: 202 }));
    }
    return new Promise((_resolve, reject) => {
      init?.signal?.addEventListener(
        "abort",
        () => reject(new DOMException("aborted", "AbortError")),
        { once: true },
      );
    });
  };

  try {
    const panel = createPanel();
    panel.$nextTick = (callback) => callback();
    panel.getAgentPageContext = () => ({
      kind: "app",
      title: "WOD",
      route: "/",
      sourcePath: "main.ts",
    });
    panel.scrollChatToBottom = () => {};
    panel.focusChatInput = () => {};
    panel.chatSessionId = "browser-session";
    panel.chatInput = "change this page";

    const turn = panel.sendChatMessage();
    for (let index = 0; index < 5; index += 1) await Promise.resolve();
    assert(stored.get("wod-chat-messages")?.includes("change this page"));

    panel.clearChat();
    await turn;

    assertEquals(panel.chatMessages, []);
    assertEquals(panel.chatSessionId, null);
    assertEquals(panel.chatJobId, null);
    assertEquals(panel.chatLoading, false);
    assertEquals(calls.length, 3);
    assertEquals(calls[2].init?.method, "DELETE");
    assertEquals(
      JSON.parse(String(calls[2].init?.body)),
      { sessionId: "browser-session" },
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalStorage);
    } else {
      delete (globalThis as Record<string, unknown>).localStorage;
    }
  }
});

Deno.test("chat lifecycle: polls an async Pi job to completion", async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  const stored = new Map<string, string>();
  const calls: string[] = [];

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => stored.set(key, value),
      removeItem: (key: string) => stored.delete(key),
    },
  });
  globalThis.fetch = (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push(url);
    if (init?.method === "POST") {
      return Promise.resolve(Response.json({
        jobId: "job-complete",
        status: "pending",
        sessionId: "browser-session",
      }, { status: 202 }));
    }
    return Promise.resolve(Response.json({
      id: "job-complete",
      status: "completed",
      sessionId: "browser-session",
      result: {
        message: "W28 complete",
        sessionId: "browser-session",
        workout: null,
      },
    }));
  };

  try {
    const panel = createPanel();
    panel.$nextTick = (callback) => callback();
    panel.getAgentPageContext = () => ({
      kind: "program",
      title: "Week 28",
      route: "/program/functional-bulk-dynamic",
      sourcePath: "programs/functional-bulk-dynamic.json",
    });
    panel.scrollChatToBottom = () => {};
    panel.focusChatInput = () => {};
    panel.chatSessionId = "browser-session";
    panel.chatInput = "build W28";

    await panel.sendChatMessage();

    assertEquals(calls.length, 2);
    assert(calls[1].includes("/api/ai/jobs/job-complete"));
    assertEquals(panel.chatLoading, false);
    assertEquals(panel.chatJobId, null);
    assertEquals(panel.chatMessages.at(-1)?.content, "W28 complete");
    assertEquals(stored.has("wod-chat-job-id"), false);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalStorage);
    } else {
      delete (globalThis as Record<string, unknown>).localStorage;
    }
  }
});
