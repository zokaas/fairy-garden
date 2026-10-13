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
