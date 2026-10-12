/** Kevyt palkkikaavio ilman kirjastoja. highlight = korostettavan palkin indeksi. */
export default function BarChart({ items, unit = '', highlight, height = 110 }: { items: { label: string; value: number }[]; unit?: string; highlight?: number; height?: number }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="bars" style={{ height }}>
      {items.map((it, i) => (
        <div key={i} className={`bar-col ${i === highlight ? 'hl' : ''}`} title={`${it.label}: ${it.value.toLocaleString('fi-FI')}${unit}`}>
          <span className="bar-val">{it.value > 0 ? (it.value >= 1000 ? `${(it.value / 1000).toFixed(it.value >= 10000 ? 0 : 1).replace('.', ',')}k` : it.value) : ''}</span>
          <i style={{ height: `${(it.value / max) * 100}%` }} />
          <span className="bar-lbl">{it.label}</span>
        </div>
      ))}
    </div>
  );
}
