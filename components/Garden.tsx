import { STAGES, type Phase } from '@/lib/garden';
import Avatar, { type AvatarData } from './Avatar';
import GardenFx from './GardenFx';
import FairyFigure from './FairyFigure';

const COLORS = ['#d4527f', '#e8869f', '#9c7bd6', '#e9b44c', '#c2415f', '#7aa7e0'];
const TYPES = ['tulip', 'daisy', 'bell', 'rose'];

/** Piirretty puutarhamaisema: kukkia kasvaa yksi pistettä kohti (max 40), taivas seuraa kellonaikaa, tasot tuovat mökin, sateenkaaren ja linnan. */
export default function Garden({ pts, stageIdx, name, avatar, phase = 'day', lines = [] }: {
  pts: number; stageIdx: number; name?: string; avatar?: AvatarData; phase?: Phase; lines?: string[];
}) {
  const n = Math.min(40, pts);
  const night = phase === 'night';
  const flowers = Array.from({ length: n }, (_, i) => {
    const r = ((i * 9301 + 49297) % 233280) / 233280;
    const row = i % 3;
    return { i, x: 12 + r * 376, y: 214 + row * 13 + (r * 7) % 5, s: 1.05 + ((i * 7) % 5) * 0.14, type: TYPES[i % 4], color: COLORS[(i * 5) % COLORS.length], d: (i % 7) * 0.4 };
  }).sort((a, b) => a.y - b.y);

  return (
    <GardenFx phase={phase} lines={lines}>
      <svg className="scene" viewBox="0 0 400 250" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <radialGradient id="glow"><stop offset="0" stopColor="#fff6c8" stopOpacity=".95" /><stop offset="1" stopColor="#fff6c8" stopOpacity="0" /></radialGradient>
          <g id="tulip"><path d="M0 0V-26" stroke="#3f8a67" strokeWidth="2" fill="none" /><path d="M0 -8C-9 -9 -9 -17 -6 -19C-3 -15 -1 -12 0 -8Z" fill="#4c9a76" /><path d="M-7 -26C-9 -38 -3 -41 0 -34C3 -41 9 -38 7 -26C3 -23 -3 -23 -7 -26Z" fill="currentColor" /></g>
          <g id="daisy"><path d="M0 0V-24" stroke="#3f8a67" strokeWidth="2" fill="none" /><g transform="translate(0 -28)" fill="#fffaf0">{Array.from({ length: 8 }, (_, k) => <ellipse key={k} cx="0" cy="-6.5" rx="2.6" ry="5" transform={`rotate(${k * 45})`} />)}<circle r="3.4" fill="currentColor" /></g></g>
          <g id="bell"><path d="M0 0C0 -14 3 -22 8 -29" stroke="#3f8a67" strokeWidth="2" fill="none" /><path d="M3 -29C2 -40 15 -40 14 -29C14 -26 3 -26 3 -29Z" fill="currentColor" /><path d="M5 -27h7" stroke="#fffaf0" strokeOpacity=".5" /></g>
          <g id="rose"><path d="M0 0V-22" stroke="#3f8a67" strokeWidth="2" fill="none" /><circle cx="0" cy="-27" r="7.5" fill="currentColor" /><circle cx="0" cy="-27" r="4.8" fill="#000" fillOpacity=".14" /><circle cx="0" cy="-27" r="2.4" fill="currentColor" /><path d="M-3 -9C-9 -10 -9 -16 -7 -17" stroke="#3f8a67" fill="none" /></g>
          <g id="shroom"><rect x="-2.2" y="-8" width="4.4" height="8" rx="1.6" fill="#f5ead3" /><path d="M-9 -8C-9 -17 9 -17 9 -8Z" fill="#c64a63" /><circle cx="-3" cy="-12" r="1.4" fill="#fffaf0" /><circle cx="3.5" cy="-11" r="1.1" fill="#fffaf0" /></g>
        </defs>

        {night ? (
          <>
            {Array.from({ length: 22 }, (_, i) => <circle key={i} className="twk" cx={(i * 53) % 396 + 6} cy={(i * 31) % 110 + 8} r={i % 4 === 0 ? 1.4 : 0.8} fill="#fff6d6" style={{ animationDelay: `${(i % 6) * 0.5}s` }} />)}
            <circle cx="338" cy="52" r="46" fill="url(#glow)" />
            <path d="M338 30a22 22 0 1 0 14 38 18 18 0 1 1 -14 -38z" fill="#fff3c4" />
          </>
        ) : (
          <>
            <circle cx={phase === 'day' ? 330 : 320} cy={phase === 'day' ? 50 : 118} r="64" fill="url(#glow)" />
            <circle cx={phase === 'day' ? 330 : 320} cy={phase === 'day' ? 50 : 118} r="17" fill={phase === 'dusk' ? '#f6b36a' : '#fbd774'} />
          </>
        )}

        {stageIdx >= 4 && [0, 1, 2, 3].map((k) => <path key={k} d={`M${54 + k * 7} 150A${46 - k * 7} ${46 - k * 7} 0 0 1 ${146 - k * 7} 150`} fill="none" stroke={['#e98f9f', '#f2c47d', '#a9d6b2', '#a3bff0'][k]} strokeWidth="6" opacity={night ? 0.3 : 0.6} />)}
        {stageIdx >= 5 && (
          <g transform="translate(312 96)">
            <rect x="-26" y="4" width="52" height="38" fill="#e9dcf5" /><rect x="-30" y="-8" width="14" height="50" fill="#d9c6ee" /><rect x="16" y="-8" width="14" height="50" fill="#d9c6ee" />
            <path d="M-32 -8L-23 -26L-14 -8Z" fill="#8a56a8" /><path d="M14 -8L23 -26L32 -8Z" fill="#8a56a8" /><path d="M-8 4L0 -16L8 4Z" fill="#8a56a8" />
            <path d="M0 -16V-30" stroke="#c9a24a" strokeWidth="1.4" /><path d="M0 -30l9 3-9 3z" fill="#d4527f" />
            <path d="M-6 42V28a6 6 0 0112 0v14z" fill="#8a56a8" /><circle cx="-23" cy="12" r="2" fill="#f2c47d" /><circle cx="23" cy="12" r="2" fill="#f2c47d" />
          </g>
        )}

        <path className="h1" d="M0 150C60 126 120 146 200 134S340 124 400 142V250H0Z" />
        {[28, 70, 150, 232, 366].map((x, i) => (
          <g key={x} transform={`translate(${x} ${i % 2 ? 148 : 146})`}>
            <rect x="-1.6" y="-8" width="3.2" height="12" fill="#6d5640" />
            <ellipse cx="0" cy="-17" rx={9 + (i % 3) * 2} ry={13 + (i % 2) * 3} className="tree" />
          </g>
        ))}
        <path className="h2" d="M0 186C80 164 160 192 240 176S360 170 400 182V250H0Z" />
        {stageIdx >= 3 && (
          <g transform="translate(52 182)">
            <rect x="-16" y="-20" width="32" height="20" fill="#fbf1d6" stroke="#cfae62" strokeWidth=".8" />
            <path d="M-20 -20L0 -36L20 -20Z" fill="#7a3f8c" /><rect x="9" y="-34" width="5" height="9" fill="#c9a24a" />
            <rect x="-4" y="-12" width="8" height="12" rx="4" fill="#c9a24a" /><rect x="-13" y="-16" width="6" height="6" fill="#9fc8e8" /><rect x="7" y="-16" width="6" height="6" fill="#9fc8e8" />
          </g>
        )}
        <path className="h3" d="M0 218C100 198 200 228 300 208S380 204 400 210V250H0Z" />
        {stageIdx >= 2 && [[96, 232, 1.1], [112, 238, 0.8], [270, 236, 1], [286, 232, 0.75], [304, 240, 0.9]].map(([x, y, s], i) => <g key={i} transform={`translate(${x} ${y}) scale(${s})`}><use href="#shroom" /></g>)}

        {flowers.map((f) => (
          <g key={f.i} transform={`translate(${f.x} ${f.y}) scale(${f.s})`}>
            <g className="sway" style={{ animationDelay: `${f.d}s`, color: f.color }}><use href={`#${f.type}`} /></g>
          </g>
        ))}
        {n === 0 && <g transform="translate(200 232)"><ellipse rx="9" ry="5" fill="#8b6a46" /><path d="M0 -3V-12" stroke="#3f8a67" strokeWidth="2" /></g>}
        {night && [60, 150, 250, 340].map((x, i) => <circle key={x} className="ff" cx={x} cy={170 + (i % 2) * 24} r="2.4" fill="#fff7a8" style={{ animationDelay: `${i * 0.9}s` }} />)}
      </svg>

      <span className="bfly b1" /><span className="bfly b2" />
      {avatar ? <div className="fairy av"><Avatar a={avatar} size={76} badge={STAGES[stageIdx].emoji} stage={stageIdx} /></div> : <div className="fairy fig"><FairyFigure stage={stageIdx} size={84} /></div>}
      {name && <div className="gname">{name}</div>}
    </GardenFx>
  );
}
