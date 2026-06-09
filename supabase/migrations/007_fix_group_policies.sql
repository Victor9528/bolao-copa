-- Fix infinite recursion in group_members policies
-- Run this after 006_groups.sql if you got recursion errors

-- Drop recursive policies first
drop policy if exists "Members can view members of their groups" on public.group_members;
drop policy if exists "Members can view groups they belong to" on public.groups;
drop policy if exists "Owner can manage their groups" on public.groups;
drop policy if exists "Authenticated users can join groups" on public.group_members;
drop policy if exists "Users can remove themselves" on public.group_members;
drop policy if exists "Users can manage their own default predictions" on public.default_predictions;

-- Helper function to check group membership (bypasses RLS to avoid recursion)

create or replace function public.is_group_member(group_id bigint, user_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.group_members
    where group_members.group_id = is_group_member.group_id
      and group_members.user_id = is_group_member.user_id
  );
$$;

-- Recreate policies without recursion

create policy "Owner can manage their groups"
  on public.groups for all
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Members can view groups they belong to"
  on public.groups for select
  to authenticated
  using (
    public.is_group_member(id, auth.uid())
    or auth.uid() = owner_id
  );

create policy "Members can view members of their groups"
  on public.group_members for select
  to authenticated
  using (
    public.is_group_member(group_id, auth.uid())
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

create policy "Users can manage their own default predictions"
  on public.default_predictions for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant execute on function public.is_group_member to authenticated;
