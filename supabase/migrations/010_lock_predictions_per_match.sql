-- Lock predictions per match start/status, not only by the global deadline.

create or replace function public.predictions_are_open_for_match(target_match_id bigint)
returns boolean
language sql
stable
as $$
  select public.predictions_are_open()
    and exists (
      select 1
      from public.matches m
      where m.id = target_match_id
        and m.status = 'scheduled'
        and now() < m.starts_at
    );
$$;

drop policy if exists "Users can create own predictions" on public.predictions;
create policy "Users can create own predictions"
on public.predictions for insert
to authenticated
with check (
  auth.uid() = user_id
  and public.predictions_are_open_for_match(match_id)
);

drop policy if exists "Users can update own predictions before deadline" on public.predictions;
create policy "Users can update own predictions before deadline"
on public.predictions for update
to authenticated
using (
  auth.uid() = user_id
  and public.predictions_are_open_for_match(match_id)
)
with check (
  auth.uid() = user_id
  and public.predictions_are_open_for_match(match_id)
);
