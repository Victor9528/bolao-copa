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

const finishedStatuses = new Set(['FT', 'AET', 'PEN']);
const liveStatuses = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE']);

function toMatchStatus(apiStatus: string): MatchRow['status'] {
  if (finishedStatuses.has(apiStatus)) return 'finished';
  if (liveStatuses.has(apiStatus)) return 'live';
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

export async function syncMatches() {
  const provider = process.env.FOOTBALL_API_PROVIDER || 'api-football';

  if (provider !== 'api-football') {
    throw new Error(`Unsupported FOOTBALL_API_PROVIDER: ${provider}`);
  }

  const matches = await fetchApiFootballFixtures();
  const supabase = createSupabaseAdminClient();

  if (matches.length === 0) {
    return { synced: 0 };
  }

  const { error } = await supabase
    .from('matches')
    .upsert(matches, { onConflict: 'external_id' });

  if (error) {
    throw new Error(`Supabase match upsert failed: ${error.message}`);
  }

  return { synced: matches.length };
}
