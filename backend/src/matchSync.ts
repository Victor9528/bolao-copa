import https from 'node:https';
import { createSupabaseAdminClient } from './supabase';

type ApiFootballFixture = {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
    };
  };
  teams: {
    home: {
      name: string;
    };
    away: {
      name: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
};

type ApiFootballResponse = {
  response?: ApiFootballFixture[];
  errors?: unknown;
};

type FootballDataMatch = {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: {
    name: string | null;
    shortName?: string | null;
    tla?: string | null;
  };
  awayTeam: {
    name: string | null;
    shortName?: string | null;
    tla?: string | null;
  };
  score: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
};

type FootballDataResponse = {
  matches?: FootballDataMatch[];
  message?: string;
  errorCode?: number;
};

type MatchRow = {
  external_id: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  starts_at: string;
  status: 'scheduled' | 'live' | 'finished';
  counts_for_pool: boolean;
};

type SyncMatchesOptions = {
  force?: boolean;
};

const finishedStatuses = new Set(['FT', 'AET', 'PEN']);
const liveStatuses = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE']);
const footballDataFinishedStatuses = new Set(['FINISHED']);
const footballDataLiveStatuses = new Set(['IN_PLAY', 'PAUSED']);

function getSyncCooldownMinutes() {
  const configuredValue = Number(process.env.SYNC_COOLDOWN_MINUTES || 60);
  return Number.isFinite(configuredValue) && configuredValue >= 0 ? configuredValue : 60;
}

function getCooldownUntil(startedAt: string, cooldownMinutes: number) {
  return new Date(new Date(startedAt).getTime() + cooldownMinutes * 60_000);
}

function toMatchStatus(apiStatus: string): MatchRow['status'] {
  if (finishedStatuses.has(apiStatus)) return 'finished';
  if (liveStatuses.has(apiStatus)) return 'live';
  return 'scheduled';
}

function toFootballDataMatchStatus(apiStatus: string): MatchRow['status'] {
  if (footballDataFinishedStatuses.has(apiStatus)) return 'finished';
  if (footballDataLiveStatuses.has(apiStatus)) return 'live';
  return 'scheduled';
}

function shouldCountForPool(matchDate: string, matchIndex: number) {
  const date = new Date(matchDate);
  const saoPauloDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

  if (matchIndex < 4) return false;
  return saoPauloDate !== '2026-06-11' && saoPauloDate !== '2026-06-12';
}

function mapApiFootballFixtures(fixtures: ApiFootballFixture[]): MatchRow[] {
  return fixtures
    .slice()
    .sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())
    .map((fixture, index) => ({
      external_id: String(fixture.fixture.id),
      home_team: fixture.teams.home.name,
      away_team: fixture.teams.away.name,
      home_score: fixture.goals.home,
      away_score: fixture.goals.away,
      starts_at: fixture.fixture.date,
      status: toMatchStatus(fixture.fixture.status.short),
      counts_for_pool: shouldCountForPool(fixture.fixture.date, index),
    }));
}

function mapFootballDataMatches(matches: FootballDataMatch[]): MatchRow[] {
  return matches
    .slice()
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
    .map((match, index) => ({
      external_id: String(match.id),
      home_team: match.homeTeam.name || match.homeTeam.shortName || match.homeTeam.tla || 'A definir (mandante)',
      away_team: match.awayTeam.name || match.awayTeam.shortName || match.awayTeam.tla || 'A definir (visitante)',
      home_score: match.score.fullTime.home,
      away_score: match.score.fullTime.away,
      starts_at: match.utcDate,
      status: toFootballDataMatchStatus(match.status),
      counts_for_pool: shouldCountForPool(match.utcDate, index),
    }));
}

async function fetchApiFootballFixtures() {
  const apiBaseUrl = process.env.FOOTBALL_API_BASE_URL || 'https://v3.football.api-sports.io';
  const apiKey = process.env.FOOTBALL_API_KEY;
  const leagueId = process.env.FOOTBALL_LEAGUE_ID;
  const season = process.env.FOOTBALL_SEASON;

  if (!apiKey || !leagueId || !season) {
    throw new Error('Missing FOOTBALL_API_KEY, FOOTBALL_LEAGUE_ID or FOOTBALL_SEASON');
  }

  const url = new URL('/fixtures', apiBaseUrl);
  url.searchParams.set('league', leagueId);
  url.searchParams.set('season', season);

  const response = await fetch(url, {
    headers: {
      'x-apisports-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Football API request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ApiFootballResponse;

  if (!Array.isArray(payload.response)) {
    throw new Error(`Unexpected Football API response: ${JSON.stringify(payload.errors ?? payload)}`);
  }

  return mapApiFootballFixtures(payload.response);
}

function getJsonWithHttps<T>(url: URL, headers: Record<string, string>) {
  return new Promise<T>((resolve, reject) => {
    const request = https.request(url, { headers }, (response) => {
      let body = '';

      response.on('data', (chunk) => {
        body += chunk;
      });

      response.on('end', () => {
        if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`Football-Data request failed with status ${response.statusCode}: ${body}`));
          return;
        }

        try {
          resolve(JSON.parse(body) as T);
        } catch (error) {
          reject(error);
        }
      });
    });

    request.on('error', reject);
    request.end();
  });
}

