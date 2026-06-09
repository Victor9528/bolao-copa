-- Groups for the bolao

create table public.groups (
  id bigint generated always as identity primary key,
  name text not null,
  code text not null unique,
  owner_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.group_members (
  id bigint generated always as identity primary key,
  group_id bigint not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  joined_at timestamptz not null default now(),
  unique(group_id, user_id)
);

-- Default predictions template (user's saved defaults to pre-fill)

create table public.default_predictions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id),
  match_id bigint not null references public.matches(id),
  home_score integer not null,
  away_score integer not null,
  unique(user_id, match_id)
);

-- Per-group ranking function

create or replace function public.group_ranking(target_group_id bigint)
returns table (
  rank_position integer,
  user_id uuid,
  display_name text,
  total_points integer,
  predictions_count integer
)
language sql
stable
as $$
  select
    row_number() over (order by coalesce(sum(pr.points), 0) desc, p.display_name asc)::integer,
    p.id,
    p.display_name,
    coalesce(sum(pr.points), 0)::integer,
    count(pr.id)::integer
  from public.profiles p
  left join public.predictions pr on pr.user_id = p.id
  where p.id in (select user_id from public.group_members where group_id = target_group_id)
  group by p.id, p.display_name;
$$;

-- RLS

alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.default_predictions enable row level security;

-- Groups policies

create policy "Owner can manage their groups"
  on public.groups for all
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Members can view groups they belong to"
  on public.groups for select
  to authenticated
  using (
    id in (select group_id from public.group_members where user_id = auth.uid())
    or auth.uid() = owner_id
  );

-- Group members policies

create policy "Members can view members of their groups"
  on public.group_members for select
  to authenticated
  using (
    group_id in (select group_id from public.group_members where user_id = auth.uid())
    or group_id in (select id from public.groups where owner_id = auth.uid())
  );

create policy "Authenticated users can join groups"
  on public.group_members for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can remove themselves"
  on public.group_members for delete
  to authenticated
  using (auth.uid() = user_id);

-- Default predictions policies

create policy "Users can manage their own default predictions"
  on public.default_predictions for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Grants

grant select, insert, update, delete on public.groups to authenticated;
grant select, insert, delete on public.group_members to authenticated;
grant select, insert, update, delete on public.default_predictions to authenticated;
grant execute on function public.group_ranking to authenticated;
