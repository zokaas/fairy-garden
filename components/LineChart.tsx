const PALETTE = ['#ff4d94', '#8b5cf6', '#38bdf8', '#34d399', '#facc15', '#fb7185'];

/** Kevyt SVG-viivakaavio. Ensimmäiselle sarjalle tulee täyttö. */
export default function LineChart({ series, first, last, height = 150, fmt = (v: number) => v.toLocaleString('fi-FI') }: {
  series: { name: string; values: number[]; color?: string }[]; first: string; last: string; height?: number; fmt?: (v: number) => string;
}) {
  const W = 320, H = height, padB = 18, padT = 8, padR = 6, padL = 6;
  const n = Math.max(...series.map((s) => s.values.length), 2);
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const x = (i: number) => padL + (i / (n - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - v / max) * (H - padT - padB);
  const id = `lc${Math.abs(series.map((s) => s.name).join('').split('').reduce((a, c) => a + c.charCodeAt(0), 0))}`;
  return (
    <div className="linechart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={series.map((s) => s.name).join(', ')}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={series[0]?.color ?? PALETTE[0]} stopOpacity=".35" /><stop offset="1" stopColor={series[0]?.color ?? PALETTE[0]} stopOpacity="0" /></linearGradient>
        </defs>
        {[0, 0.5, 1].map((g) => <line key={g} x1={padL} x2={W - padR} y1={y(max * g)} y2={y(max * g)} stroke="var(--line)" strokeWidth="1" strokeDasharray={g === 0 ? undefined : '2 4'} />)}
        {series.map((s, si) => {
          const color = s.color ?? PALETTE[si % PALETTE.length];
          const pts = s.values.map((v, i) => `${x(i * ((n - 1) / Math.max(1, s.values.length - 1))).toFixed(1)},${y(v).toFixed(1)}`);
          const lx = x((s.values.length - 1) * ((n - 1) / Math.max(1, s.values.length - 1)));
          return (
            <g key={s.name}>
              {si === 0 && pts.length > 1 && <path d={`M${pts[0]} L${pts.join(' L')} L${lx},${H - padB} L${x(0)},${H - padB}Z`} fill={`url(#${id})`} />}
              <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={si === 0 ? 2.4 : 1.8} strokeLinejoin="round" strokeLinecap="round" opacity={si === 0 ? 1 : 0.9} className="lc-line" />
              <circle cx={lx} cy={y(s.values[s.values.length - 1] ?? 0)} r="3" fill={color} />
            </g>
          );
        })}
        <text x={padL} y={H - 4} className="lc-t">{first}</text>
        <text x={W - padR} y={H - 4} textAnchor="end" className="lc-t">{last}</text>
        <text x={W - padR} y={padT + 8} textAnchor="end" className="lc-t">{fmt(max)}</text>
      </svg>
      <div className="legend">
        {series.map((s, si) => <span key={s.name}><i style={{ background: s.color ?? PALETTE[si % PALETTE.length] }} />{s.name} <b>{fmt(s.values[s.values.length - 1] ?? 0)}</b></span>)}
      </div>
    </div>
  );
}
