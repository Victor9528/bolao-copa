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
  'Cape Verde Islands': { code: 'CPV', flagCode: 'cv' },
  CD: { code: 'COD', flagCode: 'cd' },
  CIV: { code: 'CIV', flagCode: 'ci' },
  Colombia: { code: 'COL', flagCode: 'co' },
  COD: { code: 'COD', flagCode: 'cd' },
  CPV: { code: 'CPV', flagCode: 'cv' },
  Croatia: { code: 'CRO', flagCode: 'hr' },
  Curaçao: { code: 'CUW', flagCode: 'cw' },
  CVI: { code: 'CPV', flagCode: 'cv' },
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
  Uruguay: { code: 'URY', flagCode: 'uy' },
  USA: { code: 'USA', flagCode: 'us' },
  Uzbekistan: { code: 'UZB', flagCode: 'uz' },
}

const teamAliases: Record<string, TeamPresentation> = {
  'africa do sul': teams['South Africa'],
  alemanha: teams.Germany,
  argelia: teams.Algeria,
  argentina: teams.Argentina,
  australia: teams.Australia,
  austria: teams.Austria,
  bahrain: { code: 'BHR', flagCode: 'bh' },
  bahrein: { code: 'BHR', flagCode: 'bh' },
  bh: { code: 'BHR', flagCode: 'bh' },
  bhr: { code: 'BHR', flagCode: 'bh' },
  belgica: teams.Belgium,
  belgium: teams.Belgium,
  bolivia: { code: 'BOL', flagCode: 'bo' },
  'bosnia herzegovina': teams['Bosnia and Herzegovina'],
  'bosnia and herzegovina': teams['Bosnia and Herzegovina'],
  brasil: teams.Brazil,
  brazil: teams.Brazil,
  canada: teams.Canada,
  'cape verde': teams['Cape Verde'],
  'cape verde islands': teams['Cape Verde'],
  'cabo verde': teams['Cape Verde'],
  cd: teams['DR Congo'],
  chile: { code: 'CHI', flagCode: 'cl' },
  china: { code: 'CHN', flagCode: 'cn' },
  colombia: teams.Colombia,
  congo: teams['DR Congo'],
  'costa rica': { code: 'CRC', flagCode: 'cr' },
  croacia: teams.Croatia,
  croatia: teams.Croatia,
  curacao: teams.Curaçao,
  curaçao: teams.Curaçao,
  cvi: teams['Cape Verde'],
  czechia: teams.Czechia,
  'czech republic': teams.Czechia,
  dinamarca: teams.Denmark,
  denmark: teams.Denmark,
  'dr congo': teams['DR Congo'],
  drc: teams['DR Congo'],
  'congo dr': teams['DR Congo'],
  'congo democratic republic': teams['DR Congo'],
  'democratic republic of congo': teams['DR Congo'],
  'democratic republic congo': teams['DR Congo'],
  ecuador: teams.Ecuador,
  egito: teams.Egypt,
  egypt: teams.Egypt,
  emirates: { code: 'UAE', flagCode: 'ae' },
  england: teams.England,
  equador: teams.Ecuador,
  escocia: teams.Scotland,
  espanha: teams.Spain,
  estadosunidos: teams.USA,
  'estados unidos': teams.USA,
  france: teams.France,
  franca: teams.France,
  frança: teams.France,
  germany: teams.Germany,
  ghana: teams.Ghana,
  haiti: teams.Haiti,
  honduras: { code: 'HON', flagCode: 'hn' },
  indonesia: { code: 'IDN', flagCode: 'id' },
  inglaterra: teams.England,
  ira: teams.Iran,
  iran: teams.Iran,
  iraq: teams.Iraq,
  irlanda: { code: 'IRL', flagCode: 'ie' },
  'ivory coast': teams['Ivory Coast'],
  civ: teams['Ivory Coast'],
  'cote divoire': teams['Ivory Coast'],
  'cote d ivoire': teams['Ivory Coast'],
  'côte d’ivoire': teams['Ivory Coast'],
  'côte d ivoire': teams['Ivory Coast'],
  italia: teams.Italy,
  italy: teams.Italy,
  jamaica: { code: 'JAM', flagCode: 'jm' },
  japao: teams.Japan,
  japan: teams.Japan,
  jordan: teams.Jordan,
  jordania: teams.Jordan,
  'korea republic': teams['South Korea'],
  'republic of korea': teams['South Korea'],
  kuwait: { code: 'KUW', flagCode: 'kw' },
  mexico: teams.Mexico,
  méxico: teams.Mexico,
  marrocos: teams.Morocco,
  morocco: teams.Morocco,
  netherlands: teams.Netherlands,
  noruega: teams.Norway,
  norway: teams.Norway,
  'nova zelandia': teams['New Zealand'],
  'new zealand': teams['New Zealand'],
  oman: { code: 'OMA', flagCode: 'om' },
  panama: teams.Panama,
  paraguai: teams.Paraguay,
  paraguay: teams.Paraguay,
  peru: { code: 'PER', flagCode: 'pe' },
  poland: teams.Poland,
  polonia: teams.Poland,
  portugal: teams.Portugal,
  qatar: teams.Qatar,
  romenia: { code: 'ROU', flagCode: 'ro' },
  romania: { code: 'ROU', flagCode: 'ro' },
  'saudi arabia': teams['Saudi Arabia'],
  'arabia saudita': teams['Saudi Arabia'],
  scotland: teams.Scotland,
  senegal: teams.Senegal,
  serbia: teams.Serbia,
  slovakia: { code: 'SVK', flagCode: 'sk' },
  eslovaquia: { code: 'SVK', flagCode: 'sk' },
  'south africa': teams['South Africa'],
  'south korea': teams['South Korea'],
  'coreia do sul': teams['South Korea'],
  spain: teams.Spain,
  suecia: teams.Sweden,
  sweden: teams.Sweden,
  switzerland: teams.Switzerland,
  suica: teams.Switzerland,
  suíça: teams.Switzerland,
  syria: { code: 'SYR', flagCode: 'sy' },
  tba: { code: 'TBD' },
  tbd: { code: 'TBD' },
  tailandia: { code: 'THA', flagCode: 'th' },
  tbc: { code: 'TBD' },
  thailand: { code: 'THA', flagCode: 'th' },
  'to be confirmed': { code: 'TBD' },
  'to be decided': { code: 'TBD' },
  'a definir': { code: 'TBD' },
  'a confirmar': { code: 'TBD' },
  tunisia: teams.Tunisia,
  tunisia_pt: teams.Tunisia,
  tunisia_br: teams.Tunisia,
  tunez: teams.Tunisia,
  tunisia_alias: teams.Tunisia,
  tunísia: teams.Tunisia,
  turkiye: teams.Türkiye,
  türkiye: teams.Türkiye,
  turkey: teams.Türkiye,
  turquia: teams.Türkiye,
  uae: { code: 'UAE', flagCode: 'ae' },
  'united arab emirates': { code: 'UAE', flagCode: 'ae' },
  'emirados arabes unidos': { code: 'UAE', flagCode: 'ae' },
  ukraine: { code: 'UKR', flagCode: 'ua' },
  ucrania: { code: 'UKR', flagCode: 'ua' },
  uruguay: teams.Uruguay,
  uruguai: teams.Uruguay,
  us: teams.USA,
  usa: teams.USA,
  'united states': teams.USA,
  'united states of america': teams.USA,
  uzbekistan: teams.Uzbekistan,
  usbequistao: teams.Uzbekistan,
  uzbequistao: teams.Uzbekistan,
  venezuela: { code: 'VEN', flagCode: 've' },
  wales: { code: 'WAL', flagCode: 'gb-wls' },
  gales: { code: 'WAL', flagCode: 'gb-wls' },
}

function normalizeTeamName(teamName: string) {
  return teamName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
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
  const normalizedName = normalizeTeamName(teamName)
  const compactName = normalizedName.replace(/\s/g, '')
  const normalizedAlias = teamAliases[normalizedName] ?? teamAliases[compactName]

  if (teams[teamName] || normalizedAlias) {
    return teams[teamName] ?? normalizedAlias
  }

  const uppercaseName = teamName.trim().toUpperCase()
  const fallbackCode = teamName
    .split(/\s|-/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()

  return {
    code: uppercaseName.length >= 2 && uppercaseName.length <= 3
      ? uppercaseName
      : fallbackCode.length >= 2 ? fallbackCode : 'TBD',
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
