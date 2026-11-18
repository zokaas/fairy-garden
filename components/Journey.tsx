import { JOURNEY_GATE, JOURNEY_GOAL, STOPS } from '@/lib/garden';
import Avatar, { type AvatarData } from './Avatar';

const PTS: [number, number][] = [[8, 88], [60, 60], [120, 84], [180, 44], [240, 70], [292, 24]];

function at(f: number): [number, number] {
  const seg = Math.min(PTS.length - 2, Math.floor(f * (PTS.length - 1)));
  const t = f * (PTS.length - 1) - seg;
  return [PTS[seg][0] + (PTS[seg + 1][0] - PTS[seg][0]) * t, PTS[seg][1] + (PTS[seg + 1][1] - PTS[seg][1]) * t];
}

/** Kuinka pitkälle keiju näkyy polulla: portin ollessa kiinni enintään portille asti, portin auettua perillä. */
const effective = (steps: number, gateOpen: boolean) => (gateOpen ? JOURNEY_GOAL : Math.min(steps, JOURNEY_GATE));
const pos = (steps: number, gateOpen: boolean): [number, number] => at(Math.min(1, effective(steps, gateOpen) / JOURNEY_GOAL));
const pct = (x: number) => `${(x / 300) * 100}%`;

/** Haltijan polku: kokonaisaskeleet kuljettavat keijun kohti Gaalan porttia ja sitä kautta Albertinkatua. */
export default function Journey({ steps, avatar, stageIdx = 2, note, gateOpen = false, gateDate }: { steps: number; avatar: AvatarData; stageIdx?: number; note?: string; gateOpen?: boolean; gateDate?: string }) {
  const eff = effective(steps, gateOpen);
  const f = Math.min(1, eff / JOURNEY_GOAL);
  const [x, y] = at(f);
  const [fx, fy] = at(Math.min(1, JOURNEY_GATE / JOURNEY_GOAL));
  const next = STOPS.find((s) => s.at > eff);
  const d = PTS.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  const atGate = !gateOpen && steps >= JOURNEY_GATE;
  const walkerStyle = { left: pct(x), top: `${(y / 110) * 100}%`, ...(gateOpen ? { '--fx': pct(fx), '--fy': `${(fy / 110) * 100}%` } : {}) } as React.CSSProperties;
  return (
    <section className="card journey">
      <h2>Haltijan polku</h2>
      <div className="trail">
        <svg viewBox="0 0 300 110" preserveAspectRatio="none" aria-hidden="true">
          <path d={d} fill="none" stroke="var(--line-2)" strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" strokeLinejoin="round" />
          <path d={d} fill="none" stroke="url(#tg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - f} />
          <defs>
            <linearGradient id="tg" x1="0" x2="1"><stop offset="0" stopColor="#ff4d94" /><stop offset="1" stopColor="#38bdf8" /></linearGradient>
          </defs>
        </svg>
        {STOPS.map((s) => {
          const [sx, sy] = at(s.at / JOURNEY_GOAL);
          return <span key={s.name} className={`stop ${eff >= s.at ? 'on' : ''} ${s.at === JOURNEY_GATE ? (gateOpen ? 'gate open' : 'gate') : ''}`} style={{ left: pct(sx), top: `${(sy / 110) * 100}%` }} title={s.name}>{s.at === JOURNEY_GATE ? (gateOpen ? '✨' : '🔒') : s.emoji}</span>;
        })}
        <span className={`walker ${gateOpen ? 'arriving' : ''}`} style={walkerStyle}><Avatar a={avatar} size={34} stage={stageIdx} /></span>
      </div>
      <p className="muted">
        {gateOpen ? <>🥂 Portti aukesi, ja saavuit Albertinkadulle yhdessä muiden kanssa. Kukaan ei jäänyt taakse.</>
          : atGate ? <>🚪 Olet <b>Gaalan portilla</b>. Keijukuninkaan portti aukeaa {gateDate ?? 'kisan päättyessä'}, ja silloin kaikki saapuvat Albertinkadulle yhdessä. Odotellessa kukat ja pisteet kasvavat edelleen.</>
          : next ? <>Seuraava etappi: {next.emoji} <b>{next.name}</b>, vielä {(next.at - eff).toLocaleString('fi-FI')} askelta.</> : null}
      </p>
      {note && <p className="muted forecast">{note}</p>}
      <p className="muted">🚪 Polku päättyy Gaalan porttiin, joka aukeaa kisan päättyessä. Silloin kaikki keijut kulkevat viimeisen osuuden yhdessä Albertinkadulle.</p>
    </section>
  );
}

