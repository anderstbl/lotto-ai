create table public.simulator_highscores (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique,
  player_name text not null check (char_length(player_name) between 2 and 24 and player_name ~ '^[[:alnum:] ._-]+$'),
  draw_id uuid not null references public.draws(id),
  row_numbers integer[] not null,
  attempts integer not null check (attempts between 1 and 1000000000),
  matches integer not null check (matches between 1 and 7),
  points integer generated always as (matches * 10000 + floor(9999::double precision / sqrt(attempts::double precision))::integer) stored,
  created_at timestamptz not null default now()
);
alter table public.simulator_highscores enable row level security;
revoke all on public.simulator_highscores from anon, authenticated;
grant select on public.simulator_highscores to anon, authenticated;
grant insert (submission_id, player_name, draw_id, row_numbers, attempts) on public.simulator_highscores to anon, authenticated;
create policy simulator_highscores_read on public.simulator_highscores for select to anon, authenticated using (true);
create policy simulator_highscores_submit on public.simulator_highscores for insert to anon, authenticated
  with check (matches between 1 and 7 and attempts between 1 and 1000000000 and char_length(player_name) between 2 and 24);

create function public.validate_simulator_highscore() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare winning integer[];
begin
  new.player_name := btrim(regexp_replace(new.player_name, '[[:space:]]+', ' ', 'g'));
  if array_ndims(new.row_numbers) is distinct from 1 or cardinality(new.row_numbers) <> 7
    or exists (select 1 from unnest(new.row_numbers) n where n is null or n < 1 or n > 36)
    or (select count(distinct n) from unnest(new.row_numbers) n) <> 7 then
    raise exception 'Invalid Lotto row' using errcode = '23514';
  end if;
  select d.numbers into winning from public.draws d where d.id = new.draw_id and d.draw_date <= (now() at time zone 'Europe/Copenhagen')::date;
  if winning is null then raise exception 'Unknown completed draw' using errcode = '23514'; end if;
  select count(*)::integer into new.matches from unnest(new.row_numbers) n where n = any(winning);
  return new;
end;
$$;
revoke all on function public.validate_simulator_highscore() from public, anon, authenticated;
create trigger validate_simulator_highscore before insert on public.simulator_highscores
for each row execute function public.validate_simulator_highscore();
create index simulator_highscores_ranking on public.simulator_highscores (points desc, attempts asc, created_at asc, id asc);
create index simulator_highscores_draw on public.simulator_highscores (draw_id);
