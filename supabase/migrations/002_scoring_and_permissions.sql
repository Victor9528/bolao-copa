-- Hardening for predictions and scoring.
-- Run after 001_initial_schema.sql.

create or replace function public.prediction_deadline()
returns timestamptz
language sql
stable
as $$
  select timestamptz '2026-06-13 15:00:00-03';
$$;

create or replace function public.predictions_are_open()
returns boolean
language sql
stable
as $$
  select now() < public.prediction_deadline();
$$;

-- Initial scoring rule:
-- 4 points for exact score, 2 points for correct winner/draw, 0 otherwise.
-- Matches with counts_for_pool = false always score 0.
create or replace function public.calculate_prediction_points(
  predicted_home_score integer,
  predicted_away_score integer,
  actual_home_score integer,
  actual_away_score integer,
  counts_for_pool boolean
)
returns integer
language sql
immutable
as $$
  select case
    when not counts_for_pool then 0
    when actual_home_score is null or actual_away_score is null then 0
    when predicted_home_score = actual_home_score and predicted_away_score = actual_away_score then 4
    when sign(predicted_home_score - predicted_away_score) = sign(actual_home_score - actual_away_score) then 2
    else 0
  end;
$$;

insert into public.profiles (id, display_name)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1))
from auth.users u
where not exists (
  select 1
  from public.profiles p
  where p.id = u.id
);

create or replace function public.set_prediction_points()
returns trigger
language plpgsql
as $$
declare
  match_record public.matches%rowtype;
begin
  select * into match_record
  from public.matches
  where id = new.match_id;

  if not found then
    raise exception 'Match % not found', new.match_id;
  end if;

  new.points = public.calculate_prediction_points(
    new.home_score,
    new.away_score,
    match_record.home_score,
    match_record.away_score,
    match_record.counts_for_pool
  );

  return new;
end;
$$;

drop trigger if exists predictions_set_points on public.predictions;
create trigger predictions_set_points
before insert or update of match_id, home_score, away_score on public.predictions
for each row execute function public.set_prediction_points();

create or replace function public.recalculate_match_predictions(target_match_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.predictions p
  set points = public.calculate_prediction_points(
      p.home_score,
      p.away_score,
      m.home_score,
      m.away_score,
      m.counts_for_pool
    ),
    updated_at = now()
  from public.matches m
  where m.id = target_match_id
    and p.match_id = m.id;
end;
$$;

create or replace function public.recalculate_predictions_after_match_update()
returns trigger
language plpgsql
as $$
begin
  perform public.recalculate_match_predictions(new.id);
  return new;
end;
$$;

drop trigger if exists matches_recalculate_predictions on public.matches;
create trigger matches_recalculate_predictions
after update of home_score, away_score, status, counts_for_pool on public.matches
for each row execute function public.recalculate_predictions_after_match_update();

drop policy if exists "Users can create own predictions" on public.predictions;
create policy "Users can create own predictions"
on public.predictions for insert
to authenticated
with check (auth.uid() = user_id and public.predictions_are_open());

drop policy if exists "Users can update own predictions before deadline" on public.predictions;
create policy "Users can update own predictions before deadline"
on public.predictions for update
to authenticated
using (auth.uid() = user_id and public.predictions_are_open())
with check (auth.uid() = user_id and public.predictions_are_open());

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.matches from anon, authenticated;
revoke all on table public.predictions from anon, authenticated;
revoke all on table public.ranking from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

grant select on public.matches to authenticated;

grant select (id, user_id, match_id, home_score, away_score, points, created_at, updated_at)
on public.predictions to authenticated;
grant insert (user_id, match_id, home_score, away_score)
on public.predictions to authenticated;
grant update (home_score, away_score)
on public.predictions to authenticated;
grant usage, select on sequence public.predictions_id_seq to authenticated;

drop view if exists public.ranking;
create view public.ranking as
select
  row_number() over (order by coalesce(sum(pr.points), 0) desc, p.display_name asc)::integer as rank_position,
  p.id as user_id,
  p.display_name,
  coalesce(sum(pr.points), 0)::integer as total_points,
  count(pr.id)::integer as predictions_count
from public.profiles p
left join public.predictions pr on pr.user_id = p.id
group by p.id, p.display_name;

grant select on public.ranking to authenticated;
