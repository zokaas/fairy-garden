import { JOURNEY_GOAL, STOPS } from '@/lib/garden';
import Avatar, { type AvatarData } from './Avatar';

const PTS: [number, number][] = [[8, 88], [60, 60], [120, 84], [180, 44], [240, 70], [292, 24]];

function at(f: number): [number, number] {
  const seg = Math.min(PTS.length - 2, Math.floor(f * (PTS.length - 1)));
  const t = f * (PTS.length - 1) - seg;
  return [PTS[seg][0] + (PTS[seg + 1][0] - PTS[seg][0]) * t, PTS[seg][1] + (PTS[seg + 1][1] - PTS[seg][1]) * t];
}

/** Haltijan polku: kokonaisaskeleet kuljettavat keijun kohti Albertinkatua. */
export default function Journey({ steps, avatar, stageIdx = 2, note }: { steps: number; avatar: AvatarData; stageIdx?: number; note?: string }) {
  const f = Math.min(1, steps / JOURNEY_GOAL);
  const [x, y] = at(f);
  const next = STOPS.find((s) => s.at > steps);
  const d = PTS.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
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
          return <span key={s.name} className={`stop ${steps >= s.at ? 'on' : ''}`} style={{ left: `${(sx / 300) * 100}%`, top: `${(sy / 110) * 100}%` }} title={s.name}>{s.emoji}</span>;
        })}
        <span className="walker" style={{ left: `${(x / 300) * 100}%`, top: `${(y / 110) * 100}%` }}><Avatar a={avatar} size={34} stage={stageIdx} /></span>
      </div>
      <p className="muted">
        {next ? <>Seuraava etappi: {next.emoji} <b>{next.name}</b>, vielä {(next.at - steps).toLocaleString('fi-FI')} askelta.</> : <>Perillä Albertinkadulla. Olet todellinen reippailija.</>}
      </p>
      {note && <p className="muted forecast">{note}</p>}
    </section>
  );
}

type Walker = AvatarData & { id: string; name: string; totalSteps: number; stageIdx: number; mine: boolean };

/** Yhteinen matka: kaikki keijut samalla polulla kisan askelten mukaan. */
export function GroupJourney({ fairies }: { fairies: Walker[] }) {
  const sorted = [...fairies].sort((a, b) => b.totalSteps - a.totalSteps);
  const leader = sorted[0];
  const arrived = sorted.filter((f) => f.totalSteps >= JOURNEY_GOAL).length;
  const d = PTS.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  const furthest = leader ? STOPS.filter((s) => leader.totalSteps >= s.at).pop() : null;
  return (
    <section className="card journey">
      <h2>Yhteinen matka Albertinkadulle</h2>
      <div className="trail group">
        <svg viewBox="0 0 300 110" preserveAspectRatio="none" aria-hidden="true">
          <path d={d} fill="none" stroke="var(--line-2)" strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {STOPS.map((s) => {
          const [sx, sy] = at(s.at / JOURNEY_GOAL);
          const reached = sorted.some((f) => f.totalSteps >= s.at);
          return <span key={s.name} className={`stop ${reached ? 'on' : ''}`} style={{ left: `${(sx / 300) * 100}%`, top: `${(sy / 110) * 100}%` }} title={s.name}>{s.emoji}</span>;
        })}
        {sorted.map((f, i) => {
          const [x, y] = at(Math.min(1, f.totalSteps / JOURNEY_GOAL));
          // pienet porrastukset, ettei samaan kohtaan osuvat avatarit peity kokonaan
          const dx = ((i % 3) - 1) * 5;
          const dy = (i % 2) * 6;
          return (
            <a key={f.id} href={`/keiju/${f.id}`} className={`walker mini ${f.mine ? 'me' : ''}`} style={{ left: `calc(${(x / 300) * 100}% + ${dx}px)`, top: `calc(${(y / 110) * 100}% + ${dy}px)`, zIndex: f.mine ? 5 : 2 }} title={`${f.name}: ${f.totalSteps.toLocaleString('fi-FI')} askelta`}>
              <Avatar a={f} size={f.mine ? 30 : 24} stage={f.stageIdx} />
            </a>
          );
        })}
      </div>
      {leader && <p className="muted">Kärjessä <b>{leader.name}</b> ({leader.totalSteps.toLocaleString('fi-FI')} askelta){furthest ? <>, viimeisin etappi {furthest.emoji} {furthest.name}</> : null}.{arrived > 0 ? ` ${arrived} keijua on jo perillä.` : ''}</p>}
      <ol className="plain trail-list">
        {sorted.map((f, i) => {
          const pct = Math.min(100, Math.round((f.totalSteps / JOURNEY_GOAL) * 100));
          return (
            <li key={f.id} className={f.mine ? 'me' : ''}>
              <span className="tl-pos">{i + 1}.</span>
              <a href={`/keiju/${f.id}`}>{f.name}{f.mine ? ' (sinä)' : ''}</a>
              <span className="tl-bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></span>
              <span className="tl-pct">{pct} %</span>
            </li>
          );
        })}
      </ol>
      <p className="muted">Polun pituus {JOURNEY_GOAL.toLocaleString('fi-FI')} askelta. Napauta avataria tai nimeä nähdäksesi keijun profiilin.</p>
    </section>
  );
}
