import type { PiAgentRequest } from "./pi-agent.ts";

export type PiJobStatus =
  | "pending"
  | "running"
  | "completed"
  | "error"
  | "cancelled";

type PiJobRequest = Omit<PiAgentRequest, "signal">;

type StoredPiJob<Result> = {
  id: string;
  status: PiJobStatus;
  sessionId: string;
  createdAt: number;
  updatedAt: number;
  request?: PiJobRequest;
  controller?: AbortController;
  result?: Result;
  error?: string;
};

export type PiJobView<Result> = {
  id: string;
  status: PiJobStatus;
  sessionId: string;
  createdAt: number;
  updatedAt: number;
  result?: Result;
  error?: string;
};

export type PiJobStoreOptions<Result> = {
  run: (request: PiAgentRequest) => Promise<Result>;
  formatError?: (error: unknown) => string;
  createId?: () => string;
  now?: () => number;
  maxRetained?: number;
};

const terminal = (status: PiJobStatus) =>
  status === "completed" || status === "error" || status === "cancelled";

const cancelled = <Result>(job: StoredPiJob<Result>) =>
  job.status === "cancelled";

export function createPiJobStore<Result>(options: PiJobStoreOptions<Result>) {
  const jobs = new Map<string, StoredPiJob<Result>>();
  const createId = options.createId ?? (() => crypto.randomUUID());
  const now = options.now ?? (() => Date.now());
  const maxRetained = options.maxRetained ?? 64;
  const formatError = options.formatError ?? ((error: unknown) =>
    error instanceof Error ? error.message : "Pi could not complete this request.");

  const view = (job: StoredPiJob<Result>): PiJobView<Result> => {
    const publicJob: PiJobView<Result> = {
      id: job.id,
      status: job.status,
      sessionId: job.sessionId,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
    if (job.status === "completed") publicJob.result = job.result;
    if (job.status === "error") publicJob.error = job.error;
    return publicJob;
  };

  const pruneTerminalJobs = () => {
    if (jobs.size < maxRetained) return;
    for (const [id, job] of jobs) {
      if (!terminal(job.status)) continue;
      jobs.delete(id);
      if (jobs.size < maxRetained) return;
    }
    if (jobs.size >= maxRetained) {
      throw new Error("WOD Builder job capacity reached");
    }
  };

  const runJob = async (job: StoredPiJob<Result>) => {
    if (cancelled(job) || !job.request || !job.controller) return;
    job.status = "running";
    job.updatedAt = now();
    try {
      const result = await options.run({
        ...job.request,
        signal: job.controller.signal,
      });
      if (cancelled(job)) return;
      job.status = "completed";
      job.result = result;
      job.updatedAt = now();
    } catch (error) {
      if (cancelled(job)) return;
      job.status = "error";
      job.error = formatError(error);
      job.updatedAt = now();
    } finally {
      job.request = undefined;
      job.controller = undefined;
    }
  };

  return {
    create(request: PiJobRequest): PiJobView<Result> {
      if (!request.sessionId) throw new TypeError("sessionId is required");
      pruneTerminalJobs();
      const timestamp = now();
      const job: StoredPiJob<Result> = {
        id: createId(),
        status: "pending",
        sessionId: request.sessionId,
        createdAt: timestamp,
        updatedAt: timestamp,
        request,
        controller: new AbortController(),
      };
      jobs.set(job.id, job);
      queueMicrotask(() => void runJob(job));
      return view(job);
    },

    get(id: string): PiJobView<Result> | undefined {
      const job = jobs.get(id);
      return job ? view(job) : undefined;
    },

    cancelSession(sessionId: string): number {
      let cancelled = 0;
      for (const job of jobs.values()) {
        if (
          job.sessionId !== sessionId ||
          (job.status !== "pending" && job.status !== "running")
        ) continue;
        job.status = "cancelled";
        job.updatedAt = now();
        job.controller?.abort();
        cancelled += 1;
      }
      return cancelled;
    },
  };
}
