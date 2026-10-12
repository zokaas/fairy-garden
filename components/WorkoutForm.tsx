'use client';
import { useState } from 'react';
import { CREATIVE, SPORTS } from '@/lib/garden';

/** Liikunnan ja luovan harrastuksen kirjaus: valitaan laji, kesto ja päivä (tänään tai eilen). */
export default function WorkoutForm({ action }: { action: (fd: FormData) => void | Promise<void> }) {
  const [kind, setKind] = useState<'urheilu' | 'luova'>('urheilu');
  const list = kind === 'urheilu' ? SPORTS : CREATIVE;
  return (
    <form action={action}>
      <div className="seg">
        <a role="button" className={kind === 'urheilu' ? 'on' : ''} onClick={() => setKind('urheilu')}>Urheilu</a>
        <a role="button" className={kind === 'luova' ? 'on' : ''} onClick={() => setKind('luova')}>Luova</a>
      </div>
      <select name="sport" key={kind} aria-label="Laji">{list.map((s) => <option key={s}>{s}</option>)}</select>
      <div className="row">
        <input name="minutes" type="number" inputMode="numeric" min={1} max={600} placeholder="Minuuttia" required />
        <select name="when" aria-label="Päivä"><option value="tanaan">Tänään</option><option value="eilen">Eilen</option></select>
      </div>
      <button className="btn">{kind === 'urheilu' ? 'Lisää urheilu' : 'Lisää luova hetki'}</button>
    </form>
  );
}
