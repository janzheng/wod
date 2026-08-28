const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const PI_PROVIDER = "openrouter";
export const PI_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
export const PI_TOOLS = "read,bash,edit,write,grep,find,ls";

const DEFAULT_BINARY = "/usr/local/bin/pi";
const DEFAULT_WORKDIR = "/workspace";
const DEFAULT_SESSION_ROOT = "/root/.smolbox/wod-web-agent";
const SESSION_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;
const SYSTEM_PROMPT = [
  "You are the WOD builder running inside its smolbox computer.",
  "Keep your work in /workspace, follow the project's CLAUDE.md, and use ordinary project tools.",
  "You may inspect and edit WOD and run its existing checks.",
  "Reply concisely with what changed and what you verified.",
].join(" ");

export type PiCommandSpec = {
  binary: string;
  args: string[];
  cwd: string;
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
};

export type PiAgentRequest = {
  prompt: string;
  sessionId?: string;
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

async function defaultPrepareSessionRoot(path: string): Promise<void> {
  await Deno.mkdir(path, { recursive: true, mode: 0o700 });
}

async function defaultRunCommand(
  spec: PiCommandSpec,
): Promise<PiCommandResult> {
  const output = await new Deno.Command(spec.binary, {
    args: spec.args,
    cwd: spec.cwd,
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  }).output();

  return output;
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
  const activeSessions = new Set<string>();

  return {
    async chat(request: PiAgentRequest): Promise<PiAgentReply> {
      const prompt = request.prompt?.trim();
      if (!prompt) throw new TypeError("prompt is required");

      const sessionId = defaultSessionId(request.sessionId);
      if (activeSessions.has(sessionId)) throw new PiAgentBusyError(sessionId);
      activeSessions.add(sessionId);

      try {
        try {
          await prepareSessionRoot(sessionRoot);
        } catch (error) {
          const detail = error instanceof Error ? error.message : String(error);
          throw new PiAgentProcessError(
            `Pi session state is unavailable: ${detail}`,
          );
        }
        const sessionPath = `${sessionRoot}/${sessionId}.jsonl`;
        let result: PiCommandResult;

        try {
          result = await runCommand({
            binary,
            args: piArguments(sessionPath, prompt),
            cwd: workdir,
          });
        } catch (error) {
          const detail = error instanceof Error ? error.message : String(error);
          throw new PiAgentProcessError(`Pi could not start: ${detail}`);
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
      }
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
