import { CONTEST_START, JOURNEY_GOAL, STOPS, helsinkiDay } from './garden.ts';

const dayMs = 86_400_000;
const num = (d: string) => Math.floor(Date.parse(`${d}T00:00:00Z`) / dayMs);
const addDays = (d: string, n: number) => new Date((num(d) + n) * dayMs).toISOString().slice(0, 10);
const fmtDay = (d: string) => `${Number(d.slice(8))}.${Number(d.slice(5, 7))}.`;
const fi = (n: number) => Math.round(n).toLocaleString('fi-FI');

export type Forecast = { text: string; onTrack: boolean; finish: string | null; perDay: number; needed: number };

/**
 * Ennuste matkan päätepisteelle: keskiarvo = askeleet / päivät kisan alusta (tämä päivä mukana).
 * endDay on kisan viimeinen päivä (YYYY-MM-DD).
 */
export function forecast(totalSteps: number, today: string, endDay: string, goal = JOURNEY_GOAL): Forecast | null {
  const days = Math.max(1, num(today) - num(CONTEST_START) + 1);
  const perDay = totalSteps / days;
  const remaining = goal - totalSteps;
  const leftDays = Math.max(0, num(endDay) - num(today));
  if (remaining <= 0) return { text: `Olet jo perillä: ${STOPS[STOPS.length - 1].name} saavutettu! 🥂`, onTrack: true, finish: null, perDay, needed: 0 };
  if (totalSteps <= 0 || perDay <= 0) return null;
  const finish = addDays(today, Math.ceil(remaining / perDay));
  const needed = leftDays > 0 ? remaining / leftDays : remaining;
  const onTrack = finish <= endDay;
  const name = STOPS[STOPS.length - 1].name;
  const text = onTrack
    ? `Tällä tahdilla (${fi(perDay)} askelta / pv) saavutat paikan ${name} noin ${fmtDay(finish)} ✓`
    : `Tällä tahdilla (${fi(perDay)} askelta / pv) paikka ${name} jää haaveeksi. Tarvitset noin ${fi(needed)} askelta / pv ${fmtDay(endDay)} mennessä.`;
  return { text, onTrack, finish, perDay, needed };
}

export const todayHelsinki = () => helsinkiDay();
