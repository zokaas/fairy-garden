const WD = ['Ma', '', 'Ke', '', 'Pe', '', 'Su'];
const level = (v: number) => (v <= 0 ? 0 : v < 5000 ? 1 : v < 10000 ? 2 : v < 15000 ? 3 : 4);

/** Aktiivisuuskartta: sarakkeet viikkoja (vanhin vasemmalla), rivit ma–su. */
export default function Heatmap({ cols }: { cols: ({ day: string; steps: number } | null)[][] }) {
  return (
    <div className="heatwrap">
      <div className="heatlbl">{WD.map((d, i) => <span key={i}>{d}</span>)}</div>
      <div className="heat" style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}>
        {cols.map((col, ci) => col.map((c, ri) => (
          <i key={`${ci}-${ri}`} data-l={c ? level(c.steps) : 'x'} title={c ? `${Number(c.day.slice(8))}.${Number(c.day.slice(5, 7))}. · ${Math.round(c.steps).toLocaleString('fi-FI')}` : ''} style={{ gridColumn: ci + 1, gridRow: ri + 1 }} />
        )))}
      </div>
      <div className="heatkey"><span>vähemmän</span>{[0, 1, 2, 3, 4].map((l) => <i key={l} data-l={l} />)}<span>enemmän</span></div>
    </div>
  );
}
