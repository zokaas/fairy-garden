import { WEEK_GOAL } from './weekly';

export type QuestCtx = {
  today: number; yesterday: number; sentToday: number;
  sportToday: number; creativeToday: number; sportDays: number; creativeDays: number;
};
export type Quest = { id: string; emoji: string; text: string; done: boolean; progress: string };

/** Päivän taika: askeltavoite (7 000 treenipäivänä, muuten 10 000), viikkotavoitetta edistävä tehtävä ja kimalle. */
export function dailyQuests(c: QuestCtx): Quest[] {
  const target = c.sportToday > 0 ? WEEK_GOAL.stepsSportDay : WEEK_GOAL.stepsRestDay;
  const q: Quest[] = [
    { id: 'steps', emoji: '👟', text: `Kävele ${target.toLocaleString('fi-FI')} askelta${c.sportToday > 0 ? ' (urheilupäivä)' : ''}`, done: c.today >= target, progress: `${Math.min(c.today, target).toLocaleString('fi-FI')} / ${target.toLocaleString('fi-FI')}` },
  ];
  if (c.sportDays < WEEK_GOAL.sportDays) q.push({ id: 'sport', emoji: '💪', text: 'Urheile tänään', done: c.sportToday > 0, progress: c.sportToday > 0 ? `${c.sportToday} min` : `Viikolla ${c.sportDays} / ${WEEK_GOAL.sportDays} päivää` });
  else if (c.creativeDays < WEEK_GOAL.creativeDays) q.push({ id: 'creative', emoji: '🎨', text: 'Tee jotain luovaa', done: c.creativeToday > 0, progress: c.creativeToday > 0 ? `${c.creativeToday} min` : 'Piirrä, virkkaa, lue, soita…' });
  else q.push({ id: 'beat', emoji: '⚡', text: 'Ylitä eilisen askelmäärä', done: c.today > c.yesterday && c.today > 0, progress: `${c.today.toLocaleString('fi-FI')} / ${(c.yesterday + 1).toLocaleString('fi-FI')}` });
  q.push({ id: 'cheer', emoji: '✨', text: 'Lähetä kimalle toiselle keijulle', done: c.sentToday > 0, progress: c.sentToday > 0 ? 'Lähetetty' : 'Kärki-välilehdellä' });
  return q;
}
