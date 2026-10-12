import { helsinkiDay } from './garden';

export type QuestCtx = { today: number; yesterday: number; minsToday: number; sentToday: number };
export type Quest = { id: string; emoji: string; text: string; done: boolean; progress: string };

const STEP_GOALS = [6000, 8000, 10000, 7500, 9000, 12000, 5000];

/** Päivän taika: kolme tehtävää, jotka valitaan päivämäärästä (ei tietokantaa tarvita). */
export function dailyQuests(c: QuestCtx, day = helsinkiDay()): Quest[] {
  const n = Math.floor(Date.parse(`${day}T12:00:00Z`) / 86_400_000);
  const goal = STEP_GOALS[n % 7];
  const q: Quest[] = [
    { id: 'steps', emoji: '👟', text: `Kävele ${goal.toLocaleString('fi-FI')} askelta`, done: c.today >= goal, progress: `${Math.min(c.today, goal).toLocaleString('fi-FI')} / ${goal.toLocaleString('fi-FI')}` },
  ];
  if (n % 2 === 0) q.push({ id: 'sport', emoji: '💪', text: 'Kirjaa 20 min liikuntaa', done: c.minsToday >= 20, progress: `${Math.min(c.minsToday, 20)} / 20 min` });
  else q.push({ id: 'beat', emoji: '⚡', text: 'Ylitä eilisen askelmäärä', done: c.today > c.yesterday && c.today > 0, progress: `${c.today.toLocaleString('fi-FI')} / ${(c.yesterday + 1).toLocaleString('fi-FI')}` });
  q.push({ id: 'cheer', emoji: '✨', text: 'Lähetä kimalle toiselle keijulle', done: c.sentToday > 0, progress: c.sentToday > 0 ? 'Lähetetty' : 'Kärki-välilehdellä' });
  return q;
}
