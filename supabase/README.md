# Supabase Setup

## Apply Schema

1. Open Supabase dashboard.
2. Go to SQL Editor.
3. Paste and run `supabase/migrations/001_initial_schema.sql`.
4. Paste and run `supabase/migrations/002_scoring_and_permissions.sql`.
5. Paste and run `supabase/migrations/003_sync_runs.sql`.

## Auth Settings

- Enable email/password provider.
- For faster local testing, disable email confirmation. Re-enable it later if desired.
- Keep Row Level Security enabled.

## Tables

- `profiles`: public participant profile linked to `auth.users`.
- `matches`: World Cup matches and official scores.
- `predictions`: one prediction per user per match.
- `ranking`: view that sums prediction points.

## Scoring Rule

- Exact score: 4 points.
- Correct winner or draw: 2 points.
- Wrong outcome: 0 points.
- Matches marked with `counts_for_pool = false` always score 0.

## Current RLS Rules

- Authenticated users can read profiles and matches.
- Users can update only their own profile.
- Users can read/create/update only their own predictions.
- Predictions can only be created/updated before `2026-06-13 15:00:00-03`.
- Users cannot write `points`; points are calculated by database triggers.

## Important

Match creation and score updates are intentionally not allowed from the frontend. They should be inserted manually in Supabase, by a backend job, or by a trusted integration.

When match scores are updated in `matches`, prediction points for that match are recalculated automatically.

## Match Sync Backend

The backend has a protected endpoint to sync fixtures/results from a football API into `matches`:

```http
POST /admin/sync-matches
x-sync-secret: your-sync-secret
```

Required backend env vars:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SYNC_SECRET`
- `FOOTBALL_API_PROVIDER=football-data`
- `FOOTBALL_DATA_API_KEY`
- `FOOTBALL_DATA_COMPETITION=WC`
- `SYNC_COOLDOWN_MINUTES=60` optional, defaults to 60

Do not expose `SUPABASE_SERVICE_ROLE_KEY`, `SYNC_SECRET`, or football API keys in the frontend.

The sync endpoint has a cooldown to avoid unnecessary external API usage. To force a sync intentionally, call:

```http
POST /admin/sync-matches?force=true
x-sync-secret: your-sync-secret
```