type Walker = AvatarData & { id: string; name: string; totalSteps: number; stageIdx: number; mine: boolean };

/** Yhteinen matka: kaikki keijut samalla polulla kisan askelten mukaan. Portin ollessa kiinni kaikki pysähtyvät viimeistään portille. */
export function GroupJourney({ fairies, gateOpen = false, gateDate }: { fairies: Walker[]; gateOpen?: boolean; gateDate?: string }) {
  const sorted = [...fairies].sort((a, b) => b.totalSteps - a.totalSteps);
  const leader = sorted[0];
  const atGate = sorted.filter((f) => f.totalSteps >= JOURNEY_GATE).length;
  const d = PTS.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  const furthest = leader ? STOPS.filter((s) => effective(leader.totalSteps, gateOpen) >= s.at).pop() : null;
  const [gx, gy] = at(JOURNEY_GATE / JOURNEY_GOAL);
  return (
    <section className="card journey">
      <h2>Yhteinen matka Albertinkadulle</h2>
      <div className="trail group">
        <svg viewBox="0 0 300 110" preserveAspectRatio="none" aria-hidden="true">
          <path d={d} fill="none" stroke="var(--line-2)" strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {STOPS.map((s) => {
          const [sx, sy] = at(s.at / JOURNEY_GOAL);
          const reached = gateOpen || sorted.some((f) => effective(f.totalSteps, false) >= s.at);
          return <span key={s.name} className={`stop ${reached ? 'on' : ''} ${s.at === JOURNEY_GATE ? (gateOpen ? 'gate open' : 'gate') : ''}`} style={{ left: pct(sx), top: `${(sy / 110) * 100}%` }} title={s.name}>{s.at === JOURNEY_GATE ? (gateOpen ? '✨' : '🔒') : s.emoji}</span>;
        })}
        {sorted.map((f, i) => {
          const [x, y] = pos(f.totalSteps, gateOpen);
          // pienet porrastukset, ettei samaan kohtaan osuvat avatarit peity kokonaan
          const dx = ((i % 3) - 1) * 5;
          const dy = (i % 2) * 6;
          const style = { left: `calc(${pct(x)} + ${dx}px)`, top: `calc(${(y / 110) * 100}% + ${dy}px)`, zIndex: f.mine ? 5 : 2, ...(gateOpen ? { '--fx': `calc(${pct(gx)} + ${dx}px)`, '--fy': `calc(${(gy / 110) * 100}% + ${dy}px)` } : {}) } as React.CSSProperties;
          return (
            <a key={f.id} href={`/keiju/${f.id}`} className={`walker mini ${f.mine ? 'me' : ''} ${gateOpen ? 'arriving' : ''}`} style={style} title={`${f.name}: ${f.totalSteps.toLocaleString('fi-FI')} askelta`}>
              <Avatar a={f} size={f.mine ? 30 : 24} stage={f.stageIdx} />
            </a>
          );
        })}
      </div>
      {gateOpen
        ? <p className="muted">🥂 Portti aukesi ja kaikki {sorted.length} keijua saapuivat Albertinkadulle yhdessä.</p>
        : leader && <p className="muted">Kärjessä <b>{leader.name}</b> ({leader.totalSteps.toLocaleString('fi-FI')} askelta){furthest ? <>, viimeisin etappi {furthest.emoji} {furthest.name}</> : null}.{atGate > 0 ? ` ${atGate} keijua odottaa jo portilla.` : ''} Portti aukeaa {gateDate ?? 'kisan päättyessä'}, ja silloin kaikki saapuvat yhdessä.</p>}
      <ol className="plain trail-list">
        {sorted.map((f, i) => {
          const p = Math.min(100, Math.round((effective(f.totalSteps, gateOpen) / JOURNEY_GOAL) * 100));
          return (
            <li key={f.id} className={f.mine ? 'me' : ''}>
              <span className="tl-pos">{i + 1}.</span>
              <a href={`/keiju/${f.id}`}>{f.name}{f.mine ? ' (sinä)' : ''}</a>
              <span className="tl-bar" aria-hidden="true"><i style={{ width: `${p}%` }} /></span>
              <span className="tl-pct">{p} %</span>
            </li>
          );
        })}
      </ol>
      <p className="muted">Polun pituus {JOURNEY_GOAL.toLocaleString('fi-FI')} askelta. Napauta avataria tai nimeä nähdäksesi keijun profiilin.</p>
    </section>
  );
}
