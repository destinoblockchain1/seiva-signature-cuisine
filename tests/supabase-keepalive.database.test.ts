import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";

// Isolated PostgreSQL engine: the actual migration runs without credentials or network.
// PGlite serializes one connection; these tests do not prove cross-connection locking.
const db = new PGlite();
const pulseId = "seiva-keepalive";
const hours72 = 72 * 60 * 60 * 1000;

type Row = Record<string, unknown>;
type KeepaliveResult = {
  status: "executed" | "skipped";
  last_success_at: string;
  next_due_at: string;
};
type State = {
  singleton: boolean;
  last_success_at: Date | null;
  completed_cycles: number;
};
type PulseEvent = {
  operation: string;
  pulse_id: string;
  created_at: Date;
};

async function query<T = Row>(sql: string, params: unknown[] = []) {
  return (await db.query<T>(sql, params)).rows;
}

async function useRole(role: "anon" | "authenticated" | "service_role") {
  await db.exec(`reset role; set role ${role}`);
}

async function runKeepalive() {
  return (
    await query<{ result: KeepaliveResult }>("select public.run_app_keepalive() as result")
  )[0].result;
}

async function state() {
  return (await query<State>("select * from seiva_keepalive.state"))[0];
}

async function pulseEvents() {
  await db.exec("reset role");
  return query<PulseEvent>(
    "select operation, pulse_id, created_at from public.keepalive_fixture_events order by event_id",
  );
}

