import { react } from '@/app/actions';

/** 👏-reaktio: oma painallus näkyy korostettuna, nimet näkyvät pienellä. Omaan tekemiseen näytetään vain laskuri. */
export default function ReactButton({ target, names, mine, own }: { target: string; names: string[]; mine: boolean; own: boolean }) {
  if (own) return names.length ? <span className="rx-own" title={names.join(', ')}>👏 {names.length}</span> : null;
  return (
    <form action={react} className="rx">
      <input type="hidden" name="target" value={target} />
      <button type="submit" className={mine ? 'on' : ''} aria-pressed={mine} aria-label={mine ? 'Poista kehu' : 'Kehu'}>👏{names.length ? ` ${names.length}` : ''}</button>
      {names.length > 0 && <small>{names.join(', ')}</small>}
    </form>
  );
}
