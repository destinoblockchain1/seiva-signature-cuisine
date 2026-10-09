import { afterEach, describe, expect, it, vi } from "vitest";
import {
  handleSupabaseKeepalive,
  SUPABASE_KEEPALIVE_PATH,
} from "../src/lib/supabase-keepalive.server";

const env = {
  CRON_SECRET: "local-cron-fixture",
  SUPABASE_URL: "https://fkuoqilgxtxujxjhccqb.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "local-service-role-fixture",
  VERCEL_ENV: "production",
};
const result = {
  status: "executed" as const,
  last_success_at: "2026-10-08T12:00:00.123456+00:00",
  next_due_at: "2026-10-11T12:00:00.123456+00:00",
};

function request(authorization: string | null = `Bearer ${env.CRON_SECRET}`, method = "GET") {
  return new Request(`https://app.example.invalid${SUPABASE_KEEPALIVE_PATH}`, {
    method,
    headers: authorization === null ? {} : { authorization },
  });
}

function dependencies(upstream = Response.json(result), overrides: Partial<typeof env> = {}) {
  return {
    env: { ...env, ...overrides },
    fetch: vi.fn<typeof globalThis.fetch>().mockResolvedValue(upstream),
    log: vi.fn(),
  };
}

afterEach(() => vi.useRealTimers());

