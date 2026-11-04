-- Hushsong leaderboards: run this once in Supabase (SQL Editor → New query → paste → Run).
-- Safe to run again: it replaces the functions and keeps existing scores.
--
-- How it works: the table is closed to the public. The game only talks to it through the
-- two functions below, which run with the owner's rights:
--   hs_submit  a player's name, band and best results (each player proves who they are with a secret only their save holds)
--   hs_board   the top 50 of one board, plus the asking player's own place
--   hs_pvp_match   Battle of the Bands: sends the locked band's copy, settles the last match, returns a rival band and a match token
--   hs_pvp_result  Battle of the Bands: the result of the open match (fights run on the phone; only the attacker's Applause moves)
-- Boards: 'floors' (Adventure floors cleared), 'encore' (best Encore wave, all time), 'encore_week' (this week, Monday to Monday UTC),
--         'bands' (Battle of the Bands Applause).

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
-- Battle of the Bands (added later; safe to run on a table that has them)
alter table public.hs_players add column if not exists band_snap   jsonb;                              -- the locked band: [{ f: form, r: stars, g: [{ t, r, l }] }]
alter table public.hs_players add column if not exists band_level  int not null default 1;            -- the player's level when the band copy was sent
alter table public.hs_players add column if not exists band_at     timestamptz;                        -- when it was sent: only bands sent in the last 30 days are matched
alter table public.hs_players add column if not exists applause    int not null default 1000;
alter table public.hs_players add column if not exists applause_at timestamptz not null default now();
alter table public.hs_players add column if not exists pvp_games   int not null default 0;
alter table public.hs_players add column if not exists pvp_wins    int not null default 0;
alter table public.hs_players add column if not exists pvp_day     date;                               -- a loose daily cap on matches (the game itself allows 5 a day)
alter table public.hs_players add column if not exists pvp_count   int not null default 0;
alter table public.hs_players add column if not exists pvp_token   uuid;                               -- the open match
alter table public.hs_players add column if not exists pvp_rival_applause int;

alter table public.hs_players enable row level security;   -- no policies: nobody reads or writes the table directly
revoke all on public.hs_players from anon, authenticated;

create index if not exists hs_players_floors on public.hs_players (floors desc, floors_at);
create index if not exists hs_players_encore on public.hs_players (encore desc, encore_at);
create index if not exists hs_players_week   on public.hs_players (encore_week, encore_week_best desc, encore_week_at);
create index if not exists hs_players_bands  on public.hs_players (applause desc, applause_at) where pvp_games > 0;
create index if not exists hs_players_stage  on public.hs_players (band_at) where band_snap is not null;

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

-- p_board: 'floors' | 'encore' | 'encore_week' | 'bands'. Returns { top: [{ name, band, level, v, me }], me: { rank, v } or null, week }.
create or replace function public.hs_board(p_board text, p_id uuid default null)
returns jsonb language plpgsql security definer stable set search_path = public as $$
declare w int := hs_week(); res jsonb; mine jsonb;
begin
  if p_board not in ('floors', 'encore', 'encore_week', 'bands') then raise exception 'bad board' using errcode = '22023'; end if;
  with ranked as (
    select id, name, level,
      case when p_board = 'bands' then coalesce((select jsonb_agg(x -> 'f') from jsonb_array_elements(coalesce(band_snap, '[]'::jsonb)) x), '[]'::jsonb) else band end as band,
      case p_board when 'floors' then floors when 'encore' then encore when 'bands' then applause else encore_week_best end as v,
      case p_board when 'floors' then floors_at when 'encore' then encore_at when 'bands' then applause_at else encore_week_at end as at
    from public.hs_players
    where case p_board when 'floors' then floors > 0 when 'encore' then encore > 0 when 'bands' then pvp_games > 0 else encore_week = w and encore_week_best > 0 end
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

-- ===== Battle of the Bands =====

-- a band copy: up to three pets, each { f: form, r: stars 0-10, g: up to two pieces { t: type, r: rarity, l: legendary or null } }
create or replace function public.hs_clean_copy(p jsonb) returns jsonb language plpgsql immutable as $$
declare res jsonb := '[]'::jsonb; c jsonb; g jsonb; gear jsonb; n int := 0;
begin
  if jsonb_typeof(p) <> 'array' then return res; end if;
  for c in select * from jsonb_array_elements(p) loop
    exit when n >= 3;
    continue when jsonb_typeof(c) <> 'object' or coalesce(c ->> 'f', '') !~ '^[a-z0-9_]{1,24}$';
    gear := '[]'::jsonb;
    if jsonb_typeof(c -> 'g') = 'array' then
      for g in select * from jsonb_array_elements(c -> 'g') limit 2 loop
        continue when jsonb_typeof(g) <> 'object' or coalesce(g ->> 't', '') !~ '^[a-z0-9_]{1,24}$' or coalesce(g ->> 'r', '') !~ '^[a-z]{1,2}$';
        gear := gear || jsonb_build_array(jsonb_build_object('t', g ->> 't', 'r', g ->> 'r',
          'l', case when coalesce(g ->> 'l', '') ~ '^[a-z0-9_]{1,24}$' then to_jsonb(g ->> 'l') else 'null'::jsonb end));
      end loop;
    end if;
    res := res || jsonb_build_array(jsonb_build_object('f', c ->> 'f',
      'r', least(greatest(coalesce(case when jsonb_typeof(c -> 'r') = 'number' then (c ->> 'r')::numeric end, 0), 0), 10)::int, 'g', gear));
    n := n + 1;
  end loop;
  return res;
end $$;

-- settle the open match of a locked player row: the attacker's Applause moves, the defender's never does
create or replace function public.hs_pvp_settle(p_id uuid, p_win boolean) returns int language plpgsql security definer set search_path = public as $$
declare r public.hs_players; d int;
begin
  select * into r from public.hs_players where id = p_id;
  if r.pvp_token is null then return r.applause; end if;
  d := round(32 * ((case when p_win then 1 else 0 end) - 1 / (1 + power(10, (coalesce(r.pvp_rival_applause, r.applause) - r.applause) / 400.0))));
  update public.hs_players set applause = greatest(0, applause + d), applause_at = now(), pvp_games = pvp_games + 1,
    pvp_wins = pvp_wins + (case when p_win then 1 else 0 end), pvp_token = null, pvp_rival_applause = null, updated_at = now()
  where id = p_id;
  return greatest(0, r.applause + d);
end $$;

-- Start a match. The band copy and level go up; the last match is settled (with the result sent, or as a loss if it never came);
-- then one band comes back, picked at random from the five closest by level and Applause among players who played in the last 30 days.
-- Returns { applause, token, rival: { name, band, level, applause } } or { applause, rival: null } when nobody is on stage.
create or replace function public.hs_pvp_match(p_id uuid, p_secret text, p_band jsonb, p_level int, p_last uuid default null, p_last_win boolean default null)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare
  h text := encode(digest(coalesce(p_secret, ''), 'sha256'), 'hex');
  r public.hs_players; o public.hs_players; a int; t uuid;
  L int := least(greatest(coalesce(p_level, 1), 1), 100000);
  v_band jsonb := hs_clean_copy(p_band);
begin
  select * into r from public.hs_players where id = p_id for update;
  if not found or r.secret_hash <> h then raise exception 'not yours' using errcode = '42501'; end if;
  if jsonb_array_length(v_band) < 1 then raise exception 'bad band' using errcode = '22023'; end if;
  a := r.applause;
  if r.pvp_token is not null then a := hs_pvp_settle(p_id, coalesce(r.pvp_token = p_last and p_last_win, false)); end if;
  if r.pvp_day is distinct from current_date then update public.hs_players set pvp_day = current_date, pvp_count = 0 where id = p_id; r.pvp_count := 0; end if;
  if r.pvp_count >= 12 then raise exception 'match limit' using errcode = 'P0001'; end if;
  update public.hs_players set band_snap = v_band, band_level = L, band_at = now(), updated_at = now() where id = p_id;
  select * into o from (
    select * from public.hs_players
    where id <> p_id and band_snap is not null and band_at > now() - interval '30 days'
    order by abs(band_level - L)::float / greatest(L, 1) * 400 + abs(applause - a)
    limit 5) c
  order by random() limit 1;
  if not found then return jsonb_build_object('applause', a, 'rival', null); end if;
  t := gen_random_uuid();
  update public.hs_players set pvp_token = t, pvp_rival_applause = o.applause, pvp_count = pvp_count + 1 where id = p_id;
  return jsonb_build_object('applause', a, 'token', t,
    'rival', jsonb_build_object('name', o.name, 'band', o.band_snap, 'level', o.band_level, 'applause', o.applause));
end $$;

-- The result of the open match, once. A token that is no longer open changes nothing.
create or replace function public.hs_pvp_result(p_id uuid, p_secret text, p_token uuid, p_win boolean)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare h text := encode(digest(coalesce(p_secret, ''), 'sha256'), 'hex'); r public.hs_players;
begin
  select * into r from public.hs_players where id = p_id for update;
  if not found or r.secret_hash <> h then raise exception 'not yours' using errcode = '42501'; end if;
  if r.pvp_token is null or r.pvp_token <> p_token then return jsonb_build_object('applause', r.applause); end if;
  return jsonb_build_object('applause', hs_pvp_settle(p_id, coalesce(p_win, false)));
end $$;

revoke all on function public.hs_clean_copy(jsonb) from public;
revoke all on function public.hs_pvp_settle(uuid, boolean) from public;
revoke all on function public.hs_pvp_match(uuid, text, jsonb, int, uuid, boolean) from public;
revoke all on function public.hs_pvp_result(uuid, text, uuid, boolean) from public;
grant execute on function public.hs_pvp_match(uuid, text, jsonb, int, uuid, boolean) to anon, authenticated;
grant execute on function public.hs_pvp_result(uuid, text, uuid, boolean) to anon, authenticated;

revoke all on function public.hs_submit(uuid, text, text, jsonb, int, int, int, int) from public;
revoke all on function public.hs_board(text, uuid) from public;
grant execute on function public.hs_submit(uuid, text, text, jsonb, int, int, int, int) to anon, authenticated;
grant execute on function public.hs_board(text, uuid) to anon, authenticated;
