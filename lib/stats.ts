import { dayBefore, helsinkiDay } from './garden.ts';

export type StepRow = { fairy_id: string; day: string; steps: number };
export type WorkRow = { fairy_id: string; day: string; sport: string; minutes: number };

export const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
export const km = (steps: number) => steps * 0.00075;

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000) + 1;
}

/** Yhdistää rivit päiviksi (summa per päivä). */
export function byDay(rows: { day: string; steps: number }[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.day, (m.get(r.day) ?? 0) + r.steps);
  return m;
}

/** Viimeiset n päivää (vanhin ensin), puuttuvat päivät nollana. */
export function series(rows: { day: string; steps: number }[], n: number, today = helsinkiDay()) {
  const m = byDay(rows);
  const out: { day: string; steps: number }[] = [];
  let d = today;
  for (let i = 0; i < n; i++) {
    out.unshift({ day: d, steps: m.get(d) ?? 0 });
    d = dayBefore(d);
  }
  return out;
}

/** Keskiarvo viikonpäivää kohti (ma = 0), vain päivistä, joilla on askelia. */
export function weekdayAvg(rows: { day: string; steps: number }[]): number[] {
  const tot = Array(7).fill(0), cnt = Array(7).fill(0);
  for (const [day, steps] of byDay(rows)) {
    if (steps <= 0) continue;
    const wd = (new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7;
    tot[wd] += steps;
    cnt[wd]++;
  }
  return tot.map((t, i) => (cnt[i] ? Math.round(t / cnt[i]) : 0));
}

export function sportStats(rows: { sport: string; minutes: number }[]) {
  const m = new Map<string, { sport: string; minutes: number; sessions: number }>();
  for (const r of rows) {
    const c = m.get(r.sport) ?? { sport: r.sport, minutes: 0, sessions: 0 };
    c.minutes += r.minutes;
    c.sessions++;
    m.set(r.sport, c);
  }
  return [...m.values()].sort((a, b) => b.minutes - a.minutes);
}

/** Viimeiset 7 päivää vs edelliset 7 päivää. */
export function trend(rows: { day: string; steps: number }[], today = helsinkiDay()) {
  const s = series(rows, 14, today);
  const prev = sum(s.slice(0, 7).map((x) => x.steps));
  const last = sum(s.slice(7).map((x) => x.steps));
  return { last, prev, pct: prev > 0 ? Math.round(((last - prev) / prev) * 100) : null };
}

/** Viikkojen minuutit (viimeiset n viikkoa, vanhin ensin) viikon alun mukaan. */
export function weeklyMinutes(rows: { day: string; minutes: number }[], n: number, thisWeekStart: string) {
  const out: { day: string; minutes: number }[] = [];
  let w = thisWeekStart;
  for (let i = 0; i < n; i++) {
    out.unshift({ day: w, minutes: 0 });
    w = dayBefore(dayBefore(dayBefore(dayBefore(dayBefore(dayBefore(dayBefore(w)))))));
  }
  for (const r of rows) {
    for (let i = out.length - 1; i >= 0; i--) {
      if (r.day >= out[i].day) { out[i].minutes += r.minutes; break; }
    }
  }
  return out;
}

const LANDMARKS = [
  ['Helsinki–Tampere', 180],
  ['Helsinki–Rovaniemi', 830],
  ['Helsinki–Pariisi', 1900],
  ['Helsinki–New York', 6600],
  ['maapallon ympäri', 40075],
  ['matkan Kuuhun', 384400],
] as const;

/** Hauska vertailu: "2,3 × Helsinki–Rovaniemi". */
export function compare(distKm: number): string {
  let pick: (typeof LANDMARKS)[number] = LANDMARKS[0];
  for (const l of LANDMARKS) if (distKm >= l[1]) pick = l;
  const v = distKm / pick[1];
  return v < 1 ? `${Math.round(v * 100)} % matkasta ${pick[0]}` : `${v.toFixed(1).replace('.', ',')} × ${pick[0]}`;
}

/** Viikkojen askeleet (viimeiset n viikkoa, vanhin ensin) viikon alun mukaan. */
export function weeklySteps(rows: { day: string; steps: number }[], n: number, thisWeekStart: string) {
  const out: { day: string; steps: number }[] = [];
  let w = thisWeekStart;
  for (let i = 0; i < n; i++) {
    out.unshift({ day: w, steps: 0 });
    for (let k = 0; k < 7; k++) w = dayBefore(w);
  }
  for (const [day, steps] of byDay(rows)) {
    for (let i = out.length - 1; i >= 0; i--) {
      if (day >= out[i].day) { out[i].steps += steps; break; }
    }
  }
  return out;
}