describe("Supabase keepalive HTTP contract", () => {
  it.each([null, "", "Bearer wrong", env.CRON_SECRET, `bearer ${env.CRON_SECRET}`])(
    "rejects unauthorized requests before any database call (%s)",
    async (authorization) => {
      const deps = dependencies();
      const response = await handleSupabaseKeepalive(request(authorization), deps);
      expect(response.status).toBe(401);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(deps.fetch).not.toHaveBeenCalled();
    },
  );

  it.each(["POST", "HEAD", "PUT", "DELETE"])(
    "rejects %s without a database call",
    async (method) => {
      const deps = dependencies();
      const response = await handleSupabaseKeepalive(request(null, method), deps);
      expect(response.status).toBe(405);
      expect(response.headers.get("allow")).toBe("GET");
      expect(deps.fetch).not.toHaveBeenCalled();
    },
  );

  it.each(["", "   ", undefined])(
    "fails closed when the cron secret is missing or blank",
    async (secret) => {
      const deps = dependencies();
      deps.env.CRON_SECRET = secret as string;
      const response = await handleSupabaseKeepalive(request(), deps);
      expect(response.status).toBe(503);
      expect(deps.fetch).not.toHaveBeenCalled();
    },
  );

  it.each([
    undefined,
    "",
    "not-a-url",
    "http://fkuoqilgxtxujxjhccqb.supabase.co",
    "https://another-project.supabase.co",
    `${env.SUPABASE_URL}/rest/v1`,
    `${env.SUPABASE_URL}?project=other`,
    `${env.SUPABASE_URL}#other`,
    "https://user:password@fkuoqilgxtxujxjhccqb.supabase.co",
  ])("rejects missing or wrong project configuration without calling Supabase", async (url) => {
    const deps = dependencies();
    deps.env.SUPABASE_URL = url as string;
    const response = await handleSupabaseKeepalive(request(), deps);
    expect(response.status).toBe(503);
    expect(deps.fetch).not.toHaveBeenCalled();
  });

  it.each(["", " ", undefined])("requires a server service-role key", async (key) => {
    const deps = dependencies();
    deps.env.SUPABASE_SERVICE_ROLE_KEY = key as string;
    expect((await handleSupabaseKeepalive(request(), deps)).status).toBe(503);
    expect(deps.fetch).not.toHaveBeenCalled();
  });

  it.each(["preview", "development", ""])(
    "disables database writes in Vercel %s",
    async (target) => {
      const deps = dependencies(Response.json(result), { VERCEL_ENV: target });
      const response = await handleSupabaseKeepalive(request(null), deps);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ status: "disabled" });
      expect(deps.fetch).not.toHaveBeenCalled();
    },
  );

  it.each(["executed", "skipped"] as const)("reports validated %s transactions", async (status) => {
    const expected = { ...result, status };
    const deps = dependencies(Response.json(expected));
    const response = await handleSupabaseKeepalive(request(), deps);
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-seiva-keepalive-version")).toBe("1");
    expect(await response.json()).toEqual(expected);
    expect(deps.fetch).toHaveBeenCalledExactlyOnceWith(
      `${env.SUPABASE_URL}/rest/v1/rpc/run_app_keepalive`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: "{}",
        signal: expect.any(AbortSignal),
        cache: "no-store",
      },
    );
    expect(deps.log).toHaveBeenCalledWith({
      event: "supabase_keepalive",
      status,
      code: status === "executed" ? "ok" : "not_due",
      duration_ms: expect.any(Number),
    });
  });

  it("allows a configured local app without VERCEL_ENV", async () => {
    const deps = dependencies();
    delete (deps.env as { VERCEL_ENV?: string }).VERCEL_ENV;
    expect((await handleSupabaseKeepalive(request(), deps)).status).toBe(200);
    expect(deps.fetch).toHaveBeenCalledOnce();
  });

  it.each([
    null,
    [],
    true,
    { status: "executed" },
    { ...result, status: "success" },
    { ...result, last_success_at: null },
    { ...result, last_success_at: "NaN" },
    { ...result, next_due_at: "2026-99-99T12:00:00Z" },
    { ...result, next_due_at: "2026-02-30T12:00:00Z" },
    { ...result, next_due_at: "2026-10-11T24:00:00Z" },
    { ...result, next_due_at: result.last_success_at },
    { ...result, next_due_at: "2026-10-01T12:00:00Z" },
  ])("rejects false success and malformed RPC contracts", async (payload) => {
    const response = await handleSupabaseKeepalive(request(), dependencies(Response.json(payload)));
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ status: "error", code: "invalid_upstream_response" });
  });

  it.each([
    new Response("broken-json", { headers: { "content-type": "application/json" } }),
    new Response("success", { headers: { "content-type": "text/plain" } }),
    new Response("", { headers: { "content-type": "application/json" } }),
    new Response("x".repeat(16_385), { headers: { "content-type": "application/json" } }),
  ])("rejects malformed, empty, non-JSON or oversized upstream bodies", async (upstream) => {
    const response = await handleSupabaseKeepalive(request(), dependencies(upstream));
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ status: "error", code: "invalid_upstream_response" });
  });

  it("does not disclose upstream error bodies, exception messages, tokens or configuration", async () => {
    const sensitive = `${env.CRON_SECRET} ${env.SUPABASE_SERVICE_ROLE_KEY} ${env.SUPABASE_URL}`;
    const deps = dependencies(new Response(sensitive, { status: 500 }));
    const upstreamFailure = await handleSupabaseKeepalive(request(), deps);
    expect(upstreamFailure.status).toBe(502);
    expect(await upstreamFailure.text()).not.toContain(sensitive);
    deps.fetch.mockRejectedValueOnce(new Error(sensitive));
    const thrownFailure = await handleSupabaseKeepalive(request(), deps);
    expect(thrownFailure.status).toBe(502);
    const output = `${await thrownFailure.text()} ${JSON.stringify(deps.log.mock.calls)}`;
    for (const value of Object.values(env)) expect(output).not.toContain(value);
  });

  it("aborts and returns 504 after ten seconds even if the transport never resolves", async () => {
    vi.useFakeTimers();
    const deps = dependencies();
    deps.fetch.mockImplementation(() => new Promise<Response>(() => {}));
    const pending = handleSupabaseKeepalive(request(), deps);
    await vi.advanceTimersByTimeAsync(10_000);
    const response = await pending;
    expect(response.status).toBe(504);
    expect(await response.json()).toEqual({ status: "error", code: "timeout" });
    expect(deps.fetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("applies the same deadline while reading the upstream body", async () => {
    vi.useFakeTimers();
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({ start() {}, cancel });
    const deps = dependencies(
      new Response(stream, { headers: { "content-type": "application/json" } }),
    );
    const pending = handleSupabaseKeepalive(request(), deps);
    await vi.advanceTimersByTimeAsync(10_000);
    expect((await pending).status).toBe(504);
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("keeps a committed success visible if the logger fails", async () => {
    const deps = dependencies();
    deps.log.mockImplementation(() => {
      throw new Error("fixture logger unavailable");
    });
    expect((await handleSupabaseKeepalive(request(), deps)).status).toBe(200);
  });
});
