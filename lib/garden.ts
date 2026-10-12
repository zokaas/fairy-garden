export const EVENT_DATE = '2026-11-28T16:00:00+02:00';
export const SPORTS = ['Sali', 'Lenkkeily', 'Juoksu', 'Pyöräily', 'Laskettelu', 'Hiihto', 'Lentopallo', 'Tribe', 'Pilates', 'Tennis', 'Jooga', 'Tanssi', 'Uinti', 'Muu urheilu'] as const;
export const CREATIVE = ['Piirtäminen', 'Virkkaaminen', 'Lukeminen', 'Soittaminen', 'Ompelu', 'Maalaus', 'Kirjoittaminen', 'Muu luova'] as const;
export type Kind = 'urheilu' | 'luova';
/** Laji kuuluu luoviin harrastuksiin tai (oletuksena) urheiluun. */
export const kindOf = (sport: string): Kind => ((CREATIVE as readonly string[]).includes(sport) ? 'luova' : 'urheilu');

/** Tasot pisteinä (1 p = 2 500 askelta tai 30 min urheilua). */
export const STAGES = [
  { pts: 0, name: 'Siemen', emoji: '🌰' },
  { pts: 5, name: 'Itu', emoji: '🌱' },
  { pts: 25, name: 'Silmu', emoji: '🌷' },
  { pts: 60, name: 'Kukka', emoji: '🌸' },
  { pts: 110, name: 'Keiju', emoji: '🧚🏼‍♀️' },
  { pts: 170, name: 'Keijukuningatar', emoji: '👑' },
] as const;

export const STEPS_PER_POINT = 2500;
export const MINUTES_PER_POINT = 30;

/** Askelpisteet: 1 piste / 2 500 askelta. */
export const stepPoints = (steps: number) => Math.floor(steps / STEPS_PER_POINT);

/** Urheilupisteet: 1 piste / 30 min. */
export const sportPoints = (workoutMinutes: number) => Math.floor(workoutMinutes / MINUTES_PER_POINT);

export function points(steps: number, workoutMinutes: number): number {
  return stepPoints(steps) + sportPoints(workoutMinutes);
}

export function stageFor(points: number) {
  let idx = 0;
  STAGES.forEach((s, i) => {
    if (points >= s.pts) idx = i;
  });
  const cur = STAGES[idx];
  const next = STAGES[idx + 1] ?? null;
  const pct = next ? Math.min(100, ((points - cur.pts) / (next.pts - cur.pts)) * 100) : 100;
  return { stage: cur, next, pct, idx };
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

export function dayBefore(day: string): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Pisin aktiivisten päivien putki koko ajalta. */
export function bestStreak(days: { day: string; steps: number }[]): number {
  const act = days.filter((d) => d.steps >= ACTIVE_DAY).map((d) => d.day).sort();
  let best = 0, cur = 0, prev = '';
  for (const d of act) {
    cur = prev && dayBefore(d) === prev ? cur + 1 : 1;
    best = Math.max(best, cur);
    prev = d;
  }
  return best;
}

/** "nyt", "5 min sitten", "3 t sitten", "2 pv sitten" */
export function ago(iso: string | null, now = Date.now()): string {
  if (!iso) return 'ei vielä synkattu';
  const m = Math.max(0, Math.round((now - Date.parse(iso)) / 60000));
  if (m < 2) return 'juuri nyt';
  if (m < 60) return `${m} min sitten`;
  if (m < 60 * 24) return `${Math.round(m / 60)} t sitten`;
  return `${Math.round(m / 1440)} pv sitten`;
}

export type Phase = 'night' | 'dawn' | 'day' | 'dusk';
/** Vuorokaudenaika Helsingin ajassa: puutarhan taivas muuttuu sen mukaan. */
export function phaseOf(d = new Date()): Phase {
  const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Helsinki', hour: '2-digit', hour12: false }).format(d)) % 24;
  if (h >= 22 || h < 5) return 'night';
  if (h < 9) return 'dawn';
  if (h < 18) return 'day';
  return 'dusk';
}

/** Haltijan polku: matka kotipuutarhasta Albertinkadulle askelilla mitattuna. */
export const JOURNEY_GOAL = 200_000;
export const STOPS = [
  { at: 0, emoji: '🏡', name: 'Kotipuutarha' },
  { at: 25_000, emoji: '🍄', name: 'Sienimetsä' },
  { at: 60_000, emoji: '🌼', name: 'Kukkaniitty' },
  { at: 100_000, emoji: '🌊', name: 'Kimalteleva joki' },
  { at: 150_000, emoji: '🏰', name: 'Keijukuninkaan portti' },
  { at: 200_000, emoji: '🥂', name: 'Albertinkatu' },
] as const;

const NAMES_A = ['Kimalteleva', 'Hulmuava', 'Unelias', 'Utuinen', 'Hurmaava', 'Pilvenhattara', 'Karamellinen', 'Sumuinen', 'Tähtipölyinen', 'Pyörremyrsky'];
const NAMES_B = ['Kielo', 'Perhonen', 'Sienikuningatar', 'Orvokki', 'Kastepisara', 'Lumikello', 'Ruiskaunokki', 'Mesikämmen', 'Pääskynen', 'Villiruusu'];
export function fairyName(r1 = Math.random(), r2 = Math.random()): string {
  return `${NAMES_A[Math.floor(r1 * NAMES_A.length)]} ${NAMES_B[Math.floor(r2 * NAMES_B.length)]}`;
}

/** Viikon maanantai (Helsingin aikaa) annetulle päivälle. */
export function weekStart(day = helsinkiDay()): string {
  const d = new Date(`${day}T12:00:00Z`);
  const wd = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - wd);
  return d.toISOString().slice(0, 10);
}

