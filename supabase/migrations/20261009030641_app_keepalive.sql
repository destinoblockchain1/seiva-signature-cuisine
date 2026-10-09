-- Server-only maintenance. No leads, proposals, users, or notifications are touched.
create schema seiva_keepalive;
revoke all on schema seiva_keepalive from public, anon, authenticated;
grant usage on schema seiva_keepalive to service_role;

create table seiva_keepalive.state (
  singleton boolean primary key default true check (singleton),
  last_success_at timestamptz check (last_success_at is null or isfinite(last_success_at)),
  completed_cycles bigint not null default 0 check (completed_cycles >= 0)
);

create table seiva_keepalive.pulse (
  id text primary key check (id = 'seiva-keepalive'),
  created_at timestamptz not null check (isfinite(created_at))
);

alter table seiva_keepalive.state enable row level security;
alter table seiva_keepalive.pulse enable row level security;
revoke all on seiva_keepalive.state, seiva_keepalive.pulse from public, anon, authenticated;
grant select, update on seiva_keepalive.state to service_role;
grant select, insert, delete on seiva_keepalive.pulse to service_role;

insert into seiva_keepalive.state (singleton) values (true);

create function public.run_app_keepalive()
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
set lock_timeout = '3s'
as $$
declare
  v_last_success timestamptz;
  v_now timestamptz;
  v_deleted integer;
begin
  -- The singleton lock serializes requests even across separate app instances.
  select last_success_at into v_last_success
  from seiva_keepalive.state where singleton = true for update;

  if not found then
    raise exception 'Keepalive control row missing' using errcode = '55000';
  end if;

  -- Read the database clock after acquiring the lock, not at transaction start.
  v_now := clock_timestamp();
  if v_last_success is not null and v_now < v_last_success + interval '72 hours' then
    return jsonb_build_object(
      'status', 'skipped',
      'last_success_at', v_last_success,
      'next_due_at', v_last_success + interval '72 hours'
    );
  end if;

  insert into seiva_keepalive.pulse (id, created_at)
  values ('seiva-keepalive', v_now);

  delete from seiva_keepalive.pulse where id = 'seiva-keepalive';
  get diagnostics v_deleted = row_count;
  if v_deleted <> 1 then
    raise exception 'Keepalive pulse cleanup failed' using errcode = '55000';
  end if;

  -- Insert, delete, and success metadata commit together or all roll back.
  update seiva_keepalive.state
  set last_success_at = v_now, completed_cycles = completed_cycles + 1
  where singleton = true;

  return jsonb_build_object(
    'status', 'executed',
    'last_success_at', v_now,
    'next_due_at', v_now + interval '72 hours'
  );
end;
$$;

revoke all on function public.run_app_keepalive() from public, anon, authenticated;
grant execute on function public.run_app_keepalive() to service_role;

comment on function public.run_app_keepalive() is
  'Server-only atomic insert/delete of a fixed maintenance pulse, at least 72 hours apart.';
