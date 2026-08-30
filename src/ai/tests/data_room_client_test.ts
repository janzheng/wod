import { assert, assertEquals, assertMatch } from "@std/assert";
import "../../../static/data-room.js";

type DataRoomPanel = {
  $nextTick: (callback: () => void) => void;
  dataRoomError: string;
  dataRoomInput: string;
  dataRoomLoading: boolean;
  dataRoomManifest: Record<string, unknown> | null;
  dataRoomMessages: Array<{ role: string; content: string; error?: boolean }>;
  dataRoomSessionId: string;
  dataRoomStatus: string;
  checkDataRoom: () => Promise<void>;
  initDataRoom: () => void;
  sendDataRoomMessage: () => Promise<void>;
  scrollDataRoomToBottom: () => void;
  focusDataRoomInput: () => void;
};

const createPanel = (
  globalThis as unknown as { wodDataRoomPanel: () => DataRoomPanel }
).wodDataRoomPanel;

function installStorage(values = new Map<string, string>()) {
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
  });
  return values;
}

function readyPanel() {
  const panel = createPanel();
  panel.$nextTick = (callback) => callback();
  panel.scrollDataRoomToBottom = () => {};
  panel.focusDataRoomInput = () => {};
  return panel;
}

Deno.test("read-only Ask: loads metadata, resumes one tab session, and goes offline without retrying", async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    "sessionStorage",
  );
  const originalBase =
    (globalThis as Record<string, unknown>).WOD_DATA_ROOM_BASE_URL;
  const requests: Array<{ method: string; path: string }> = [];
  const transcripts = new Map<
    string,
    Array<{ role: string; text: string; timestamp: string }>
  >();
  let stopped = false;

  const server = Deno.serve({
    hostname: "127.0.0.1",
    port: 0,
    onListen: () => {},
  }, async (request) => {
    const url = new URL(request.url);
    requests.push({ method: request.method, path: url.pathname });
    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({ kind: "smolbox-data-room", ok: true });
    }
    if (request.method === "GET" && url.pathname === "/api/manifest") {
      return Response.json({
        manifest: {
          schemaVersion: 1,
          kind: "smolbox-readonly-data-view",
          createdAt: "2026-08-30T19:00:00.000Z",
          source: "/workspace/projects/wod-proof",
          mountedAt: "/data",
          projection: "selected-folder",
          included: { bytes: 512, directories: 2, files: 3 },
          exclusions: {
            defaults: [".env*"],
            owner: ["private"],
            omitted: [{ path: ".env" }],
          },
        },
      });
    }
    const transcript = url.pathname.match(/^\/api\/chat\/([A-Za-z0-9._-]+)$/);
    if (request.method === "GET" && transcript) {
      const session = transcript[1];
      return Response.json({
        messages: transcripts.get(session) ?? [],
        session,
      });
    }
    if (request.method === "POST" && url.pathname === "/api/chat") {
      const body = await request.json() as { message: string; session: string };
      const messages = transcripts.get(body.session) ?? [];
      messages.push({
        role: "user",
        text: body.message,
        timestamp: new Date().toISOString(),
      });
      const reply = `turn ${
        Math.floor(messages.length / 2) + 1
      }: ${body.message}`;
      messages.push({
        role: "agent",
        text: reply,
        timestamp: new Date().toISOString(),
      });
      transcripts.set(body.session, messages);
      return Response.json({ reply, session: body.session });
    }
    return Response.json({ error: "not found" }, { status: 404 });
  });

  let fetchCount = 0;
  globalThis.fetch = (input: string | URL | Request, init?: RequestInit) => {
    fetchCount += 1;
    return originalFetch(input, init);
  };

  try {
    const base = `http://127.0.0.1:${(server.addr as Deno.NetAddr).port}`;
    (globalThis as Record<string, unknown>).WOD_DATA_ROOM_BASE_URL = base;
    const firstStorage = installStorage();
    const first = readyPanel();
    first.initDataRoom();
    const firstSession = first.dataRoomSessionId;

    await first.checkDataRoom();
    assertEquals(first.dataRoomStatus, "online");
    assertEquals(first.dataRoomError, "");
    assertEquals(
      first.dataRoomManifest?.source,
      "/workspace/projects/wod-proof",
    );
    assertEquals(first.dataRoomManifest?.createdAt, "2026-08-30T19:00:00.000Z");
    assertEquals(firstStorage.get("wod-data-room-session-id"), firstSession);

    first.dataRoomInput = "What is in this snapshot?";
    await first.sendDataRoomMessage();
    first.dataRoomInput = "Continue from that answer.";
    await first.sendDataRoomMessage();
    assertEquals(first.dataRoomMessages.map(({ role }) => role), [
      "user",
      "assistant",
      "user",
      "assistant",
    ]);
    assertMatch(first.dataRoomMessages.at(-1)?.content ?? "", /turn 2/);

    const resumed = readyPanel();
    resumed.initDataRoom();
    assertEquals(resumed.dataRoomSessionId, firstSession);
    await resumed.checkDataRoom();
    assertEquals(resumed.dataRoomMessages.length, 4);

    installStorage();
    const otherBrowserSession = readyPanel();
    otherBrowserSession.initDataRoom();
    assert(otherBrowserSession.dataRoomSessionId !== firstSession);

    await server.shutdown();
    stopped = true;
    const beforeOfflineCheck = fetchCount;
    await first.checkDataRoom();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assertEquals(first.dataRoomStatus, "offline");
    assertEquals(fetchCount, beforeOfflineCheck + 1);
    assertMatch(first.dataRoomError, /offline/i);
  } finally {
    if (!stopped) await server.shutdown();
    globalThis.fetch = originalFetch;
    if (originalStorage) {
      Object.defineProperty(globalThis, "sessionStorage", originalStorage);
    } else delete (globalThis as Record<string, unknown>).sessionStorage;
    if (originalBase === undefined) {
      delete (globalThis as Record<string, unknown>).WOD_DATA_ROOM_BASE_URL;
    } else {(globalThis as Record<string, unknown>).WOD_DATA_ROOM_BASE_URL =
        originalBase;}
  }
});

Deno.test("read-only Ask: invalid or absent configuration fails without a network request", async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    "sessionStorage",
  );
  const originalBase =
    (globalThis as Record<string, unknown>).WOD_DATA_ROOM_BASE_URL;
  let fetchCount = 0;
  globalThis.fetch = () => {
    fetchCount += 1;
    return Promise.reject(new Error("must not fetch"));
  };

  try {
    installStorage();
    (globalThis as Record<string, unknown>).WOD_DATA_ROOM_BASE_URL =
      "https://data.example.test/path";
    const panel = readyPanel();
    panel.initDataRoom();
    await panel.checkDataRoom();
    assertEquals(panel.dataRoomStatus, "offline");
    assertMatch(panel.dataRoomError, /exact http\(s\) origin/i);
    assertEquals(fetchCount, 0);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalStorage) {
      Object.defineProperty(globalThis, "sessionStorage", originalStorage);
    } else delete (globalThis as Record<string, unknown>).sessionStorage;
    if (originalBase === undefined) {
      delete (globalThis as Record<string, unknown>).WOD_DATA_ROOM_BASE_URL;
    } else {(globalThis as Record<string, unknown>).WOD_DATA_ROOM_BASE_URL =
        originalBase;}
  }
});
