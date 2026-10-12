export const EVENT_DATE = '2026-11-28T16:00:00+02:00';
export const SPORTS = ['Kävely', 'Juoksu', 'Pyöräily', 'Sali', 'Jooga', 'Tanssi', 'Uinti', 'Muu'] as const;

export const STAGES = [
  { min: 0, name: 'Siemen', emoji: '🌰' },
  { min: 10_000, name: 'Itu', emoji: '🌱' },
  { min: 50_000, name: 'Silmu', emoji: '🌷' },
  { min: 100_000, name: 'Kukka', emoji: '🌸' },
  { min: 250_000, name: 'Keiju', emoji: '🧚🏼‍♀️' },
  { min: 500_000, name: 'Keijukuningatar', emoji: '👑' },
] as const;

/** 1 piste / 1 000 askelta + 1 piste / 10 min liikuntaa. */
export function points(steps: number, workoutMinutes: number): number {
  return Math.floor(steps / 1000) + Math.floor(workoutMinutes / 10);
}

export function stageFor(points: number) {
  let idx = 0;
  STAGES.forEach((s, i) => {
    if (points >= s.min / 1000) idx = i;
  });
  const cur = STAGES[idx];
  const next = STAGES[idx + 1] ?? null;
  const pct = next ? Math.min(100, ((points - cur.min / 1000) / ((next.min - cur.min) / 1000)) * 100) : 100;
  return { stage: cur, next, pct };
}

/** Päivämäärä Helsingin ajassa muodossa YYYY-MM-DD. */
export function helsinkiDay(d = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Helsinki' }).format(d);
}

export function isDay(s: unknown): s is string {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

export const DAILY_GOAL = 10_000;
export const ACTIVE_DAY = 5_000;

/** Peräkkäisten aktiivisten päivien määrä. Tämä päivä ei katkaise putkea, vaikka se olisi vielä kesken. */
export function streak(days: { day: string; steps: number }[], today = helsinkiDay()): number {
  const active = new Set(days.filter((d) => d.steps >= ACTIVE_DAY).map((d) => d.day));
  let n = 0;
  const d = new Date(`${today}T12:00:00Z`);
  if (!active.has(today)) d.setUTCDate(d.getUTCDate() - 1);
  while (active.has(d.toISOString().slice(0, 10))) {
    n++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return n;
}
