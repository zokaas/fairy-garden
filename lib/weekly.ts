import { dayBefore, helsinkiDay, kindOf, weekStart } from './garden.ts';

/** Viikon yhteinen tavoite: 7 000 askelta treenipäivänä, 10 000 muulloin, 3 urheilupäivää ja 1 luova päivä. */
export const WEEK_GOAL = { sportDays: 3, creativeDays: 1, stepsSportDay: 7000, stepsRestDay: 10000 } as const;

/** Bonus jokaisesta kokonaan täytetystä viikosta. */
export const WEEK_BONUS = 3;

export type WeekGoal = {
  sportDays: number; creativeDays: number; stepDaysOk: number; stepDaysElapsed: number;
  done: boolean; sportDone: boolean; creativeDone: boolean; stepsDone: boolean;
  todayTarget: number; todayIsSport: boolean;
};

/** Laskee yhden keijun viikkotavoitteen tilan. Askelpäiviä on 7 (vain jo alkaneet päivät arvioidaan). */
export function weekGoal(steps: { day: string; steps: number }[], work: { day: string; sport: string }[], today = helsinkiDay()): WeekGoal {
  const wk = weekStart(today);
  const days: string[] = [];
  let d = wk;
  for (let i = 0; i < 7; i++) { days.push(d); d = dayAfter(d); }
  const sportOn = new Set(work.filter((w) => kindOf(w.sport) === 'urheilu').map((w) => w.day));
  const creativeOn = new Set(work.filter((w) => kindOf(w.sport) === 'luova').map((w) => w.day));
  const byDay = new Map<string, number>();
  for (const r of steps) byDay.set(r.day, (byDay.get(r.day) ?? 0) + r.steps);
  let ok = 0, elapsed = 0;
  for (const day of days) {
    if (day > today) continue;
    elapsed++;
    const target = sportOn.has(day) ? WEEK_GOAL.stepsSportDay : WEEK_GOAL.stepsRestDay;
    if ((byDay.get(day) ?? 0) >= target) ok++;
  }
  const sportDays = days.filter((x) => sportOn.has(x)).length;
  const creativeDays = days.filter((x) => creativeOn.has(x)).length;
  const sportDone = sportDays >= WEEK_GOAL.sportDays;
  const creativeDone = creativeDays >= WEEK_GOAL.creativeDays;
  const stepsDone = ok >= 7;
  const todayIsSport = sportOn.has(today);
  return { sportDays, creativeDays, stepDaysOk: ok, stepDaysElapsed: elapsed, sportDone, creativeDone, stepsDone, done: sportDone && creativeDone && stepsDone, todayIsSport, todayTarget: todayIsSport ? WEEK_GOAL.stepsSportDay : WEEK_GOAL.stepsRestDay };
}

function dayAfter(day: string): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
export { dayBefore };

/** Montako viikkoa keiju on täyttänyt koko tavoitteen (viikko arvioidaan sunnuntaihin tai tähän päivään asti). */
export function weeksDone(steps: { day: string; steps: number }[], work: { day: string; sport: string }[], today = helsinkiDay()): number {
  const all = [...steps.map((x) => x.day), ...work.map((x) => x.day)];
  if (all.length === 0) return 0;
  let w = weekStart(all.sort()[0]);
  const thisWeek = weekStart(today);
  let n = 0;
  for (let i = 0; i < 80 && w <= thisWeek; i++) {
    let end = w;
    for (let k = 0; k < 6; k++) end = dayAfter(end);
    if (weekGoal(steps, work, end > today ? today : end).done) n++;
    w = dayAfter(end);
  }
  return n;
}
