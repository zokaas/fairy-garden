import { dayBefore, helsinkiDay } from './garden.ts';

export type StepRow = { fairy_id: string; day: string; steps: number };
export type WorkRow = { fairy_id: string; day: string; sport: string; minutes: number; created_at?: string };

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

/** Etapit Helsingistä (tieväli, km, likimäärin). */
export const LANDMARKS = [
  ['Porvoo', 50], ['Lahti', 105], ['Tampere', 180], ['Jyväskylä', 270], ['Kuopio', 390], ['Oulu', 610],
  ['Rovaniemi', 830], ['Nuorgam', 1190], ['Pariisi', 2300], ['Rooma', 3000], ['maapallon ympäri', 40075],
] as const;

/** Missä kohtaa matkaa ollaan: viimeisin saavutettu etappi, seuraava ja matka sinne. */
export function route(distKm: number) {
  let reached: string | null = null;
  let prev = 0;
  for (const [name, d] of LANDMARKS) if (distKm >= d) { reached = name; prev = d; }
  const next = LANDMARKS.find(([, d]) => d > distKm) ?? null;
  return {
    reached,
    next: next ? next[0] : null,
    left: next ? next[1] - distKm : 0,
    pct: next ? Math.round(((distKm - prev) / (next[1] - prev)) * 100) : 100,
  };
}

/** Lyhyt teksti laattaan: "Lahti ✓ → Tampere 67 km". */
export function routeText(distKm: number): string {
  const r = route(distKm);
  const left = r.left >= 10 ? Math.round(r.left) : Math.round(r.left * 10) / 10;
  if (!r.next) return `${r.reached} ✓`;
  return `${r.reached ? `${r.reached} ✓ · ` : 'Helsinki · '}seuraava ${r.next}, ${String(left).replace('.', ',')} km`;
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

/* ===== Laajemmat tilastot ===== */

/** Kaikki päivät from..to (mukaan lukien), vanhin ensin. */
export function dayRange(from: string, to: string): string[] {
  const out: string[] = [];
  let d = to;
  for (let i = 0; i < 800 && d >= from; i++) {
    out.unshift(d);
    d = dayBefore(d);
  }
  return out;
}

export const cumulative = (v: number[]) => v.reduce<number[]>((a, x) => (a.push((a[a.length - 1] ?? 0) + x), a), []);

export function movingAvg(v: number[], n: number): number[] {
  return v.map((_, i) => {
    const s = v.slice(Math.max(0, i - n + 1), i + 1);
    return sum(s) / s.length;
  });
}

/** Päivien jakauma: [<5 000, 5 000–9 999, 10 000–14 999, 15 000+] (vain päivät, joilla on askelia). */
export function stepBuckets(dayTotals: number[]): number[] {
  const b = [0, 0, 0, 0];
  for (const v of dayTotals) {
    if (v <= 0) continue;
    b[v < 5000 ? 0 : v < 10000 ? 1 : v < 15000 ? 2 : 3]++;
  }
  return b;
}

/** Arkipäivien ja viikonloppujen keskiarvo (vain aktiiviset päivät). */
export function weekdayVsWeekend(rows: { day: string; steps: number }[]) {
  const wk: number[] = [], we: number[] = [];
  for (const [day, steps] of byDay(rows)) {
    if (steps <= 0) continue;
    const wd = (new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7;
    (wd >= 5 ? we : wk).push(steps);
  }
  const avg = (a: number[]) => (a.length ? Math.round(sum(a) / a.length) : 0);
  return { weekday: avg(wk), weekend: avg(we) };
}

/** Viikkosummat (viikon alku -> askeleet). */
export function weeklyTotals(rows: { day: string; steps: number }[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const [day, steps] of byDay(rows)) {
    const d = new Date(`${day}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    const w = d.toISOString().slice(0, 10);
    m.set(w, (m.get(w) ?? 0) + steps);
  }
  return m;
}

export function bestOf(m: Map<string, number>): { key: string; value: number } | null {
  let best: { key: string; value: number } | null = null;
  for (const [key, value] of m) if (!best || value > best.value) best = { key, value };
  return best;
}

/** Kuukausisummat: "2026-10" -> {steps, days, mins}. */
export function monthly(steps: { day: string; steps: number }[], work: { day: string; minutes: number }[]) {
  const m = new Map<string, { month: string; steps: number; days: number; mins: number }>();
  const get = (k: string) => m.get(k) ?? (m.set(k, { month: k, steps: 0, days: 0, mins: 0 }), m.get(k)!);
  for (const [day, s] of byDay(steps)) { if (s > 0) { const r = get(day.slice(0, 7)); r.steps += s; r.days++; } }
  for (const w of work) get(w.day.slice(0, 7)).mins += w.minutes;
  return [...m.values()].sort((a, b) => a.month.localeCompare(b.month));
}

/** Päiväkartta: sarakkeet = viikot (vanhin ensin), rivit ma–su. Tulevat päivät null. */
export function heatCells(rows: { day: string; steps: number }[], weeks: number, today = helsinkiDay()) {
  const m = byDay(rows);
  const d = new Date(`${today}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); // tämän viikon maanantai
  d.setUTCDate(d.getUTCDate() - 7 * (weeks - 1));
  const cols: ({ day: string; steps: number } | null)[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: ({ day: string; steps: number } | null)[] = [];
    for (let k = 0; k < 7; k++) {
      const day = d.toISOString().slice(0, 10);
      col.push(day > today ? null : { day, steps: m.get(day) ?? 0 });
      d.setUTCDate(d.getUTCDate() + 1);
    }
    cols.push(col);
  }
  return cols;
}

/** Kertyvät pisteet päivittäin (1 p / 2 500 askelta + 1 p / 30 min), annetuilla päivillä. */
export function pointsOverTime(steps: { day: string; steps: number }[], work: { day: string; minutes: number }[], days: string[]): number[] {
  const s = byDay(steps);
  const w = new Map<string, number>();
  for (const r of work) w.set(r.day, (w.get(r.day) ?? 0) + r.minutes);
  let cs = 0, cm = 0;
  // ennen jakson alkua kertynyt
  for (const [d, v] of s) if (d < days[0]) cs += v;
  for (const [d, v] of w) if (d < days[0]) cm += v;
  return days.map((d) => {
    cs += s.get(d) ?? 0;
    cm += w.get(d) ?? 0;
    return Math.floor(cs / 2500) + Math.floor(cm / 30);
  });
}

/** Kirjausajan jakauma vuorokaudenajoittain (Helsingin aika): [aamu 5–11, päivä 11–17, ilta 17–22, yö 22–5]. */
export function timeOfDay(rows: { created_at?: string; minutes: number }[]): number[] {
  const b = [0, 0, 0, 0];
  for (const r of rows) {
    if (!r.created_at) continue;
    const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Helsinki', hour: '2-digit', hour12: false }).format(new Date(r.created_at))) % 24;
    b[h >= 5 && h < 11 ? 0 : h >= 11 && h < 17 ? 1 : h >= 17 && h < 22 ? 2 : 3] += r.minutes;
  }
  return b;
}
