const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const PI_PROVIDER = "openrouter";
export const PI_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
export const PI_TOOLS = "read,bash,edit,write,grep,find,ls";
export const PI_MAX_CONCURRENT_TURNS = 4;
export const PI_MAX_PROMPT_BYTES = 16 * 1024;
export const PI_MAX_SESSIONS = 256;
export const PI_TURN_TIMEOUT_MS = 10 * 60 * 1000;

const DEFAULT_BINARY = "/usr/local/bin/pi";
const DEFAULT_WORKDIR = "/workspace";
const DEFAULT_SESSION_ROOT = "/root/.smolbox/wod-web-agent";
const SESSION_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;
const PAGE_KINDS = new Set([
  "app",
  "notes",
  "exercise-library",
  "workout",
  "program",
  "activity",
]);
const SYSTEM_PROMPT = [
  "You are the WOD builder running inside its smolbox computer.",
  "Keep your work in /workspace, follow the project's CLAUDE.md, and use ordinary project tools.",
  "You may inspect and edit WOD and run its existing checks.",
  "Never claim the contents of a project file without using a project tool to inspect that file during the current turn.",
  "Reply concisely with what changed and what you verified.",
].join(" ");

export type PiPageContext = {
  kind: string;
  title: string;
  route: string;
  sourcePath: string;
};

export type PiCommandSpec = {
  binary: string;
  args: string[];
  cwd: string;
  signal?: AbortSignal;
};

export type PiCommandResult = {
  success: boolean;
  code: number;
  stdout: Uint8Array;
  stderr: Uint8Array;
};

export type PiCommandRunner = (spec: PiCommandSpec) => Promise<PiCommandResult>;

export type PiAgentOptions = {
  binary?: string;
  workdir?: string;
  sessionRoot?: string;
  prepareSessionRoot?: (path: string) => Promise<void>;
  runCommand?: PiCommandRunner;
  listSessionIds?: (path: string) => Promise<string[]>;
  removeSession?: (path: string) => Promise<void>;
  maxConcurrentTurns?: number;
  maxSessions?: number;
  timeoutMs?: number;
};

export type PiAgentRequest = {
  prompt: string;
  sessionId?: string;
  pageContext?: unknown;
  signal?: AbortSignal;
};

export type PiAgentReply = {
  message: string;
  sessionId: string;
};

export class PiAgentBusyError extends Error {
  constructor(sessionId: string) {
    super(`Pi session is already running: ${sessionId}`);
    this.name = "PiAgentBusyError";
  }
}

export class PiAgentCapacityError extends Error {
  constructor(message = "WOD Builder is at capacity") {
    super(message);
    this.name = "PiAgentCapacityError";
  }
}

export class PiAgentSessionLimitError extends Error {
  constructor() {
    super("WOD Builder session limit reached; clear an old session first");
    this.name = "PiAgentSessionLimitError";
  }
}

export class PiAgentTimeoutError extends Error {
  constructor() {
    super("Pi turn exceeded its deadline");
    this.name = "PiAgentTimeoutError";
  }
}

export class PiAgentCancelledError extends Error {
  constructor() {
    super("Pi turn was cancelled");
    this.name = "PiAgentCancelledError";
  }
}

export class PiAgentProcessError extends Error {
  readonly exitCode?: number;

  constructor(message: string, exitCode?: number) {
    super(message);
    this.name = "PiAgentProcessError";
    this.exitCode = exitCode;
  }
}

function defaultSessionId(value?: string): string {
  const candidate = value?.trim();
  return candidate && SESSION_ID.test(candidate)
    ? candidate
    : crypto.randomUUID();
}

export function normalizePiPageContext(
  value: unknown,
): PiPageContext | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Record<string, unknown>;
  const kind = typeof candidate.kind === "string" ? candidate.kind.trim() : "";
  const title = typeof candidate.title === "string"
    ? candidate.title.trim()
    : "";
  const route = typeof candidate.route === "string"
    ? candidate.route.trim()
    : "";
  const sourcePath = typeof candidate.sourcePath === "string"
    ? candidate.sourcePath.trim()
    : "";

  if (!PAGE_KINDS.has(kind)) return undefined;
  if (!title || title.length > 160 || /[\r\n]/.test(title)) return undefined;
  if (!route.startsWith("/") || route.length > 256 || /[\r\n]/.test(route)) {
    return undefined;
  }
  if (
    !sourcePath || sourcePath.length > 256 || sourcePath.startsWith("/") ||
    sourcePath.includes("\\") || sourcePath.split("/").includes("..") ||
    !/^[A-Za-z0-9._/-]+$/.test(sourcePath)
  ) {
    return undefined;
  }

  return { kind, title, route, sourcePath };
}

