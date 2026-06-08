-- Keep sync execution logs backend-only.
-- Run after 003_sync_runs.sql.

revoke all on table public.sync_runs from anon, authenticated;
revoke all on sequence public.sync_runs_id_seq from anon, authenticated;
