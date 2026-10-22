'use client';
import { useState } from 'react';
// @ts-expect-error react-dom ei sisällä tyyppejä tässä projektissa (useFormStatus toimii ajonaikaisesti)
import { useFormStatus } from 'react-dom';
import { CREATIVE, SPORTS } from '@/lib/garden';

/** Lähetysnappi, joka lukitaan lähetyksen ajaksi (estää tuplanapautuksen). */
function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button className="btn" disabled={pending}>{pending ? 'Tallennetaan…' : label}</button>;
}

/** Liikunnan ja luovan harrastuksen kirjaus: valitaan laji, kesto ja päivä (tänään tai jollekin viimeisen 7 päivän päivälle). */
export default function WorkoutForm({ action, days }: { action: (fd: FormData) => void | Promise<void>; days: { value: string; label: string }[] }) {
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
        <select name="when" aria-label="Päivä">{days.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}</select>
      </div>
      <Submit label={kind === 'urheilu' ? 'Lisää urheilu' : 'Lisää luova hetki'} />
    </form>
  );
}
