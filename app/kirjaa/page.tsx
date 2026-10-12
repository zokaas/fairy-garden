import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SPORTS } from '@/lib/garden';
import { logWorkout } from '../actions';

export const dynamic = 'force-dynamic';

export default function Kirjaa({ searchParams }: { searchParams: { ok?: string } }) {
  if (!cookies().get('fg_token')) redirect('/');
  return (
    <>
      <h1>Liikunta</h1>
      {searchParams.ok && <p className="toast">Liikunta lisätty</p>}

      <section className="card">
        <h2>Lisää liikuntakerta</h2>
        <form action={logWorkout}>
          <div className="row">
            <select name="sport">{SPORTS.map((s) => <option key={s}>{s}</option>)}</select>
            <input name="minutes" type="number" inputMode="numeric" min={1} max={600} placeholder="Minuuttia" required />
          </div>
          <button className="btn">Lisää liikunta</button>
        </form>
        <p className="muted">1 piste / 30 min. Kävely on pääasia, urheilu on lisä.</p>
      </section>
    </>
  );
}
