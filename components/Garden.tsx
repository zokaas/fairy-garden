import { STAGES } from '@/lib/garden';
import Avatar, { type AvatarData } from './Avatar';

const FLOWERS = ['🌸', '🌷', '🌼', '🌺', '🌻', '💮', '🪻'];

/** Puutarha kasvaa pisteiden mukana: yksi kukka / piste (max 40). Sijainti on deterministinen. */
export default function Garden({ pts, stageIdx, name, avatar }: { pts: number; stageIdx: number; name?: string; avatar?: AvatarData }) {
  const n = Math.min(40, pts);
  const flowers = Array.from({ length: n }, (_, i) => {
    const r = (i * 9301 + 49297) % 233280;
    const x = 4 + ((r / 233280) * 92);
    const row = i % 3;
    return { i, x, bottom: 6 + row * 11, size: 20 + (i % 4) * 4, e: FLOWERS[i % FLOWERS.length], delay: (i % 7) * 0.35 };
  });
  return (
    <div className="garden" role="img" aria-label={`Puutarha, ${pts} pistettä`}>
      <div className="sun">☀️</div>
      <div className="cloud c1">☁️</div>
      <div className="cloud c2">☁️</div>
      <span className="bfly b1">🦋</span>
      <span className="bfly b2">🦋</span>
      <div className="meadow" />
      {flowers.map((f) => (
        <span key={f.i} className="flower" style={{ left: `${f.x}%`, bottom: `${f.bottom}%`, fontSize: f.size, animationDelay: `${f.delay}s` }}>
          {f.e}
        </span>
      ))}
      {n === 0 && <span className="flower seed" style={{ left: '46%', bottom: '14%', fontSize: 30 }}>🌰</span>}
      {avatar ? (
        <div className="fairy av"><Avatar a={avatar} size={72} badge={STAGES[stageIdx].emoji} /></div>
      ) : (
        <div className="fairy">{STAGES[stageIdx].emoji}</div>
      )}
      {name && <div className="gname">{name}</div>}
    </div>
  );
}
