const PALETTE = ['#ff4d94', '#8b5cf6', '#38bdf8', '#34d399', '#facc15', '#fb7185', '#a78bfa', '#94a3b8'];

/** Donitsikaavio osuuksista. */
export default function Donut({ items, center, unit = '' }: { items: { label: string; value: number }[]; center?: string; unit?: string }) {
  const total = items.reduce((a, i) => a + i.value, 0);
  const r = 42, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="14" />
        {total > 0 && items.map((it, i) => {
          const len = (it.value / total) * c;
          const seg = <circle key={it.label} cx="60" cy="60" r={r} fill="none" stroke={PALETTE[i % PALETTE.length]} strokeWidth="14" strokeDasharray={`${Math.max(0, len - 1.5)} ${c}`} strokeDashoffset={-acc} transform="rotate(-90 60 60)" />;
          acc += len;
          return seg;
        })}
        {center && <text x="60" y="64" textAnchor="middle" className="donut-c">{center}</text>}
      </svg>
      <ul>
        {items.map((it, i) => <li key={it.label}><i style={{ background: PALETTE[i % PALETTE.length] }} />{it.label}<b>{total ? Math.round((it.value / total) * 100) : 0} %</b><small>{it.value.toLocaleString('fi-FI')}{unit}</small></li>)}
      </ul>
    </div>
  );
}
