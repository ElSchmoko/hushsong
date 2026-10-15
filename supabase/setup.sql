-- Hushsong leaderboards: run this once in Supabase (SQL Editor → New query → paste → Run).
-- Safe to run again: it replaces the functions and keeps existing scores.
--
-- How it works: the table is closed to the public. The game only talks to it through the
-- two functions below, which run with the owner's rights:
--   hs_submit  a player's name, band and best results (each player proves who they are with a secret only their save holds)
--   hs_board   the top 50 of one board, plus the asking player's own place
-- Boards: 'floors' (Adventure floors cleared), 'encore' (best Encore wave, all time), 'encore_week' (this week, Monday to Monday UTC).

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.hs_players (
  id               uuid primary key,
  secret_hash      text not null,
  name             text not null,
  band             jsonb not null default '[]'::jsonb,   -- the forms of the band, for the little sprites on each row
  level            int  not null default 1,
  floors           int  not null default 0,
  floors_at        timestamptz not null default now(),   -- when the best was reached: earlier wins a tie
  encore           int  not null default 0,
  encore_at        timestamptz not null default now(),
  encore_week      int  not null default 0,
  encore_week_best int  not null default 0,
  encore_week_at   timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
alter table public.hs_players enable row level security;   -- no policies: nobody reads or writes the table directly
revoke all on public.hs_players from anon, authenticated;

create index if not exists hs_players_floors on public.hs_players (floors desc, floors_at);
create index if not exists hs_players_encore on public.hs_players (encore desc, encore_at);
create index if not exists hs_players_week   on public.hs_players (encore_week, encore_week_best desc, encore_week_at);

-- the week number, Monday to Monday in UTC (day 0, 1 Jan 1970, was a Thursday)
create or replace function public.hs_week() returns int language sql stable as $$
  select floor((floor(extract(epoch from now()) / 86400) + 3) / 7)::int
$$;

-- a name: trimmed, inner spaces squeezed, 1 to 16 characters
create or replace function public.hs_clean_name(p text) returns text language plpgsql immutable as $$
declare n text := regexp_replace(btrim(coalesce(p, '')), '\s+', ' ', 'g');
begin
  if char_length(n) < 1 or char_length(n) > 16 then raise exception 'bad name' using errcode = '22023'; end if;
  return n;
end $$;

-- the band: up to three short form ids
create or replace function public.hs_clean_band(p jsonb) returns jsonb language sql immutable as $$
  select coalesce((select jsonb_agg(x) from (select x from jsonb_array_elements(case when jsonb_typeof(p) = 'array' then p else '[]'::jsonb end) x
    where jsonb_typeof(x) = 'string' and x #>> '{}' ~ '^[a-z0-9_]{1,24}$' limit 3) s), '[]'::jsonb)
$$;

create or replace function public.hs_submit(p_id uuid, p_secret text, p_name text, p_band jsonb, p_level int, p_floors int, p_encore int, p_encore_week int)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare
  h text := encode(digest(coalesce(p_secret, ''), 'sha256'), 'hex');
  w int := hs_week();
  r public.hs_players;
  f int := least(greatest(coalesce(p_floors, 0), 0), 100000);
  e int := least(greatest(coalesce(p_encore, 0), 0), 10000);
  ew int := least(greatest(coalesce(p_encore_week, 0), 0), 10000);
begin
  if char_length(coalesce(p_secret, '')) < 24 then raise exception 'bad secret' using errcode = '22023'; end if;
  select * into r from public.hs_players where id = p_id for update;
  if not found then
    insert into public.hs_players (id, secret_hash, name, band, level, floors, encore, encore_week, encore_week_best)
    values (p_id, h, hs_clean_name(p_name), hs_clean_band(p_band), least(greatest(coalesce(p_level, 1), 1), 1000), f, e, w, ew);
    return jsonb_build_object('ok', true);
  end if;
  if r.secret_hash <> h then raise exception 'not yours' using errcode = '42501'; end if;
  update public.hs_players set
    name = hs_clean_name(p_name),
    band = hs_clean_band(p_band),
    level = least(greatest(coalesce(p_level, 1), 1), 1000),
    floors = greatest(r.floors, f),
    floors_at = case when f > r.floors then now() else r.floors_at end,
    encore = greatest(r.encore, e),
    encore_at = case when e > r.encore then now() else r.encore_at end,
    encore_week = w,
    encore_week_best = case when r.encore_week = w then greatest(r.encore_week_best, ew) else ew end,
    encore_week_at = case when r.encore_week <> w or ew > r.encore_week_best then now() else r.encore_week_at end,
    updated_at = now()
  where id = p_id;
  return jsonb_build_object('ok', true);
end $$;

-- p_board: 'floors' | 'encore' | 'encore_week'. Returns { top: [{ name, band, level, v, me }], me: { rank, v } or null, week }.
create or replace function public.hs_board(p_board text, p_id uuid default null)
returns jsonb language plpgsql security definer stable set search_path = public as $$
declare w int := hs_week(); res jsonb; mine jsonb;
begin
  if p_board not in ('floors', 'encore', 'encore_week') then raise exception 'bad board' using errcode = '22023'; end if;
  with ranked as (
    select id, name, band, level,
      case p_board when 'floors' then floors when 'encore' then encore else encore_week_best end as v,
      case p_board when 'floors' then floors_at when 'encore' then encore_at else encore_week_at end as at
    from public.hs_players
    where case p_board when 'floors' then floors > 0 when 'encore' then encore > 0 else encore_week = w and encore_week_best > 0 end
  ), numbered as (
    select *, rank() over (order by v desc, at asc) as rk from ranked
  )
  select
    (select coalesce(jsonb_agg(jsonb_build_object('rank', rk, 'name', name, 'band', band, 'level', level, 'v', v, 'me', coalesce(id = p_id, false)) order by rk), '[]'::jsonb)
       from (select * from numbered order by rk limit 50) t),
    (select jsonb_build_object('rank', rk, 'v', v) from numbered where id = p_id)
  into res, mine;
  return jsonb_build_object('top', res, 'me', mine, 'week', w);
end $$;

revoke all on function public.hs_submit(uuid, text, text, jsonb, int, int, int, int) from public;
revoke all on function public.hs_board(text, uuid) from public;
grant execute on function public.hs_submit(uuid, text, text, jsonb, int, int, int, int) to anon, authenticated;
grant execute on function public.hs_board(text, uuid) to anon, authenticated;