export function formatPiPrompt(
  prompt: string,
  pageContext?: PiPageContext,
): string {
  if (!pageContext) return prompt;

  return [
    "[WOD page context]",
    `View: ${pageContext.kind}`,
    `Title: ${JSON.stringify(pageContext.title)}`,
    `Browser route: ${JSON.stringify(pageContext.route)}`,
    `Project source: /workspace/${pageContext.sourcePath}`,
    'When the user says "this page", they mean the source path above.',
    "This pointer does not contain the source contents. Before making any claim about those contents, use a project tool to inspect that source path during this turn.",
    "[/WOD page context]",
    "",
    "[User request]",
    prompt,
  ].join("\n");
}

async function defaultPrepareSessionRoot(path: string): Promise<void> {
  await Deno.mkdir(path, { recursive: true, mode: 0o700 });
}

async function defaultListSessionIds(path: string): Promise<string[]> {
  const ids: string[] = [];
  try {
    for await (const entry of Deno.readDir(path)) {
      if (!entry.isFile || !entry.name.endsWith(".jsonl")) continue;
      const id = entry.name.slice(0, -".jsonl".length);
      if (SESSION_ID.test(id)) ids.push(id);
    }
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return [];
    throw error;
  }
  return ids;
}

async function defaultRemoveSession(path: string): Promise<void> {
  try {
    await Deno.remove(path);
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) throw error;
  }
}

function abortReason(signal: AbortSignal): Error {
  return signal.reason instanceof Error
    ? signal.reason
    : new PiAgentCancelledError();
}

async function defaultRunCommand(
  spec: PiCommandSpec,
): Promise<PiCommandResult> {
  const child = new Deno.Command(spec.binary, {
    args: spec.args,
    cwd: spec.cwd,
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  }).spawn();

  let forceKill: number | undefined;
  let rejectAbort: ((error: Error) => void) | undefined;
  const abortPromise = new Promise<never>((_resolve, reject) => {
    rejectAbort = reject;
  });
  const stop = () => {
    try {
      child.kill("SIGTERM");
    } catch {
      // The child may have exited between the signal and this callback.
    }
    forceKill = setTimeout(() => {
      try {
        child.kill("SIGKILL");
      } catch {
        // Already reaped.
      }
    }, 2_000);
    rejectAbort?.(abortReason(spec.signal!));
  };

  if (spec.signal?.aborted) stop();
  else spec.signal?.addEventListener("abort", stop, { once: true });

  try {
    const output = await Promise.race([child.output(), abortPromise]);
    return output;
  } finally {
    spec.signal?.removeEventListener("abort", stop);
    if (forceKill !== undefined && !spec.signal?.aborted) {
      clearTimeout(forceKill);
    }
  }
}

export function piArguments(sessionPath: string, prompt: string): string[] {
  return [
    "--provider",
    PI_PROVIDER,
    "--model",
    PI_MODEL,
    "--mode",
    "text",
    "--print",
    "--session",
    sessionPath,
    "--approve",
    "--tools",
    PI_TOOLS,
    "--append-system-prompt",
    SYSTEM_PROMPT,
    "--",
    prompt,
  ];
}

