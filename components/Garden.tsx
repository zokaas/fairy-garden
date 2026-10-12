import { STAGES, type Phase } from '@/lib/garden';
import Avatar, { type AvatarData } from './Avatar';
import GardenFx from './GardenFx';

const FLOWERS = ['🌸', '🌷', '🌼', '🌺', '🌻', '💮', '🪻'];

/** Puutarha kasvaa pisteiden mukana, taivas seuraa kellonaikaa ja maisema rikastuu tasojen mukana. */
export default function Garden({ pts, stageIdx, name, avatar, phase = 'day', lines = [] }: {
  pts: number; stageIdx: number; name?: string; avatar?: AvatarData; phase?: Phase; lines?: string[];
}) {
  const n = Math.min(40, pts);
  const flowers = Array.from({ length: n }, (_, i) => {
    const r = (i * 9301 + 49297) % 233280;
    return { i, x: 4 + (r / 233280) * 92, bottom: 6 + (i % 3) * 11, size: 20 + (i % 4) * 4, e: FLOWERS[i % FLOWERS.length], delay: (i % 7) * 0.35 };
  });
  const night = phase === 'night';
  return (
    <GardenFx phase={phase} lines={lines}>
      {night ? <div className="sun">🌙</div> : <div className="sun">{phase === 'day' ? '☀️' : '🌅'}</div>}
      {night && Array.from({ length: 14 }, (_, i) => (
        <span key={i} className="star" style={{ left: `${(i * 53) % 96}%`, top: `${(i * 29) % 45}%`, animationDelay: `${(i % 5) * 0.6}s` }}>✦</span>
      ))}
      {!night && <><div className="cloud c1">☁️</div><div className="cloud c2">☁️</div></>}
      {stageIdx >= 5 && <div className="deco castle">🏰</div>}
      {stageIdx >= 4 && <div className="deco rainbow">🌈</div>}
      <span className="bfly b1">{night ? '✨' : '🦋'}</span>
      <span className="bfly b2">{night ? '✨' : '🦋'}</span>
      {night && [12, 38, 64, 82].map((x, i) => <span key={x} className="firefly" style={{ left: `${x}%`, bottom: `${22 + (i % 2) * 14}%`, animationDelay: `${i * 0.9}s` }} />)}
      <div className="meadow" />
      {stageIdx >= 2 && (
        <div className="shrooms">{['🍄', '🍄', '🍄', '🍄', '🍄'].map((m, i) => <span key={i} style={{ fontSize: 16 + (i % 2) * 6 }}>{m}</span>)}</div>
      )}
      {stageIdx >= 3 && <div className="deco cottage">🏡</div>}
      {flowers.map((f) => (
        <span key={f.i} className="flower" style={{ left: `${f.x}%`, bottom: `${f.bottom}%`, fontSize: f.size, animationDelay: `${f.delay}s` }}>{f.e}</span>
      ))}
      {n === 0 && <span className="flower seed" style={{ left: '46%', bottom: '14%', fontSize: 30 }}>🌰</span>}
      {avatar ? (
        <div className="fairy av"><Avatar a={avatar} size={72} badge={STAGES[stageIdx].emoji} /></div>
      ) : (
        <div className="fairy">{STAGES[stageIdx].emoji}</div>
      )}
      {name && <div className="gname">{name}</div>}
    </GardenFx>
  );
}
