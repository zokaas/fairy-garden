import { helsinkiDay, weekStart } from './garden.ts';

export type WeekCtx = { steps: number; activeDays: number; goalDays: number; mins: number; sessions: number };
export type Challenge = { id: string; title: string; desc: string; target: number; unit: string; value: (c: WeekCtx) => number };

const POOL: Challenge[] = [
  { id: 'steps70', title: 'Seitsemän tonnin viikko', desc: 'Kävele 70 000 askelta', target: 70_000, unit: 'askelta', value: (c) => c.steps },
  { id: 'active5', title: 'Viisi hyvää päivää', desc: 'Vähintään 5 000 askelta viitenä päivänä', target: 5, unit: 'päivää', value: (c) => c.activeDays },
  { id: 'sport150', title: 'Liikuntaviikko', desc: 'Liiku yhteensä 150 minuuttia', target: 150, unit: 'min', value: (c) => c.mins },
  { id: 'goal3', title: 'Kolme kympin päivää', desc: '10 000+ askelta kolmena päivänä', target: 3, unit: 'päivää', value: (c) => c.goalDays },
  { id: 'sessions3', title: 'Kolme treeniä', desc: 'Kirjaa kolme liikuntakertaa', target: 3, unit: 'kertaa', value: (c) => c.sessions },
  { id: 'steps90', title: 'Yhdeksän tonnin viikko', desc: 'Kävele 90 000 askelta', target: 90_000, unit: 'askelta', value: (c) => c.steps },
];

/** Viikon haaste vaihtuu joka maanantai ja valitaan viikkonumerosta (ei tietokantaa). */
export function challengeFor(day = helsinkiDay()): Challenge {
  const n = Math.floor(Date.parse(`${weekStart(day)}T12:00:00Z`) / (7 * 86_400_000));
  return POOL[n % POOL.length];
}

/** Ryhmän yhteinen viikkotavoite: 50 000 askelta / keiju. */
export const groupTarget = (fairies: number) => Math.max(50_000, fairies * 50_000);
