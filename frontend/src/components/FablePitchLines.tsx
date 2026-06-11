export function FablePitchLines({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <g stroke="hsl(var(--fable-chalk) / 0.08)" strokeWidth="2">
        <line x1="600" y1="0" x2="600" y2="600" />
        <circle cx="600" cy="300" r="110" />
        <circle cx="600" cy="300" r="4" fill="hsl(var(--fable-chalk) / 0.12)" stroke="none" />

        <rect x="0" y="130" width="190" height="340" />
        <rect x="0" y="215" width="70" height="170" />
        <path d="M 190 230 A 95 95 0 0 1 190 370" />

        <rect x="1010" y="130" width="190" height="340" />
        <rect x="1130" y="215" width="70" height="170" />
        <path d="M 1010 230 A 95 95 0 0 0 1010 370" />

        <path d="M 0 25 A 25 25 0 0 1 25 0" transform="translate(0,0)" />
        <path d="M 1175 0 A 25 25 0 0 1 1200 25" />
        <path d="M 1200 575 A 25 25 0 0 1 1175 600" />
        <path d="M 25 600 A 25 25 0 0 1 0 575" />
      </g>

      <g fill="hsl(var(--fable-chalk) / 0.015)">
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={i * 200} y="0" width="100" height="600" />
        ))}
      </g>
    </svg>
  )
}
