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