beforeAll(async () => {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    grant usage on schema public to anon, authenticated, service_role;
  `);
  await db.exec(
    await readFile(
      new URL("../supabase/migrations/20261009030641_app_keepalive.sql", import.meta.url),
      "utf8",
    ),
  );
  await db.exec(`
    create table public.keepalive_fixture_events (
      event_id bigint generated always as identity primary key,
      operation text not null,
      pulse_id text not null,
      created_at timestamptz not null
    );
    -- Only this test observer is a definer, so recording evidence grants no app privileges.
    create function public.observe_keepalive_fixture() returns trigger
    language plpgsql security definer set search_path = '' as $$
    begin
      if tg_op = 'INSERT' then
        insert into public.keepalive_fixture_events (operation, pulse_id, created_at)
        values (tg_op, new.id, new.created_at);
        return new;
      end if;
      insert into public.keepalive_fixture_events (operation, pulse_id, created_at)
      values (tg_op, old.id, old.created_at);
      return old;
    end;
    $$;
    revoke all on function public.observe_keepalive_fixture() from public;
    create trigger observe_keepalive_fixture after insert or delete
      on seiva_keepalive.pulse for each row
      execute function public.observe_keepalive_fixture();

    create function public.reject_keepalive_delete_fixture() returns trigger
    language plpgsql as $$ begin raise exception 'Injected cleanup failure'; end; $$;
    create function public.skip_keepalive_delete_fixture() returns trigger
    language plpgsql as $$ begin return null; end; $$;

    -- Business fixtures are independent of the technical maintenance schema.
    create table public.inquiries (id integer primary key, payload jsonb not null);
    create table public.proposals (
      id integer primary key, inquiry_id integer references public.inquiries(id),
      payload jsonb not null
    );
    insert into public.inquiries values
      (1, '{"name":"Fixture client","email":"fixture@example.invalid","status":"confirmed","guests":80}');
    insert into public.proposals values
      (1, 1, '{"total":12000,"items":[{"name":"Fixture menu","qty":80,"rate":150}]}');
  `);
});

beforeEach(async () => {
  await db.exec(`
    reset role;
    drop trigger if exists reject_keepalive_delete_fixture on seiva_keepalive.pulse;
    drop trigger if exists skip_keepalive_delete_fixture on seiva_keepalive.pulse;
    truncate seiva_keepalive.state, seiva_keepalive.pulse,
      public.keepalive_fixture_events restart identity;
    insert into seiva_keepalive.state (singleton) values (true);
    set role service_role;
  `);
});

afterAll(async () => {
  await db.close();
});

describe("app keepalive migration in PostgreSQL", () => {
  it("inserts and deletes the same pulse and commits database time plus one completed cycle", async () => {
    const before = (await query<{ time: Date }>("select clock_timestamp() as time"))[0].time;
    const result = await runKeepalive();
    const after = (await query<{ time: Date }>("select clock_timestamp() as time"))[0].time;
    const actual = await state();

    expect(result.status).toBe("executed");
    expect(actual.singleton).toBe(true);
    expect(Number(actual.completed_cycles)).toBe(1);
    expect(actual.last_success_at?.toISOString()).toBe(
      new Date(result.last_success_at).toISOString(),
    );
    expect(new Date(result.last_success_at).getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(new Date(result.last_success_at).getTime()).toBeLessThanOrEqual(after.getTime());
    expect(
      new Date(result.next_due_at).getTime() - new Date(result.last_success_at).getTime(),
    ).toBe(hours72);
    expect(await query("select * from seiva_keepalive.pulse")).toEqual([]);

    const events = await pulseEvents();
    expect(events.map(({ operation, pulse_id }) => ({ operation, pulse_id }))).toEqual([
      { operation: "INSERT", pulse_id: pulseId },
      { operation: "DELETE", pulse_id: pulseId },
    ]);
    expect(events[0].created_at).toEqual(events[1].created_at);
    expect(events[0].created_at).toEqual(actual.last_success_at);
  });

  it("skips a repeated call before 72 hours without changing state or writing another pulse", async () => {
    const first = await runKeepalive();
    const original = await state();
    const repeated = await runKeepalive();

    expect(repeated).toEqual({ ...first, status: "skipped" });
    expect(await state()).toEqual(original);
    expect(await query("select * from seiva_keepalive.pulse")).toEqual([]);
    expect(await pulseEvents()).toHaveLength(2);
  });

  it("runs again once the persisted success is older than 72 hours, reusing the pulse id", async () => {
    await runKeepalive();
    await db.exec("reset role");
    await db.exec(
      "update seiva_keepalive.state set last_success_at = clock_timestamp() - interval '72 hours 1 second'",
    );
    await useRole("service_role");

    expect((await runKeepalive()).status).toBe("executed");
    expect(Number((await state()).completed_cycles)).toBe(2);
    expect(await query("select * from seiva_keepalive.pulse")).toEqual([]);
    expect((await pulseEvents()).map((event) => event.pulse_id)).toEqual([
      pulseId,
      pulseId,
      pulseId,
      pulseId,
    ]);
  });

  it("still skips at 71 hours 59 minutes 59 seconds", async () => {
    // One engine request minimizes elapsed wall time around the exact boundary fixture.
    const results = await db.exec(`
      update seiva_keepalive.state
      set last_success_at = clock_timestamp() - interval '71 hours 59 minutes 59 seconds',
          completed_cycles = 4;
      select public.run_app_keepalive() as result;
    `);
    const result = (results[1].rows[0] as { result: KeepaliveResult }).result;

    expect(result.status).toBe("skipped");
    expect(Number((await state()).completed_cycles)).toBe(4);
    expect(await pulseEvents()).toEqual([]);
  });

  it.each(["anon", "authenticated"] as const)(
    "denies %s execution and all reads/writes of the maintenance schema",
    async (role) => {
      await useRole(role);
      for (const sql of [
        "select public.run_app_keepalive()",
        "select * from seiva_keepalive.state",
        "insert into seiva_keepalive.state (singleton) values (true)",
        "update seiva_keepalive.state set completed_cycles = 100",
        "delete from seiva_keepalive.state",
        "select * from seiva_keepalive.pulse",
        "insert into seiva_keepalive.pulse values ('seiva-keepalive', clock_timestamp())",
        "update seiva_keepalive.pulse set created_at = clock_timestamp()",
        "delete from seiva_keepalive.pulse",
      ]) {
        await expect(query(sql)).rejects.toMatchObject({ code: "42501" });
      }
    },
  );

  it("grants only the required service privileges and no maintenance privileges to browser roles", async () => {
    await db.exec("reset role");
    for (const role of ["anon", "authenticated", "service_role"]) {
      const schema = (
        await query<{ usage: boolean; create: boolean; execute: boolean }>(
          `select has_schema_privilege($1, 'seiva_keepalive', 'USAGE') as usage,
            has_schema_privilege($1, 'seiva_keepalive', 'CREATE') as create,
            has_function_privilege($1, 'public.run_app_keepalive()', 'EXECUTE') as execute`,
          [role],
        )
      )[0];
      expect(schema).toEqual({
        usage: role === "service_role",
        create: false,
        execute: role === "service_role",
      });

      for (const table of ["state", "pulse"]) {
        const grants = await query<{ privilege: string; allowed: boolean }>(
          `select privilege, has_table_privilege($1, $2, privilege) as allowed
            from unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) as privilege`,
          [role, `seiva_keepalive.${table}`],
        );
        const expected =
          role === "service_role"
            ? table === "state"
              ? ["SELECT", "UPDATE"]
              : ["SELECT", "INSERT", "DELETE"]
            : [];
        expect(grants.filter((grant) => grant.allowed).map((grant) => grant.privilege)).toEqual(
          expected,
        );
      }
    }
  });

  it("enables private-table RLS and keeps the RPC invoker with an empty search path and bounded row lock", async () => {
    await db.exec("reset role");
    expect(
      await query(`select relname, relrowsecurity from pg_class
        where relnamespace = 'seiva_keepalive'::regnamespace and relkind = 'r' order by relname`),
    ).toEqual([
      { relname: "pulse", relrowsecurity: true },
      { relname: "state", relrowsecurity: true },
    ]);
    const fn = (
      await query<{ prosecdef: boolean; proconfig: string[]; prosrc: string }>(
        "select prosecdef, proconfig, prosrc from pg_proc where oid = 'public.run_app_keepalive()'::regprocedure",
      )
    )[0];
    expect(fn.prosecdef).toBe(false);
    expect(fn.proconfig).toContain('search_path=""');
    expect(fn.proconfig).toContain("lock_timeout=3s");
    const body = fn.prosrc
      .replace(/--[^\n]*/g, "")
      .replace(/\s+/g, " ")
      .toLowerCase();
    expect(body).toContain("from seiva_keepalive.state where singleton = true for update");
    expect(body.indexOf("for update")).toBeLessThan(body.indexOf("v_now := clock_timestamp()"));
  });

  it("rolls back pulse and success on cleanup failure, then succeeds when cleanup recovers", async () => {
    await db.exec(`reset role;
      create trigger reject_keepalive_delete_fixture before delete on seiva_keepalive.pulse
        for each row execute function public.reject_keepalive_delete_fixture();
      set role service_role;`);

    await expect(runKeepalive()).rejects.toMatchObject({
      code: "P0001",
      message: "Injected cleanup failure",
    });
    expect(await state()).toMatchObject({ last_success_at: null, completed_cycles: 0 });
    expect(await query("select * from seiva_keepalive.pulse")).toEqual([]);
    expect(await pulseEvents()).toEqual([]);

    await db.exec("drop trigger reject_keepalive_delete_fixture on seiva_keepalive.pulse");
    await useRole("service_role");
    expect((await runKeepalive()).status).toBe("executed");
    expect(Number((await state()).completed_cycles)).toBe(1);
    expect(await pulseEvents()).toHaveLength(2);
  });

  it("rejects silently suppressed cleanup and records no successful cycle or residual pulse", async () => {
    await db.exec(`reset role;
      create trigger skip_keepalive_delete_fixture before delete on seiva_keepalive.pulse
        for each row execute function public.skip_keepalive_delete_fixture();
      set role service_role;`);

    await expect(runKeepalive()).rejects.toMatchObject({
      code: "55000",
      message: "Keepalive pulse cleanup failed",
    });
    expect(await state()).toMatchObject({ last_success_at: null, completed_cycles: 0 });
    expect(await query("select * from seiva_keepalive.pulse")).toEqual([]);
    expect(await pulseEvents()).toEqual([]);
  });

  it("fails explicitly if the singleton state is absent instead of writing a pulse", async () => {
    await db.exec("reset role; delete from seiva_keepalive.state; set role service_role");

    await expect(runKeepalive()).rejects.toMatchObject({
      code: "55000",
      message: "Keepalive control row missing",
    });
    expect(await query("select * from seiva_keepalive.state")).toEqual([]);
    expect(await query("select * from seiva_keepalive.pulse")).toEqual([]);
    expect(await pulseEvents()).toEqual([]);
  });

  it("rolls back success metadata and both observed writes with the surrounding transaction", async () => {
    await db.exec("begin");
    try {
      expect((await runKeepalive()).status).toBe("executed");
      expect(Number((await state()).completed_cycles)).toBe(1);
    } finally {
      await db.exec("rollback");
    }
    expect(await state()).toMatchObject({ last_success_at: null, completed_cycles: 0 });
    expect(await query("select * from seiva_keepalive.pulse")).toEqual([]);
    expect(await pulseEvents()).toEqual([]);
  });

  it("preserves inquiry and proposal fixtures through successful, skipped and failed runs", async () => {
    await db.exec("reset role");
    const inquiries = await query("select * from public.inquiries order by id");
    const proposals = await query("select * from public.proposals order by id");
    await useRole("service_role");
    await runKeepalive();
    await runKeepalive();
    await db.exec(`reset role;
      update seiva_keepalive.state set last_success_at = clock_timestamp() - interval '73 hours';
      create trigger reject_keepalive_delete_fixture before delete on seiva_keepalive.pulse
        for each row execute function public.reject_keepalive_delete_fixture();
      set role service_role;`);
    await expect(runKeepalive()).rejects.toMatchObject({ code: "P0001" });
    await db.exec("reset role");

    expect(await query("select * from public.inquiries order by id")).toEqual(inquiries);
    expect(await query("select * from public.proposals order by id")).toEqual(proposals);
  });

  it("executes once for burst requests serialized by PGlite's single connection", async () => {
    const results = await Promise.all(Array.from({ length: 12 }, () => runKeepalive()));

    expect(results.filter((result) => result.status === "executed")).toHaveLength(1);
    expect(results.filter((result) => result.status === "skipped")).toHaveLength(11);
    expect(Number((await state()).completed_cycles)).toBe(1);
    expect(await query("select * from seiva_keepalive.pulse")).toEqual([]);
    expect(await pulseEvents()).toHaveLength(2);
  });
});
