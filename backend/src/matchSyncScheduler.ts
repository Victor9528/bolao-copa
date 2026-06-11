import { createSupabaseAdminClient } from './supabase';
import { syncMatches } from './matchSync';

type SchedulerMatch = {
  id: number;
  starts_at: string;
  status: 'scheduled' | 'live' | 'finished';
  home_score: number | null;
  away_score: number | null;
};

const maxTimeoutMs = 2_147_483_647;
const lastSyncByMatchId = new Map<number, number>();

function getNumberEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function getEstimatedMatchEnd(match: SchedulerMatch) {
  const expectedDurationMinutes = getNumberEnv('MATCH_EXPECTED_DURATION_MINUTES', 120);
  return new Date(new Date(match.starts_at).getTime() + expectedDurationMinutes * 60_000);
}

function getSyncDueAt(match: SchedulerMatch) {
  const delayMinutes = getNumberEnv('MATCH_SYNC_AFTER_END_MINUTES', 15);
  return new Date(getEstimatedMatchEnd(match).getTime() + delayMinutes * 60_000);
}

function needsFinalScore(match: SchedulerMatch) {
  return match.status !== 'finished' || match.home_score === null || match.away_score === null;
}

async function findNextSync() {
  const supabase = createSupabaseAdminClient();
  const now = Date.now();
  const retryMinutes = getNumberEnv('MATCH_SYNC_RETRY_MINUTES', 15);
  const retryMs = Math.max(1, retryMinutes) * 60_000;

  const { data, error } = await supabase
    .from('matches')
    .select('id, starts_at, status, home_score, away_score')
    .order('starts_at', { ascending: true });

  if (error) {
    throw new Error(`Supabase scheduler matches lookup failed: ${error.message}`);
  }

  const matches = (data ?? []) as SchedulerMatch[];
  let nextDueAt: Date | null = null;
  const dueMatches: SchedulerMatch[] = [];

  for (const match of matches) {
    if (!needsFinalScore(match)) continue;

    const dueAt = getSyncDueAt(match);

    if (dueAt.getTime() <= now) {
      const lastSyncAt = lastSyncByMatchId.get(match.id) ?? 0;

      if (now - lastSyncAt >= retryMs) {
        dueMatches.push(match);
      }

      continue;
    }

    if (!nextDueAt || dueAt < nextDueAt) {
      nextDueAt = dueAt;
    }
  }

  return { dueMatches, nextDueAt };
}

export function startMatchSyncScheduler() {
  if (process.env.MATCH_SYNC_SCHEDULER_ENABLED === 'false') {
    console.log('Match sync scheduler disabled');
    return;
  }

  let timer: NodeJS.Timeout | undefined;
  let running = false;

  const schedule = (delayMs: number) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(run, Math.min(Math.max(delayMs, 1_000), maxTimeoutMs));
  };

  const run = async () => {
    if (running) return;
    running = true;

    try {
      const { dueMatches, nextDueAt } = await findNextSync();

      if (dueMatches.length > 0) {
        const now = Date.now();
        for (const match of dueMatches) {
          lastSyncByMatchId.set(match.id, now);
        }

        const result = await syncMatches({ force: true });
        console.log(`Match sync scheduler updated ${result.synced} matches after ${dueMatches.length} due match(es)`);
      }

      const nextSync = dueMatches.length > 0 ? await findNextSync() : { dueMatches, nextDueAt };
      const retryMinutes = getNumberEnv('MATCH_SYNC_RETRY_MINUTES', 15);
      const fallbackDelayMs = Math.max(1, retryMinutes) * 60_000;
      const nextDelayMs = nextSync.nextDueAt ? nextSync.nextDueAt.getTime() - Date.now() : fallbackDelayMs;
      schedule(nextSync.dueMatches.length > 0 ? fallbackDelayMs : nextDelayMs);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown scheduler error';
      console.error(`Match sync scheduler failed: ${message}`);
      schedule(5 * 60_000);
    } finally {
      running = false;
    }
  };

  console.log('Match sync scheduler enabled');
  schedule(1_000);
}
