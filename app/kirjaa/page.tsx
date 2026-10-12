import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SPORTS, helsinkiDay } from '@/lib/garden';
import { logSteps, logWorkout } from '../actions';

export const dynamic = 'force-dynamic';

export default function Kirjaa({ searchParams }: { searchParams: { ok?: string } }) {
  if (!cookies().get('fg_token')) redirect('/');
  return (
    <>
      <h1>Kirjaa</h1>
      {searchParams.ok && <p className="toast">{searchParams.ok === 'askeleet' ? 'Askeleet tallennettu 🌸' : 'Liikunta lisätty 💪'}</p>}

      <section className="card">
        <h2>Askeleet</h2>
        <form action={logSteps}>
          <div className="row">
            <input name="steps" type="number" inputMode="numeric" min={0} max={200000} placeholder="Askelia" required />
            <input name="day" type="date" defaultValue={helsinkiDay()} />
          </div>
          <button className="btn">Tallenna askeleet</button>
        </form>
        <p className="muted">Tämä korvaa päivän luvun. Automaattisynkka onnistuu <a href="/shortcut">Synkka-välilehdellä</a>.</p>
      </section>

      <section className="card">
        <h2>Liikunta</h2>
        <form action={logWorkout}>
          <div className="row">
            <select name="sport">{SPORTS.map((s) => <option key={s}>{s}</option>)}</select>
            <input name="minutes" type="number" inputMode="numeric" min={1} max={600} placeholder="Minuuttia" required />
          </div>
          <button className="btn">Lisää liikunta</button>
        </form>
      </section>
    </>
  );
}
