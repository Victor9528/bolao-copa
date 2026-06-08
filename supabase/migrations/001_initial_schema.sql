-- Initial schema for Bolao da Copa EloGroup.
-- Run this in Supabase SQL Editor after enabling Supabase Auth.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.matches (
  id bigserial primary key,
  external_id text unique,
  home_team text not null,
  away_team text not null,
  home_score integer,
  away_score integer,
  starts_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'finished')),
  counts_for_pool boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (home_team <> away_team),
  check (home_score is null or home_score >= 0),
  check (away_score is null or away_score >= 0)
);

create table if not exists public.predictions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id bigint not null references public.matches(id) on delete cascade,
  home_score integer not null check (home_score >= 0),
  away_score integer not null check (away_score >= 0),
  points integer not null default 0 check (points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create index if not exists matches_starts_at_idx on public.matches(starts_at);
create index if not exists predictions_user_id_idx on public.predictions(user_id);
create index if not exists predictions_match_id_idx on public.predictions(match_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists matches_set_updated_at on public.matches;
create trigger matches_set_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

drop trigger if exists predictions_set_updated_at on public.predictions;
create trigger predictions_set_updated_at
before update on public.predictions
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;

drop policy if exists "Profiles are readable by authenticated users" on public.profiles;
create policy "Profiles are readable by authenticated users"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Matches are readable by authenticated users" on public.matches;
create policy "Matches are readable by authenticated users"
on public.matches for select
to authenticated
using (true);

drop policy if exists "Users can read own predictions" on public.predictions;
create policy "Users can read own predictions"
on public.predictions for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own predictions" on public.predictions;
create policy "Users can create own predictions"
on public.predictions for insert
to authenticated
with check (auth.uid() = user_id and now() < timestamptz '2026-06-13 15:00:00-03');

drop policy if exists "Users can update own predictions before deadline" on public.predictions;
create policy "Users can update own predictions before deadline"
on public.predictions for update
to authenticated
using (auth.uid() = user_id and now() < timestamptz '2026-06-13 15:00:00-03')
with check (auth.uid() = user_id and now() < timestamptz '2026-06-13 15:00:00-03');

create or replace view public.ranking as
select
  p.id as user_id,
  p.display_name,
  coalesce(sum(pr.points), 0)::integer as total_points,
  count(pr.id)::integer as predictions_count
from public.profiles p
left join public.predictions pr on pr.user_id = p.id
group by p.id, p.display_name;

grant select on public.ranking to authenticated;
