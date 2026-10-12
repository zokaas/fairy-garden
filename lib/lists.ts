import type { Fairy } from './data';

export type ListKey = 'kaikki' | 'askeleet' | 'urheilu';
const fi = (n: number) => n.toLocaleString('fi-FI');

/** Kolme kärkilistaa: kaikki (pisteet), askeleet ja urheilu. Kullakin kausi- ja viikkoarvo. */
export const LISTS: Record<ListKey, { label: string; unit: string; total: (f: Fairy) => number; week: (f: Fairy) => number; fmt: (v: number) => string }> = {
  kaikki: { label: 'Kaikki', unit: 'pistettä', total: (f) => f.pts, week: (f) => f.weekPts, fmt: (v) => `${fi(v)} p` },
  askeleet: { label: 'Askeleet', unit: 'askelta', total: (f) => f.totalSteps, week: (f) => f.week.steps, fmt: (v) => fi(v) },
  urheilu: { label: 'Urheilu', unit: 'minuuttia', total: (f) => f.mins, week: (f) => f.week.mins, fmt: (v) => `${fi(v)} min` },
};

export const isList = (s: string | undefined): s is ListKey => s === 'kaikki' || s === 'askeleet' || s === 'urheilu';
