import type { Fairy } from './data';

export type Award = { emoji: string; title: string; winner: Fairy; value: string };

const n = (x: number) => x.toLocaleString('fi-FI');

/** Kisan palkinnot lasketaan datasta: voittaja on se, jolla on suurin arvo (ja arvo > 0). */
export function awards(board: Fairy[]): Award[] {
  const defs: { emoji: string; title: string; pick: (f: Fairy) => number; fmt: (v: number) => string }[] = [
    { emoji: '👑', title: 'Satakeijukaisten kuningatar', pick: (f) => f.pts, fmt: (v) => `${n(v)} pistettä` },
    { emoji: '👟', title: 'Kävelyn kuningatar', pick: (f) => f.totalSteps, fmt: (v) => `${n(v)} askelta` },
    { emoji: '🚀', title: 'Yhden päivän ennätys', pick: (f) => f.bestDay, fmt: (v) => `${n(v)} askelta` },
    { emoji: '🔥', title: 'Putkien kuningatar', pick: (f) => f.bestRun, fmt: (v) => `${v} päivää putkeen` },
    { emoji: '💪', title: 'Liikuntakeiju', pick: (f) => f.mins, fmt: (v) => `${n(v)} min` },
    { emoji: '💌', title: 'Kimalluksen keiju', pick: (f) => f.cheersTotal, fmt: (v) => `${v} kimallusta` },
  ];
  const out: Award[] = [];
  for (const d of defs) {
    let best: Fairy | null = null;
    for (const f of board) if (d.pick(f) > (best ? d.pick(best) : 0)) best = f;
    if (best) out.push({ emoji: d.emoji, title: d.title, winner: best, value: d.fmt(d.pick(best)) });
  }
  return out;
}