export function createPiAgent(options: PiAgentOptions = {}) {
  const binary = options.binary ?? DEFAULT_BINARY;
  const workdir = options.workdir ?? DEFAULT_WORKDIR;
  const sessionRoot = (options.sessionRoot ?? DEFAULT_SESSION_ROOT).replace(
    /\/$/,
    "",
  );
  const prepareSessionRoot = options.prepareSessionRoot ??
    defaultPrepareSessionRoot;
  const runCommand = options.runCommand ?? defaultRunCommand;
  const listSessionIds = options.listSessionIds ?? defaultListSessionIds;
  const removeSession = options.removeSession ?? defaultRemoveSession;
  const maxConcurrentTurns = options.maxConcurrentTurns ??
    PI_MAX_CONCURRENT_TURNS;
  const maxSessions = options.maxSessions ?? PI_MAX_SESSIONS;
  const timeoutMs = options.timeoutMs ?? PI_TURN_TIMEOUT_MS;
  const activeSessions = new Set<string>();
  const pendingDeletes = new Set<string>();
  let sessionIdsPromise: Promise<Set<string>> | undefined;

  async function knownSessionIds(): Promise<Set<string>> {
    if (!sessionIdsPromise) {
      sessionIdsPromise = (async () => {
        await prepareSessionRoot(sessionRoot);
        return new Set(await listSessionIds(sessionRoot));
      })();
    }
    try {
      return await sessionIdsPromise;
    } catch (error) {
      sessionIdsPromise = undefined;
      const detail = error instanceof Error ? error.message : String(error);
      throw new PiAgentProcessError(
        `Pi session state is unavailable: ${detail}`,
      );
    }
  }

  return {
    async chat(request: PiAgentRequest): Promise<PiAgentReply> {
      const prompt = request.prompt?.trim();
      if (!prompt) throw new TypeError("prompt is required");
      if (encoder.encode(prompt).byteLength > PI_MAX_PROMPT_BYTES) {
        throw new TypeError(
          `prompt exceeds ${PI_MAX_PROMPT_BYTES} UTF-8 bytes`,
        );
      }

      const sessionId = defaultSessionId(request.sessionId);
      if (activeSessions.has(sessionId)) throw new PiAgentBusyError(sessionId);
      if (activeSessions.size >= maxConcurrentTurns) {
        throw new PiAgentCapacityError();
      }
      activeSessions.add(sessionId);

      try {
        const knownSessions = await knownSessionIds();
        if (!knownSessions.has(sessionId)) {
          if (knownSessions.size >= maxSessions) {
            throw new PiAgentSessionLimitError();
          }
          knownSessions.add(sessionId);
        }
        const sessionPath = `${sessionRoot}/${sessionId}.jsonl`;
        let result: PiCommandResult;
        const turnController = new AbortController();
        const cancelTurn = () =>
          turnController.abort(new PiAgentCancelledError());
        if (request.signal?.aborted) cancelTurn();
        else {
          request.signal?.addEventListener("abort", cancelTurn, { once: true });
        }
        const timeout = setTimeout(() => {
          turnController.abort(new PiAgentTimeoutError());
        }, timeoutMs);

        try {
          const turnPrompt = formatPiPrompt(
            prompt,
            normalizePiPageContext(request.pageContext),
          );
          result = await runCommand({
            binary,
            args: piArguments(sessionPath, turnPrompt),
            cwd: workdir,
            signal: turnController.signal,
          });
        } catch (error) {
          if (
            error instanceof PiAgentTimeoutError ||
            error instanceof PiAgentCancelledError ||
            error instanceof PiAgentSessionLimitError
          ) {
            throw error;
          }
          const detail = error instanceof Error ? error.message : String(error);
          throw new PiAgentProcessError(`Pi could not start: ${detail}`);
        } finally {
          clearTimeout(timeout);
          request.signal?.removeEventListener("abort", cancelTurn);
        }

        if (!result.success) {
          const detail = decoder.decode(result.stderr).trim().slice(0, 2_000);
          throw new PiAgentProcessError(
            detail || `Pi exited with code ${result.code}`,
            result.code,
          );
        }

        const message = decoder.decode(result.stdout).trim();
        if (!message) {
          throw new PiAgentProcessError(
            "Pi returned no final message",
            result.code,
          );
        }

        return { message, sessionId };
      } finally {
        activeSessions.delete(sessionId);
        if (pendingDeletes.delete(sessionId)) {
          const knownSessions = await knownSessionIds();
          knownSessions.delete(sessionId);
          await removeSession(`${sessionRoot}/${sessionId}.jsonl`).catch(
            (error) => console.error("Could not clear Pi session:", error),
          );
        }
      }
    },

    async clearSession(value: string): Promise<void> {
      const sessionId = value.trim();
      if (!SESSION_ID.test(sessionId)) {
        throw new TypeError("valid sessionId is required");
      }
      const knownSessions = await knownSessionIds();
      knownSessions.delete(sessionId);
      if (activeSessions.has(sessionId)) {
        pendingDeletes.add(sessionId);
        return;
      }
      await removeSession(`${sessionRoot}/${sessionId}.jsonl`);
    },
  };
}

export function piCommandResult(
  stdout: string,
  options: { success?: boolean; code?: number; stderr?: string } = {},
): PiCommandResult {
  return {
    success: options.success ?? true,
    code: options.code ?? 0,
    stdout: encoder.encode(stdout),
    stderr: encoder.encode(options.stderr ?? ""),
  };
}
