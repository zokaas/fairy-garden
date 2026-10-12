import { dayBefore, helsinkiDay, isDay } from './garden.ts';

export type DayEntry = { day: string; steps: number };

const clean = (v: unknown): number => {
  if (typeof v === 'number') return Math.round(v);
  let s = String(v ?? '').replace(/[\s\u00a0\u202f]/g, '');
  // Englanninkielinen tuhaterotin "8,234" -> 8234; suomalainen desimaalipilkku "8234,5" -> 8234.5
  s = /^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s) ? s.replace(/,/g, '') : s.replace(',', '.');
  return Math.round(Number(s));
};

/**
 * Muuntaa oikotien lähettämät päivät listaksi. Tukee kolmea muotoa:
 *  - { days: [{ day: "2026-10-09", steps: 8234 }, ...] }
 *  - { lines: "2026-10-09=8234\n2026-10-08=7120" } (rivit tai pilkuilla/puolipisteillä erotettuna)
 *  - { steps: 8234, day?: "2026-10-09" } (vain tämä päivä)
 * Hylkää tulevat ja yli 14 päivää vanhat päivät sekä mahdottomat luvut. Samalle päivälle jää suurin arvo.
 */
export function parseDays(body: { days?: unknown; lines?: unknown; steps?: unknown; day?: unknown }, today = helsinkiDay()): DayEntry[] {
  const raw: { day: unknown; steps: unknown }[] = [];
  if (Array.isArray(body.days)) for (const d of body.days) raw.push({ day: (d as { day?: unknown })?.day, steps: (d as { steps?: unknown })?.steps });
  if (typeof body.lines === 'string') {
    for (const part of body.lines.split(/[\n;]+/)) {
      const m = /^\s*(\d{4}-\d{2}-\d{2})\s*[=:]\s*(.+?)\s*$/.exec(part);
      if (m) raw.push({ day: m[1], steps: m[2] });
    }
  }
  if (body.steps !== undefined) raw.push({ day: isDay(body.day) ? body.day : today, steps: body.steps });

  let oldest = today;
  for (let i = 0; i < 14; i++) oldest = dayBefore(oldest);
  const best = new Map<string, number>();
  for (const r of raw.slice(0, 40)) {
    const steps = clean(r.steps);
    if (!isDay(r.day) || !Number.isFinite(steps) || steps < 0 || steps > 200_000) continue;
    if (r.day > today || r.day < oldest) continue;
    best.set(r.day, Math.max(steps, best.get(r.day) ?? 0));
  }
  return [...best.entries()].map(([day, steps]) => ({ day, steps })).sort((a, b) => a.day.localeCompare(b.day));
}
