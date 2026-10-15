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
const skipped = { ...result, status: "skipped" as const };

function progress(
  requests_completed = 0,
  write_cycles_completed = 0,
  health_checks_completed = 0,
  requests_attempted = requests_completed,
) {
  return {
    requests_target: 3,
    requests_attempted,
    requests_completed,
    write_cycles_completed,
    health_checks_completed,
  };
}

function request(authorization: string | null = "Bearer " + env.CRON_SECRET, method = "GET") {
  return new Request("https://app.example.invalid" + SUPABASE_KEEPALIVE_PATH, {
    method,
    headers: authorization === null ? {} : { authorization },
  });
}

function dependencies(upstream = Response.json(result), overrides: Partial<typeof env> = {}) {
  return {
    env: { ...env, ...overrides },
    // Each RPC needs its own unread body, just as separate fetch responses do.
    fetch: vi.fn<typeof globalThis.fetch>().mockImplementation(async () => upstream.clone()),
    log: vi.fn(),
  };
}

function delayedResponse(milliseconds: number, payload: typeof result | typeof skipped) {
  return new Promise<Response>((resolve) => {
    setTimeout(() => resolve(Response.json(payload)), milliseconds);
  });
}

afterEach(() => vi.useRealTimers());

describe("Supabase keepalive HTTP contract", () => {
  it.each([null, "", "Bearer wrong", env.CRON_SECRET, "bearer " + env.CRON_SECRET])(
    "rejects unauthorized requests before any database call (%s)",
    async (authorization) => {
      const deps = dependencies();
      const response = await handleSupabaseKeepalive(request(authorization), deps);
      expect(response.status).toBe(401);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(await response.json()).toMatchObject(progress());
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
      expect(await response.json()).toMatchObject(progress());
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
      expect(await response.json()).toMatchObject(progress());
      expect(deps.fetch).not.toHaveBeenCalled();
    },
  );

  it.each([
    undefined,
    "",
    "not-a-url",
    "http://fkuoqilgxtxujxjhccqb.supabase.co",
    "https://another-project.supabase.co",
    env.SUPABASE_URL + "/rest/v1",
    env.SUPABASE_URL + "?project=other",
    env.SUPABASE_URL + "#other",
    "https://user:password@fkuoqilgxtxujxjhccqb.supabase.co",
  ])("rejects missing or wrong project configuration without calling Supabase", async (url) => {
    const deps = dependencies();
    deps.env.SUPABASE_URL = url as string;
    const response = await handleSupabaseKeepalive(request(), deps);
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject(progress());
    expect(deps.fetch).not.toHaveBeenCalled();
  });

  it.each(["", " ", undefined])("requires a server service-role key", async (key) => {
    const deps = dependencies();
    deps.env.SUPABASE_SERVICE_ROLE_KEY = key as string;
    const response = await handleSupabaseKeepalive(request(), deps);
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject(progress());
    expect(deps.fetch).not.toHaveBeenCalled();
  });

  it.each(["preview", "development", ""])(
    "disables database writes in Vercel %s",
    async (target) => {
      const deps = dependencies(Response.json(result), { VERCEL_ENV: target });
      const response = await handleSupabaseKeepalive(request(null), deps);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ status: "disabled", ...progress() });
      expect(deps.fetch).not.toHaveBeenCalled();
    },
  );

  it.each(["executed", "skipped"] as const)("reports validated %s transactions", async (status) => {
    const expected = { ...result, status };
    const counts = progress(3, status === "executed" ? 1 : 0, status === "executed" ? 2 : 3);
    const deps = dependencies();
    deps.fetch
      .mockResolvedValueOnce(Response.json(expected))
      .mockResolvedValueOnce(Response.json(skipped))
      .mockResolvedValueOnce(Response.json(skipped));
    const response = await handleSupabaseKeepalive(request(), deps);
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-seiva-keepalive-version")).toBe("2");
    expect(await response.json()).toEqual({ ...expected, ...counts });
    expect(deps.fetch).toHaveBeenCalledTimes(3);
    for (const call of deps.fetch.mock.calls) {
      expect(call).toEqual([
        env.SUPABASE_URL + "/rest/v1/rpc/run_app_keepalive",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "application/json",
            apikey: env.SUPABASE_SERVICE_ROLE_KEY,
            authorization: "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY,
          },
          body: "{}",
          signal: expect.any(AbortSignal),
          cache: "no-store",
        },
      ]);
    }
    expect(deps.log).toHaveBeenCalledWith({
      event: "supabase_keepalive",
      status,
      code: status === "executed" ? "ok" : "not_due",
      duration_ms: expect.any(Number),
      ...counts,
    });
  });

  it("waits for each complete RPC before starting the next real request", async () => {
    const deps = dependencies();
    const releases: Array<(response: Response) => void> = [];
    deps.fetch.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          releases.push(resolve);
        }),
    );
    const pending = handleSupabaseKeepalive(request(), deps);
    expect(deps.fetch).toHaveBeenCalledTimes(1);
    releases[0](Response.json(result));
    await vi.waitFor(() => expect(deps.fetch).toHaveBeenCalledTimes(2));
    releases[1](Response.json(skipped));
    await vi.waitFor(() => expect(deps.fetch).toHaveBeenCalledTimes(3));
    releases[2](Response.json(skipped));
    expect(await (await pending).json()).toEqual({ ...result, ...progress(3, 1, 2) });
  });

  it("preserves an executed cycle when the first request skipped before the 72-hour boundary", async () => {
    const updated = {
      status: "executed" as const,
      last_success_at: "2026-10-15T12:00:00.123456+00:00",
      next_due_at: "2026-10-18T12:00:00.123456+00:00",
    };
    const deps = dependencies();
    deps.fetch
      .mockResolvedValueOnce(Response.json(skipped))
      .mockResolvedValueOnce(Response.json(updated))
      .mockResolvedValueOnce(Response.json({ ...updated, status: "skipped" }));
    const response = await handleSupabaseKeepalive(request(), deps);
    expect(await response.json()).toEqual({ ...updated, ...progress(3, 1, 2) });
    expect(deps.fetch).toHaveBeenCalledTimes(3);
  });

  it("allows a configured local app without VERCEL_ENV", async () => {
    const deps = dependencies();
    delete (deps.env as { VERCEL_ENV?: string }).VERCEL_ENV;
    expect((await handleSupabaseKeepalive(request(), deps)).status).toBe(200);
    expect(deps.fetch).toHaveBeenCalledTimes(3);
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
    const deps = dependencies(Response.json(payload));
    const response = await handleSupabaseKeepalive(request(), deps);
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      status: "error",
      code: "invalid_upstream_response",
      ...progress(0, 0, 0, 1),
    });
    expect(deps.fetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    new Response("broken-json", { headers: { "content-type": "application/json" } }),
    new Response("success", { headers: { "content-type": "text/plain" } }),
    new Response("", { headers: { "content-type": "application/json" } }),
    new Response("x".repeat(16_385), { headers: { "content-type": "application/json" } }),
  ])("rejects malformed, empty, non-JSON or oversized upstream bodies", async (upstream) => {
    const deps = dependencies(upstream);
    const response = await handleSupabaseKeepalive(request(), deps);
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      status: "error",
      code: "invalid_upstream_response",
      ...progress(0, 0, 0, 1),
    });
    expect(deps.fetch).toHaveBeenCalledTimes(1);
  });

  it.each([2, 3])(
    "stops on RPC %i failure and exposes safe progress instead of false success",
    async (failedRequest) => {
      const sensitive = env.CRON_SECRET + " " + env.SUPABASE_SERVICE_ROLE_KEY;
      const deps = dependencies();
      deps.fetch.mockResolvedValueOnce(Response.json(result));
      if (failedRequest === 3) deps.fetch.mockResolvedValueOnce(Response.json(skipped));
      deps.fetch.mockResolvedValueOnce(new Response(sensitive, { status: 500 }));
      const response = await handleSupabaseKeepalive(request(), deps);
      const counts = progress(failedRequest - 1, 1, failedRequest - 2, failedRequest);
      expect(response.status).toBe(502);
      expect(await response.json()).toEqual({
        ...result,
        status: "error",
        code: "upstream",
        ...counts,
      });
      expect(deps.fetch).toHaveBeenCalledTimes(failedRequest);
      expect(deps.log).toHaveBeenCalledWith({
        event: "supabase_keepalive",
        status: "error",
        code: "upstream",
        duration_ms: expect.any(Number),
        ...counts,
      });
      const logged = JSON.stringify(deps.log.mock.calls);
      expect(logged).not.toContain(env.CRON_SECRET);
      expect(logged).not.toContain(env.SUPABASE_SERVICE_ROLE_KEY);
    },
  );

  it("does not accept a malformed second response or start a third request", async () => {
    const deps = dependencies();
    deps.fetch
      .mockResolvedValueOnce(Response.json(result))
      .mockResolvedValueOnce(Response.json({ ...skipped, next_due_at: null }));
    const response = await handleSupabaseKeepalive(request(), deps);
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      ...result,
      status: "error",
      code: "invalid_upstream_response",
      ...progress(1, 1, 0, 2),
    });
    expect(deps.fetch).toHaveBeenCalledTimes(2);
  });

  it("does not disclose upstream error bodies, exception messages, tokens or configuration", async () => {
    const sensitive =
      env.CRON_SECRET + " " + env.SUPABASE_SERVICE_ROLE_KEY + " " + env.SUPABASE_URL;
    const deps = dependencies(new Response(sensitive, { status: 500 }));
    const upstreamFailure = await handleSupabaseKeepalive(request(), deps);
    expect(upstreamFailure.status).toBe(502);
    expect(await upstreamFailure.text()).not.toContain(sensitive);
    deps.fetch.mockRejectedValueOnce(new Error(sensitive));
    const thrownFailure = await handleSupabaseKeepalive(request(), deps);
    expect(thrownFailure.status).toBe(502);
    const output = (await thrownFailure.text()) + " " + JSON.stringify(deps.log.mock.calls);
    for (const value of Object.values(env)) expect(output).not.toContain(value);
  });

  it("aborts and returns 504 after ten seconds even if the first transport never resolves", async () => {
    vi.useFakeTimers();
    const deps = dependencies();
    deps.fetch.mockImplementation(() => new Promise<Response>(() => {}));
    const pending = handleSupabaseKeepalive(request(), deps);
    await vi.advanceTimersByTimeAsync(10_000);
    const response = await pending;
    expect(response.status).toBe(504);
    expect(await response.json()).toEqual({
      status: "error",
      code: "timeout",
      ...progress(0, 0, 0, 1),
    });
    expect(deps.fetch).toHaveBeenCalledTimes(1);
    expect(deps.fetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("applies the same deadline while reading the first upstream body", async () => {
    vi.useFakeTimers();
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({ start() {}, cancel });
    const deps = dependencies();
    // Use this one real stream directly so the test can observe its cancellation.
    deps.fetch.mockResolvedValueOnce(
      new Response(stream, { headers: { "content-type": "application/json" } }),
    );
    const pending = handleSupabaseKeepalive(request(), deps);
    await vi.advanceTimersByTimeAsync(10_000);
    expect((await pending).status).toBe(504);
    expect(deps.fetch).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledOnce();
  });

  it.each([2, 3])(
    "keeps one total ten-second deadline through request %i and body parsing",
    async (stalledRequest) => {
      vi.useFakeTimers();
      const startedAt = Date.now();
      const cancel = vi.fn();
      const deps = dependencies();
      deps.fetch.mockImplementationOnce(() => delayedResponse(6_000, result));
      if (stalledRequest === 3) {
        deps.fetch.mockImplementationOnce(() => delayedResponse(3_000, skipped));
        const stream = new ReadableStream<Uint8Array>({ start() {}, cancel });
        deps.fetch.mockResolvedValueOnce(
          new Response(stream, { headers: { "content-type": "application/json" } }),
        );
      } else {
        deps.fetch.mockImplementationOnce(() => new Promise<Response>(() => {}));
      }
      let settled = false;
      const pending = handleSupabaseKeepalive(request(), deps);
      void pending.then(() => {
        settled = true;
      });
      await vi.advanceTimersByTimeAsync(9_999);
      expect(deps.fetch).toHaveBeenCalledTimes(stalledRequest);
      expect(settled).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      const response = await pending;
      expect(Date.now() - startedAt).toBe(10_000);
      expect(response.status).toBe(504);
      expect(await response.json()).toEqual({
        ...result,
        status: "error",
        code: "timeout",
        ...progress(stalledRequest - 1, 1, stalledRequest - 2, stalledRequest),
      });
      const signals = deps.fetch.mock.calls.map((call) => call[1]?.signal);
      expect(new Set(signals).size).toBe(1);
      expect(signals[0]?.aborted).toBe(true);
      expect(cancel).toHaveBeenCalledTimes(stalledRequest === 3 ? 1 : 0);
      expect(vi.getTimerCount()).toBe(0);
    },
  );

  it("keeps a committed success visible if the logger fails", async () => {
    const deps = dependencies();
    deps.log.mockImplementation(() => {
      throw new Error("fixture logger unavailable");
    });
    expect((await handleSupabaseKeepalive(request(), deps)).status).toBe(200);
    expect(deps.fetch).toHaveBeenCalledTimes(3);
  });
});
