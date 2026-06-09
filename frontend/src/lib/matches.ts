export type Match = {
  id: number
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  starts_at: string
  status: 'scheduled' | 'live' | 'finished'
  counts_for_pool: boolean
}

type TeamPresentation = {
  code: string
  flagCode?: string
}

export const teams: Record<string, TeamPresentation> = {
  Algeria: { code: 'ALG', flagCode: 'dz' },
  Argentina: { code: 'ARG', flagCode: 'ar' },
  Australia: { code: 'AUS', flagCode: 'au' },
  Austria: { code: 'AUT', flagCode: 'at' },
  Belgium: { code: 'BEL', flagCode: 'be' },
  'Bosnia and Herzegovina': { code: 'BIH', flagCode: 'ba' },
  Brazil: { code: 'BRA', flagCode: 'br' },
  Canada: { code: 'CAN', flagCode: 'ca' },
  'Cape Verde': { code: 'CPV', flagCode: 'cv' },
  Colombia: { code: 'COL', flagCode: 'co' },
  Croatia: { code: 'CRO', flagCode: 'hr' },
  Curaçao: { code: 'CUW', flagCode: 'cw' },
  Czechia: { code: 'CZE', flagCode: 'cz' },
  Denmark: { code: 'DEN', flagCode: 'dk' },
  'DR Congo': { code: 'COD', flagCode: 'cd' },
  Ecuador: { code: 'ECU', flagCode: 'ec' },
  Egypt: { code: 'EGY', flagCode: 'eg' },
  England: { code: 'ENG', flagCode: 'gb-eng' },
  France: { code: 'FRA', flagCode: 'fr' },
  Germany: { code: 'GER', flagCode: 'de' },
  Ghana: { code: 'GHA', flagCode: 'gh' },
  Haiti: { code: 'HAI', flagCode: 'ht' },
  Iran: { code: 'IRN', flagCode: 'ir' },
  Iraq: { code: 'IRQ', flagCode: 'iq' },
  Italy: { code: 'ITA', flagCode: 'it' },
  'Ivory Coast': { code: 'CIV', flagCode: 'ci' },
  Japan: { code: 'JPN', flagCode: 'jp' },
  Jordan: { code: 'JOR', flagCode: 'jo' },
  Mexico: { code: 'MEX', flagCode: 'mx' },
  Morocco: { code: 'MAR', flagCode: 'ma' },
  Netherlands: { code: 'NED', flagCode: 'nl' },
  'New Zealand': { code: 'NZL', flagCode: 'nz' },
  Norway: { code: 'NOR', flagCode: 'no' },
  Panama: { code: 'PAN', flagCode: 'pa' },
  Paraguay: { code: 'PAR', flagCode: 'py' },
  Poland: { code: 'POL', flagCode: 'pl' },
  Portugal: { code: 'POR', flagCode: 'pt' },
  Qatar: { code: 'QAT', flagCode: 'qa' },
  'Saudi Arabia': { code: 'KSA', flagCode: 'sa' },
  Scotland: { code: 'SCO', flagCode: 'gb-sct' },
  Senegal: { code: 'SEN', flagCode: 'sn' },
  Serbia: { code: 'SRB', flagCode: 'rs' },
  'South Africa': { code: 'RSA', flagCode: 'za' },
  'South Korea': { code: 'KOR', flagCode: 'kr' },
  Spain: { code: 'ESP', flagCode: 'es' },
  Sweden: { code: 'SWE', flagCode: 'se' },
  Switzerland: { code: 'SUI', flagCode: 'ch' },
  Tunisia: { code: 'TUN', flagCode: 'tn' },
  Türkiye: { code: 'TUR', flagCode: 'tr' },
  Uruguay: { code: 'URU', flagCode: 'uy' },
  USA: { code: 'USA', flagCode: 'us' },
  Uzbekistan: { code: 'UZB', flagCode: 'uz' },
}

export function formatMatchDay(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value)).toUpperCase()
}

export function formatMatchTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value))
}

export function getTeamPresentation(teamName: string) {
  return teams[teamName] ?? {
    code: teamName
      .split(/\s|-/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 3)
      .toUpperCase() || 'TBD',
  }
}

export type RoundFilter = 'all' | 'round1' | 'round2' | 'round3' | 'round32' | 'round16' | 'quarter' | 'semi' | 'third' | 'final'

export const roundFilters: Array<{ id: RoundFilter; label: string }> = [
  { id: 'all', label: 'Todas' },
  { id: 'round1', label: '1ª rodada' },
  { id: 'round2', label: '2ª rodada' },
  { id: 'round3', label: '3ª rodada' },
  { id: 'round32', label: 'Fase de 32' },
  { id: 'round16', label: 'Oitavas de final' },
  { id: 'quarter', label: 'Quartas de final' },
  { id: 'semi', label: 'Semifinais' },
  { id: 'third', label: 'Disputa de 3º lugar' },
  { id: 'final', label: 'Final' },
]

export function getRoundFilterForIndex(index: number): RoundFilter {
  if (index < 24) return 'round1'
  if (index < 48) return 'round2'
  if (index < 72) return 'round3'
  if (index < 88) return 'round32'
  if (index < 96) return 'round16'
  if (index < 100) return 'quarter'
  if (index < 102) return 'semi'
  if (index === 102) return 'third'
  return 'final'
}

export function getRoundTitle(roundFilter: RoundFilter) {
  return roundFilters.find((filter) => filter.id === roundFilter)?.label ?? 'Jogos'
}

export function getScoreLabel(match: Match) {
  if (match.home_score === null || match.away_score === null) {
    return match.status === 'scheduled' ? 'Aguardando jogo' : 'Sem placar'
  }
  return `${match.home_score} x ${match.away_score}`
}

export function groupMatchesByDay(matches: Match[]) {
  return matches.reduce<Array<{ day: string; matches: Match[] }>>((acc, match) => {
    const day = formatMatchDay(match.starts_at)
    const currentGroup = acc[acc.length - 1]
    if (currentGroup?.day === day) {
      currentGroup.matches.push(match)
    } else {
      acc.push({ day, matches: [match] })
    }
    return acc
  }, [])
}
