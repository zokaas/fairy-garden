import 'server-only';
import { dayBefore, helsinkiDay } from './garden';

/** Paikallinen esikatselu ilman Supabasea: aja `FG_DEMO=1 npm run dev` ja aseta eväste fg_token=demo. */
export const DEMO = process.env.FG_DEMO === '1';

const NAMES = ['Kielo', 'Villiruusu', 'Kastepisara', 'Lumikello', 'Ruiskaunokki', 'Pääskynen', 'Orvokki', 'Mesikämmen', 'Sumuinen Sini'];
const EMOJIS = ['fig', '🦋', '🌸', '🧚🏽‍♀️', '🍄', '🐰', '🦄', '🧚🏻‍♀️', '🌙'];
const BGS = ['#f8d7ec', '#d7f2e3', '#e4d9fb', '#fde8c4', '#d4ecfb', '#ffd9d2', '#f3f0b8', '#ffe0f4', '#d7f2e3'];
const TEAMS = ['sienet', 'perhoset', 'kukat', 'tahdet', 'sienet', 'perhoset', 'kukat', 'tahdet', 'sienet'];

export function demoRows() {
  let seed = 7;
  const rnd = (a: number, b: number) => {
    seed = (seed * 9301 + 49297) % 233280;
    return a + Math.floor((seed / 233280) * (b - a + 1));
  };
  const fairies = NAMES.map((name, i) => ({
    id: `f${i}`, name, token: i === 0 ? 'demo' : `t${i}`, avatar_emoji: EMOJIS[i], avatar_bg: BGS[i],
    avatar_path: null, avatar_acc: ['crown', 'wings', 'flowers', 'sparkle', 'sprout', 'none', 'none', 'none', 'none'][i],
    is_admin: i === 0, team: TEAMS[i],
  }));
  const today = helsinkiDay();
  const steps: { fairy_id: string; day: string; steps: number; updated_at: string }[] = [];
  const workouts: { fairy_id: string; day: string; sport: string; minutes: number }[] = [];
  const sports = ['Juoksu', 'Sali', 'Jooga', 'Tanssi', 'Pyöräily', 'Lenkkeily', 'Piirtäminen', 'Lukeminen'];
  fairies.forEach((f, i) => {
    let d = today;
    const days = 40 - i * 3;
    for (let k = 0; k < days; k++) {
      if (k > 0 || i !== 8) steps.push({ fairy_id: f.id, day: d, steps: rnd(4000, 15500) + (8 - i) * 400, updated_at: new Date(Date.now() - k * 3_600_000).toISOString() });
      if (rnd(0, 3) === 0) workouts.push({ fairy_id: f.id, day: d, sport: sports[rnd(0, 7)], minutes: rnd(15, 80) });
      d = dayBefore(d);
    }
  });
  const cheers = [{ from_id: 'f1', to_id: 'f0', day: today }, { from_id: 'f2', to_id: 'f0', day: today }];
  return { fairies, steps, workouts, cheers };
}
