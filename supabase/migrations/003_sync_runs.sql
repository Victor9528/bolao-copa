-- Stores backend sync executions to avoid unnecessary external API calls.
-- Run after 002_scoring_and_permissions.sql.

create table if not exists public.sync_runs (
  id bigserial primary key,
  provider text not null,
  status text not null check (status in ('started', 'success', 'failed', 'skipped')),
  synced_count integer not null default 0 check (synced_count >= 0),
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists sync_runs_provider_started_at_idx
on public.sync_runs(provider, started_at desc);

alter table public.sync_runs enable row level security;

-- No frontend access by default. The backend uses service_role and bypasses RLS.
