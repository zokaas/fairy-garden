import { CONTEST_START, JOURNEY_GATE, STOPS, helsinkiDay } from './garden.ts';

const dayMs = 86_400_000;
const num = (d: string) => Math.floor(Date.parse(`${d}T00:00:00Z`) / dayMs);
const addDays = (d: string, n: number) => new Date((num(d) + n) * dayMs).toISOString().slice(0, 10);
const fmtDay = (d: string) => `${Number(d.slice(8))}.${Number(d.slice(5, 7))}.`;
const fi = (n: number) => Math.round(n).toLocaleString('fi-FI');

export type Forecast = { text: string; onTrack: boolean; finish: string | null; perDay: number; needed: number };

/**
 * Ennuste portille (Gaalan portti): keskiarvo = askeleet / päivät kisan alusta (tämä päivä mukana).
 * Portti aukeaa kisan päättyessä (endDay = kisan viimeinen päivä, YYYY-MM-DD), ja silloin kaikki saapuvat Albertinkadulle yhdessä.
 */
export function forecast(totalSteps: number, today: string, endDay: string, goal = JOURNEY_GATE): Forecast | null {
  const days = Math.max(1, num(today) - num(CONTEST_START) + 1);
  const perDay = totalSteps / days;
  const remaining = goal - totalSteps;
  const leftDays = Math.max(0, num(endDay) - num(today));
  const dest = STOPS[STOPS.length - 1].name;
  if (remaining <= 0) return { text: `Olet jo Gaalan portilla! Portti aukeaa ${fmtDay(endDay)}, ja silloin kaikki saapuvat yhdessä paikkaan ${dest} 🥂`, onTrack: true, finish: null, perDay, needed: 0 };
  if (totalSteps <= 0 || perDay <= 0) return null;
  const finish = addDays(today, Math.ceil(remaining / perDay));
  const needed = leftDays > 0 ? remaining / leftDays : remaining;
  const onTrack = finish <= endDay;
  const text = onTrack
    ? `Tällä tahdilla (${fi(perDay)} askelta / pv) olet Gaalan portilla noin ${fmtDay(finish)} ✓. Portti aukeaa ${fmtDay(endDay)}, ja silloin kaikki saapuvat yhdessä paikkaan ${dest}.`
    : `Tällä tahdilla (${fi(perDay)} askelta / pv) ehtisit portille vasta noin ${fmtDay(finish)}. Portti aukeaa ${fmtDay(endDay)}, ja silloin kaikki saapuvat yhdessä paikkaan ${dest}: kukaan ei jää taakse 🌟 (portille ehtimiseen tarvitaan noin ${fi(needed)} askelta / pv).`;
  return { text, onTrack, finish, perDay, needed };
}
