-- Allow any authenticated user to look up a group by code (needed for joining)

create policy "Anyone authenticated can look up groups"
  on public.groups for select
  to authenticated
  using (true);