async function fetchFootballDataMatches() {
  const apiBaseUrl = process.env.FOOTBALL_DATA_API_BASE_URL || 'https://api.football-data.org/v4';
  const apiKey = process.env.FOOTBALL_DATA_API_KEY || process.env.FOOTBALL_API_KEY;
  const competition = process.env.FOOTBALL_DATA_COMPETITION || 'WC';

  if (!apiKey) {
    throw new Error('Missing FOOTBALL_DATA_API_KEY');
  }

  const normalizedBaseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl : `${apiBaseUrl}/`;
  const url = new URL(`competitions/${competition}/matches`, normalizedBaseUrl);
  const payload = await getJsonWithHttps<FootballDataResponse>(url, {
    Accept: 'application/json',
    'X-Auth-Token': apiKey,
    'User-Agent': 'bolao-copa/1.0',
  });

  if (!Array.isArray(payload.matches)) {
    throw new Error(`Unexpected Football-Data response: ${JSON.stringify(payload)}`);
  }

  return mapFootballDataMatches(payload.matches);
}

export async function syncMatches(options: SyncMatchesOptions = {}) {
  const provider = process.env.FOOTBALL_API_PROVIDER || 'api-football';
  const supabase = createSupabaseAdminClient();
  const cooldownMinutes = getSyncCooldownMinutes();

  if (!options.force && cooldownMinutes > 0) {
    const { data: latestRun, error: latestRunError } = await supabase
      .from('sync_runs')
      .select('started_at, synced_count')
      .eq('provider', provider)
      .eq('status', 'success')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestRunError) {
      throw new Error(`Supabase sync_runs lookup failed: ${latestRunError.message}`);
    }

    if (latestRun) {
      const cooldownUntil = getCooldownUntil(latestRun.started_at, cooldownMinutes);

      if (cooldownUntil > new Date()) {
        await supabase.from('sync_runs').insert({
          provider,
          status: 'skipped',
          synced_count: 0,
          error_message: `Cooldown active until ${cooldownUntil.toISOString()}`,
          finished_at: new Date().toISOString(),
        });

        return {
          synced: 0,
          skipped: true,
          reason: 'cooldown_active',
          cooldownUntil: cooldownUntil.toISOString(),
          previousSynced: latestRun.synced_count,
        };
      }
    }
  }

  const { data: syncRun, error: syncRunError } = await supabase
    .from('sync_runs')
    .insert({ provider, status: 'started' })
    .select('id')
    .single();

  if (syncRunError) {
    throw new Error(`Supabase sync_runs insert failed: ${syncRunError.message}`);
  }

  try {
  const matches = provider === 'football-data'
    ? await fetchFootballDataMatches()
    : provider === 'api-football'
      ? await fetchApiFootballFixtures()
      : undefined;

  if (!matches) {
    throw new Error(`Unsupported FOOTBALL_API_PROVIDER: ${provider}`);
  }

  if (matches.length === 0) {
    await supabase
      .from('sync_runs')
      .update({ status: 'success', synced_count: 0, finished_at: new Date().toISOString() })
      .eq('id', syncRun.id);

    return { synced: 0, skipped: false };
  }

  const { error } = await supabase
    .from('matches')
    .upsert(matches, { onConflict: 'external_id' });

  if (error) {
    throw new Error(`Supabase match upsert failed: ${error.message}`);
  }

    await supabase
      .from('sync_runs')
      .update({ status: 'success', synced_count: matches.length, finished_at: new Date().toISOString() })
      .eq('id', syncRun.id);

    return { synced: matches.length, skipped: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error';

    await supabase
      .from('sync_runs')
      .update({ status: 'failed', error_message: message, finished_at: new Date().toISOString() })
      .eq('id', syncRun.id);

    throw error;
  }
}
