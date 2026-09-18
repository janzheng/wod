import { assert, assertEquals } from "@std/assert";
import { createPiJobStore } from "../pi-jobs.ts";

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

Deno.test("pi jobs: returns immediately and exposes only terminal results", async () => {
  let finish: ((value: { message: string; sessionId: string }) => void) |
    undefined;
  const store = createPiJobStore({
    run: () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
    createId: () => "job-1",
    now: () => 123,
  });

  const created = store.create({
    prompt: "private build request",
    sessionId: "browser-session",
    pageContext: { title: "Week 28" },
  });

  assertEquals(created, {
    id: "job-1",
    status: "pending",
    sessionId: "browser-session",
    createdAt: 123,
    updatedAt: 123,
  });
  await flush();
  assertEquals(store.get("job-1")?.status, "running");
  assert(!JSON.stringify(store.get("job-1")).includes("private build request"));

  finish?.({ message: "W28 complete", sessionId: "browser-session" });
  await flush();
  assertEquals(store.get("job-1"), {
    id: "job-1",
    status: "completed",
    sessionId: "browser-session",
    createdAt: 123,
    updatedAt: 123,
    result: { message: "W28 complete", sessionId: "browser-session" },
  });
});

Deno.test("pi jobs: cancelling a session aborts its active job", async () => {
  let aborted = false;
  const store = createPiJobStore({
    run: (request) =>
      new Promise((_resolve, reject) => {
        request.signal?.addEventListener("abort", () => {
          aborted = true;
          reject(new Error("cancelled"));
        }, { once: true });
      }),
    createId: () => "job-2",
    formatError: (error) => error instanceof Error ? error.message : "error",
  });

  store.create({ prompt: "work", sessionId: "browser-session" });
  await flush();
  assertEquals(store.cancelSession("browser-session"), 1);
  await flush();

  assert(aborted);
  assertEquals(store.get("job-2")?.status, "cancelled");
});
