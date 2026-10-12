const DRESS = ['#8bbf9f', '#6fb08c', '#e18fae', '#d4527f', '#9c7bd6', '#c9a24a'];

/** Piirretty keiju. Taso kasvattaa siipiä ja lisää kimalluksen, kukkaseppeleen, siivet ja kruunun. */
export default function FairyFigure({ stage = 2, size = 64 }: { stage?: number; size?: number }) {
  const s = Math.max(0, Math.min(5, stage));
  const dress = DRESS[s];
  const wing = 0.7 + s * 0.08;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`wg${s}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d9f3ff" stopOpacity=".95" /><stop offset="1" stopColor="#d7c4f5" stopOpacity=".8" /></linearGradient>
      </defs>
      <g transform={`translate(32 34) scale(${wing}) translate(-32 -34)`}>
        <path d="M32 33C20 14 6 16 7 27C8 38 24 38 32 33Z" fill={`url(#wg${s})`} stroke="#b9a3e3" strokeWidth=".9" />
        <path d="M32 33C44 14 58 16 57 27C56 38 40 38 32 33Z" fill={`url(#wg${s})`} stroke="#b9a3e3" strokeWidth=".9" />
        {s >= 2 && <><path d="M31 36C22 40 14 50 20 53C26 55 31 45 31 36Z" fill={`url(#wg${s})`} stroke="#b9a3e3" strokeWidth=".9" /><path d="M33 36C42 40 50 50 44 53C38 55 33 45 33 36Z" fill={`url(#wg${s})`} stroke="#b9a3e3" strokeWidth=".9" /></>}
        {s >= 4 && <><circle cx="17" cy="24" r="2" fill="#fff" fillOpacity=".8" /><circle cx="47" cy="24" r="2" fill="#fff" fillOpacity=".8" /></>}
      </g>
      <path d="M28 40L24 56H40L36 40Z" fill={dress} />
      <path d="M25 52Q32 58 39 52L40 56H24Z" fill="#000" fillOpacity=".1" />
      <rect x="29.5" y="26" width="5" height="6" rx="2" fill="#f3c9a8" />
      <path d="M27 40Q32 36 37 40" stroke="#f3c9a8" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="32" cy="23" r="8" fill="#f6d2b4" />
      <path d="M23.5 23C23 12 41 12 40.5 23C38 17 28 16 23.5 23Z" fill="#6b3a5a" />
      <path d="M23.5 23C22 28 24 31 26 32C25 28 25 25 26 22Z" fill="#6b3a5a" />
      <circle cx="29.2" cy="24.2" r="1" fill="#34183f" /><circle cx="34.8" cy="24.2" r="1" fill="#34183f" />
      <path d="M30 27.2Q32 28.8 34 27.2" stroke="#c4406f" strokeWidth="1" fill="none" strokeLinecap="round" />
      {s >= 2 && <g><path d="M40 38L50 26" stroke="#b98a2e" strokeWidth="1.4" strokeLinecap="round" /><path d="M50 21l1.6 3.4 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="#f0d98a" stroke="#b98a2e" strokeWidth=".6" /></g>}
      {s >= 3 && s < 5 && [24, 28, 32, 36, 40].map((x, i) => <circle key={x} cx={x} cy={14 + (i % 2 === 0 ? 1.5 : 0)} r="2.1" fill={['#f08fb4', '#fff', '#f2c47d', '#fff', '#f08fb4'][i]} />)}
      {s >= 5 && <path d="M24 15L26 8L29 12L32 6L35 12L38 8L40 15Z" fill="#f0d98a" stroke="#b98a2e" strokeWidth=".9" strokeLinejoin="round" />}
    </svg>
  );
}
