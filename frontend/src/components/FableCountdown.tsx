import { useEffect, useState } from 'react'

type CountdownProps = {
  target: Date
  label?: string
}

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

function getTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }

  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
    expired: false,
  }
}

export function FableCountdown({ target, label = 'Palpites fecham em' }: CountdownProps) {
  const [time, setTime] = useState<TimeLeft>(() => getTimeLeft(target))

  useEffect(() => {
    const id = window.setInterval(() => setTime(getTimeLeft(target)), 1000)
    return () => window.clearInterval(id)
  }, [target])

  if (time.expired) {
    return (
      <p className="font-fable-score text-lg font-semibold uppercase tracking-wide text-fable-live">
        Palpites encerrados
      </p>
    )
  }

  const units: Array<[number, string]> = [
    [time.days, 'dias'],
    [time.hours, 'horas'],
    [time.minutes, 'min'],
    [time.seconds, 'seg'],
  ]

  return (
    <div role="timer" aria-live="off">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-fable-muted">{label}</p>
      <div className="flex items-start gap-3">
        {units.map(([value, unit], i) => (
          <div key={unit} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <span className="font-fable-score text-4xl font-bold tabular-nums leading-none text-fable-foreground sm:text-5xl">
                {String(value).padStart(2, '0')}
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-widest text-fable-muted">{unit}</span>
            </div>
            {i < units.length - 1 && (
              <span className="font-fable-score text-4xl font-bold leading-none text-fable-gold sm:text-5xl" aria-hidden>
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
