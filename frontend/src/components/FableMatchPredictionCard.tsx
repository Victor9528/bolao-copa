import { useState, type ChangeEvent } from 'react'

export type FableMatch = {
  id: string
  home: { name: string; code: string; flag: string }
  away: { name: string; code: string; flag: string }
  kickoff: string
  stadium: string
  group: string
  countsForPoints: boolean
}

type MatchPredictionCardProps = {
  match: FableMatch
  onSave?: (matchId: string, home: number, away: number) => void
}

const kickoffFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function FableMatchPredictionCard({ match, onSave }: MatchPredictionCardProps) {
  const [home, setHome] = useState('')
  const [away, setAway] = useState('')
  const [saved, setSaved] = useState(false)

  const isComplete = home !== '' && away !== ''

  function handleSave() {
    if (!isComplete) return
    onSave?.(match.id, Number(home), Number(away))
    setSaved(true)
  }

  function handleChange(setter: (v: string) => void) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      if (value === '' || (/^\d{1,2}$/.test(value) && Number(value) <= 99)) {
        setter(value)
        setSaved(false)
      }
    }
  }

  return (
    <article
      className={`group relative flex flex-col gap-4 rounded-2xl border bg-fable-surface p-5 transition-colors duration-200 ${
        saved ? 'border-fable-primary/60' : 'border-fable-border hover:border-fable-gold/40'
      }`}
    >
      <header className="flex items-center justify-between gap-2 text-xs text-fable-muted">
        <span className="rounded-full border border-fable-border px-2.5 py-0.5 font-medium uppercase tracking-wider">
          Grupo {match.group}
        </span>
        <time dateTime={match.kickoff} className="font-medium capitalize">
          {kickoffFormatter.format(new Date(match.kickoff))}
        </time>
      </header>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamSide flag={match.home.flag} code={match.home.code} name={match.home.name} align="left" />

        <div className="flex items-center gap-2">
          <ScoreInput
            value={home}
            onChange={handleChange(setHome)}
            label={`Gols de ${match.home.name}`}
          />
          <span className="font-fable-score text-2xl font-semibold text-fable-muted" aria-hidden>
            x
          </span>
          <ScoreInput
            value={away}
            onChange={handleChange(setAway)}
            label={`Gols de ${match.away.name}`}
          />
        </div>

        <TeamSide flag={match.away.flag} code={match.away.code} name={match.away.name} align="right" />
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-fable-border pt-3">
        <p className="truncate text-xs text-fable-muted">{match.stadium}</p>
        <div className="flex items-center gap-2">
          {!match.countsForPoints && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-fable-gold-soft">
              Não pontua
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!isComplete}
            className={`rounded-lg px-4 py-1.5 font-fable-score text-sm font-semibold uppercase tracking-wide transition-colors ${
              saved
                ? 'bg-fable-primary/15 text-fable-primary'
                : isComplete
                  ? 'bg-fable-primary text-fable-primary-foreground hover:bg-fable-primary/85'
                  : 'cursor-not-allowed bg-fable-surface-raised text-fable-muted'
            }`}
          >
            {saved ? 'Palpite salvo' : 'Salvar palpite'}
          </button>
        </div>
      </footer>
    </article>
  )
}

function TeamSide({
  flag,
  code,
  name,
  align,
}: {
  flag: string
  code: string
  name: string
  align: 'left' | 'right'
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2.5 ${
        align === 'right' ? 'flex-row-reverse text-right' : ''
      }`}
    >
      <span className="text-3xl leading-none" role="img" aria-label={`Bandeira de ${name}`}>
        {flag}
      </span>
      <div className="min-w-0">
        <p className="font-fable-score text-lg font-bold uppercase leading-tight">{code}</p>
        <p className="hidden truncate text-xs text-fable-muted sm:block">{name}</p>
      </div>
    </div>
  )
}

function ScoreInput({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  label: string
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={99}
      value={value}
      onChange={onChange}
      placeholder="-"
      aria-label={label}
      className="h-14 w-12 rounded-xl border border-fable-border bg-fable-background text-center font-fable-score text-3xl font-bold tabular-nums text-fable-foreground transition-colors placeholder:text-fable-muted/50 hover:border-fable-gold/40 focus:border-fable-gold sm:w-14"
    />
  )
}
