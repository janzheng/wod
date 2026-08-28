import { assert, assertEquals, assertRejects } from "@std/assert";
import {
  createPiAgent,
  formatPiPrompt,
  normalizePiPageContext,
  PI_MODEL,
  PI_PROVIDER,
  PI_TOOLS,
  PiAgentBusyError,
  PiAgentProcessError,
  piCommandResult,
  type PiCommandSpec,
} from "../pi-agent.ts";

Deno.test("pi agent: normalizes a small project-relative page context", () => {
  assertEquals(
    normalizePiPageContext({
      kind: "notes",
      title: "Baby Interim — Playbook",
      route: "/notes/baby-interim",
      sourcePath: "static/notes-baby-interim.md",
      renderedContents: "must not cross the boundary",
    }),
    {
      kind: "notes",
      title: "Baby Interim — Playbook",
      route: "/notes/baby-interim",
      sourcePath: "static/notes-baby-interim.md",
    },
  );

  assertEquals(
    normalizePiPageContext({
      kind: "notes",
      title: "unsafe",
      route: "/notes/unsafe",
      sourcePath: "../.env",
    }),
    undefined,
  );
});

Deno.test("pi agent: tells the agent to inspect the current page source", () => {
  const prompt = formatPiPrompt("Can you see this page?", {
    kind: "notes",
    title: "Baby Interim — Playbook",
    route: "/notes/baby-interim",
    sourcePath: "static/notes-baby-interim.md",
  });

  assert(prompt.includes('When the user says "this page"'));
  assert(prompt.includes("/workspace/static/notes-baby-interim.md"));
  assert(prompt.includes("use a project tool to inspect that source file"));
  assert(prompt.endsWith("Can you see this page?"));
});

Deno.test("pi agent: fixes provider, model, tools, workdir, and session path", async () => {
  const calls: PiCommandSpec[] = [];
  const agent = createPiAgent({
    sessionRoot: "/test/sessions",
    prepareSessionRoot: () => Promise.resolve(),
    runCommand: (spec) => {
      calls.push(spec);
      return Promise.resolve(piCommandResult("BUILDER_OK\n"));
    },
  });

  const result = await agent.chat({
    prompt: "  inspect WOD  ",
    sessionId: "browser-a",
  });

  assertEquals(result, { message: "BUILDER_OK", sessionId: "browser-a" });
  assertEquals(calls.length, 1);
  assertEquals(calls[0].binary, "/usr/local/bin/pi");
  assertEquals(calls[0].cwd, "/workspace");
  assertEquals(calls[0].args.slice(0, 4), [
    "--provider",
    PI_PROVIDER,
    "--model",
    PI_MODEL,
  ]);
  assert(calls[0].args.includes(PI_TOOLS));
  assert(calls[0].args.includes("/test/sessions/browser-a.jsonl"));
  assertEquals(calls[0].args.at(-1), "inspect WOD");
});

Deno.test("pi agent: includes validated page context in the Pi turn", async () => {
  let call: PiCommandSpec | undefined;
  const agent = createPiAgent({
    sessionRoot: "/test/sessions",
    prepareSessionRoot: () => Promise.resolve(),
    runCommand: (spec) => {
      call = spec;
      return Promise.resolve(piCommandResult("PAGE_OK"));
    },
  });

  await agent.chat({
    prompt: "summarize this page",
    sessionId: "page-a",
    pageContext: {
      kind: "notes",
      title: "Baby Interim — Playbook",
      route: "/notes/baby-interim",
      sourcePath: "static/notes-baby-interim.md",
    },
  });

  const prompt = call?.args.at(-1) ?? "";
  assert(prompt.includes("/workspace/static/notes-baby-interim.md"));
  assert(prompt.endsWith("summarize this page"));
});

Deno.test("pi agent: replaces unsafe session IDs", async () => {
  let call: PiCommandSpec | undefined;
  const agent = createPiAgent({
    sessionRoot: "/test/sessions",
    prepareSessionRoot: () => Promise.resolve(),
    runCommand: (spec) => {
      call = spec;
      return Promise.resolve(piCommandResult("SAFE"));
    },
  });

  const result = await agent.chat({ prompt: "hello", sessionId: "../../auth" });

  assert(/^[0-9a-f-]{36}$/.test(result.sessionId));
  assert(call?.args.includes(`/test/sessions/${result.sessionId}.jsonl`));
});

Deno.test("pi agent: rejects a concurrent turn on the same session", async () => {
  let started!: () => void;
  let release!: () => void;
  const didStart = new Promise<void>((resolve) => started = resolve);
  const canFinish = new Promise<void>((resolve) => release = resolve);
  const agent = createPiAgent({
    prepareSessionRoot: () => Promise.resolve(),
    runCommand: async () => {
      started();
      await canFinish;
      return piCommandResult("DONE");
    },
  });

  const first = agent.chat({ prompt: "first", sessionId: "shared" });
  await didStart;
  await assertRejects(
    () => agent.chat({ prompt: "second", sessionId: "shared" }),
    PiAgentBusyError,
  );
  release();
  assertEquals((await first).message, "DONE");
});

Deno.test("pi agent: returns concise process failures without prompt text", async () => {
  const agent = createPiAgent({
    prepareSessionRoot: () => Promise.resolve(),
    runCommand: () =>
      Promise.resolve(piCommandResult("", {
        success: false,
        code: 7,
        stderr: "provider unavailable",
      })),
  });

  const error = await assertRejects(
    () => agent.chat({ prompt: "private prompt", sessionId: "failure" }),
    PiAgentProcessError,
    "provider unavailable",
  );
  assertEquals(error.exitCode, 7);
  assert(!error.message.includes("private prompt"));
});

Deno.test("pi agent: reports session-state setup failures as process errors", async () => {
  const agent = createPiAgent({
    prepareSessionRoot: () => Promise.reject(new Error("read-only filesystem")),
  });

  await assertRejects(
    () => agent.chat({ prompt: "hello", sessionId: "failure" }),
    PiAgentProcessError,
    "Pi session state is unavailable",
  );
});
