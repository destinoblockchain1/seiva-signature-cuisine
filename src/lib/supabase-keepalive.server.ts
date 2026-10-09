import { timingSafeEqual } from "node:crypto";

export const SUPABASE_KEEPALIVE_PATH = "/api/cron/supabase-keepalive";
const SUPABASE_ORIGIN = "https://fkuoqilgxtxujxjhccqb.supabase.co";
const UPSTREAM_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 16_384;

type KeepaliveEnvironment = {
  CRON_SECRET?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  VERCEL_ENV?: string;
};

type KeepaliveResult = {
  status: "executed" | "skipped";
  last_success_at: string;
  next_due_at: string;
};

type KeepaliveLog = {
  event: "supabase_keepalive";
  status: string;
  code: string;
  duration_ms: number;
};

type KeepaliveDependencies = {
  env?: KeepaliveEnvironment;
  fetch?: typeof globalThis.fetch;
  log?: (entry: KeepaliveLog) => void;
};

class UpstreamTimeoutError extends Error {}
class InvalidUpstreamResponseError extends Error {}
class UpstreamHttpError extends Error {}

function isConfigured(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isExpectedProject(value: string | undefined): boolean {
  if (!isConfigured(value)) return false;
  try {
    const url = new URL(value);
    return (
      url.origin === SUPABASE_ORIGIN &&
      url.pathname === "/" &&
      url.search === "" &&
      url.hash === "" &&
      url.username === "" &&
      url.password === ""
    );
  } catch {
    return false;
  }
}

function isAuthorized(request: Request, secret: string): boolean {
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

function isIsoTimestamp(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) ||
    !Number.isFinite(Date.parse(value))
  ) {
    return false;
  }
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const monthDays = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return (
    year > 0 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= monthDays[month - 1] &&
    Number(value.slice(11, 13)) <= 23 &&
    Number(value.slice(14, 16)) <= 59 &&
    Number(value.slice(17, 19)) <= 59
  );
}

function validateResult(value: unknown): KeepaliveResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new InvalidUpstreamResponseError();
  }
  const result = value as Record<string, unknown>;
  if (
    (result.status !== "executed" && result.status !== "skipped") ||
    !isIsoTimestamp(result.last_success_at) ||
    !isIsoTimestamp(result.next_due_at) ||
    Date.parse(result.next_due_at) <= Date.parse(result.last_success_at)
  ) {
    throw new InvalidUpstreamResponseError();
  }
  return {
    status: result.status,
    last_success_at: result.last_success_at,
    next_due_at: result.next_due_at,
  };
}

async function readResult(response: Response, signal: AbortSignal): Promise<KeepaliveResult> {
  if (signal.aborted) throw new UpstreamTimeoutError();
  if (!response.ok) throw new UpstreamHttpError();
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json") || !response.body) {
    throw new InvalidUpstreamResponseError();
  }
  const reader = response.body.getReader();
  const cancelBody = () => {
    void reader.cancel().catch(() => {});
  };
  signal.addEventListener("abort", cancelBody, { once: true });
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (signal.aborted) throw new UpstreamTimeoutError();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_RESPONSE_BYTES) {
        void reader.cancel().catch(() => {});
        throw new InvalidUpstreamResponseError();
      }
      chunks.push(value);
    }
  } finally {
    signal.removeEventListener("abort", cancelBody);
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  let payload: unknown;
  try {
    payload = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new InvalidUpstreamResponseError();
  }
  return validateResult(payload);
}

export async function handleSupabaseKeepalive(
  request: Request,
  dependencies: KeepaliveDependencies = {},
): Promise<Response> {
  const startedAt = Date.now();
  const env = dependencies.env ?? process.env;
  const log = dependencies.log ?? ((entry: KeepaliveLog) => console.info(JSON.stringify(entry)));
  const finish = (
    httpStatus: number,
    payload: KeepaliveResult | { status: "error" | "disabled"; code?: string },
    code: string,
    headers: Record<string, string> = {},
  ): Response => {
    try {
      log({
        event: "supabase_keepalive",
        status: payload.status,
        code,
        duration_ms: Math.max(0, Date.now() - startedAt),
      });
    } catch {
      // A logging failure must not change the transaction's reported outcome.
    }
    return Response.json(payload, {
      status: httpStatus,
      headers: { "cache-control": "no-store", "x-seiva-keepalive-version": "1", ...headers },
    });
  };

  if (request.method !== "GET") {
    return finish(405, { status: "error", code: "method_not_allowed" }, "method_not_allowed", {
      allow: "GET",
    });
  }
  if (env.VERCEL_ENV !== undefined && env.VERCEL_ENV !== "production") {
    return finish(200, { status: "disabled" }, "non_production");
  }
  if (!isConfigured(env.CRON_SECRET)) {
    return finish(503, { status: "error", code: "configuration" }, "configuration");
  }
  if (!isAuthorized(request, env.CRON_SECRET)) {
    return finish(401, { status: "error", code: "unauthorized" }, "unauthorized");
  }
  if (!isExpectedProject(env.SUPABASE_URL) || !isConfigured(env.SUPABASE_SERVICE_ROLE_KEY)) {
    return finish(503, { status: "error", code: "configuration" }, "configuration");
  }

  const fetchUpstream = dependencies.fetch ?? globalThis.fetch;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new UpstreamTimeoutError());
      controller.abort();
    }, UPSTREAM_TIMEOUT_MS);
  });
  try {
    const upstream = fetchUpstream(`${SUPABASE_ORIGIN}/rest/v1/rpc/run_app_keepalive`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: "{}",
      signal: controller.signal,
      cache: "no-store",
    }).then((response) => readResult(response, controller.signal));
    const result = await Promise.race([upstream, deadline]);
    return finish(200, result, result.status === "executed" ? "ok" : "not_due");
  } catch (error) {
    if (error instanceof UpstreamTimeoutError) {
      return finish(504, { status: "error", code: "timeout" }, "timeout");
    }
    const code =
      error instanceof InvalidUpstreamResponseError ? "invalid_upstream_response" : "upstream";
    return finish(502, { status: "error", code }, code);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    controller.abort();
  }
}
