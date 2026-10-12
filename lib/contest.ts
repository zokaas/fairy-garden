import 'server-only';
import { getSettings } from './settings';

/** Kisa päättyy oletuksena päivää ennen gaalaa; ylläpito voi muuttaa sen. */
export const DEFAULT_END = '2026-11-27T23:59:00+02:00';

export async function getContest() {
  const cfg = await getSettings(['contest_end', 'contest_prize']);
  const end = cfg.contest_end && !Number.isNaN(Date.parse(cfg.contest_end)) ? cfg.contest_end : DEFAULT_END;
  return { end, prize: cfg.contest_prize ?? '', over: Date.now() >= Date.parse(end) };
}
