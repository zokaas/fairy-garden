import Link from 'next/link';
import { redirect } from 'next/navigation';
import { loadGarden } from '@/lib/data';
import { STAGES, ago, helsinkiDay } from '@/lib/garden';
import Avatar from '@/components/Avatar';
import { getContest } from '@/lib/contest';
import { adminDelete, adminResetPassword, adminSetSteps, clearTest, saveContest, seedTest, testPush } from './actions';

export const dynamic = 'force-dynamic';

export default async function Yllapito({ searchParams }: { searchParams: { ok?: string } }) {
  const { board, me } = await loadGarden();
  if (!me?.isAdmin) redirect('/');
  const contest = await getContest();
  const endLocal = new Date(contest.end).toLocaleString('sv-SE', { timeZone: 'Europe/Helsinki' }).slice(0, 16).replace(' ', 'T');
  const synced = board.filter((b) => b.today > 0).length;
  const stale = board.filter((b) => b.hasSteps && b.yesterday === 0 && !b.mine).length;

  return (
    <>
      <h1>🛠 Ylläpito</h1>
      {searchParams.ok && <p className="toast">{searchParams.ok} ✓</p>}

      <section className="card">
        <h2>Tilanne</h2>
        <div className="chips">
          <span className="chip">🧚🏼‍♀️ {board.length} keijua</span>
          <span className="chip">👟 {synced} synkannut tänään</span>
          <span className="chip">🌙 {stale} ilman eilistä</span>
        </div>
      </section>

      <section className="card">
        <h2>Esikatsele näkymiä</h2>
        <p className="muted">Tasot (etusivu):</p>
        <div className="chips" style={{ justifyContent: 'flex-start' }}>
          {STAGES.map((s, i) => <Link key={s.name} className="chip" href={`/?taso=${i}`}>{s.emoji} {s.name}</Link>)}
        </div>
        <p className="muted">Vuorokaudenaika:</p>
        <div className="chips" style={{ justifyContent: 'flex-start' }}>
          {[['dawn', '🌅 Aamu'], ['day', '☀️ Päivä'], ['dusk', '🌇 Ilta'], ['night', '🌙 Yö']].map(([k, l]) => <Link key={k} className="chip" href={`/?aika=${k}&taso=3`}>{l}</Link>)}
        </div>
        <p className="muted">Muut:</p>
        <div className="chips" style={{ justifyContent: 'flex-start' }}>
          <Link className="chip" href="/?juhla=1&taso=2">🎉 Tasonnousujuhla</Link>
          <Link className="chip" href="/?tyhja=1">🌰 Uuden käyttäjän aloitus</Link>
          <Link className="chip" href="/kisa">🏁 Kisa (käynnissä)</Link>
          <Link className="chip" href="/kisa?avaa=1">🏆 Kisa (päättynyt)</Link>
          <Link className="chip" href="/profiili?uusi=1">🧚 Avatarin valinta</Link>
          <Link className="chip" href="/shortcut">📲 Synkka-ohje</Link>
        </div>
      </section>

      <section className="card">
        <h2>Kisan asetukset 🏁</h2>
        <p className="muted">Kisan päättymisaika (Suomen aikaa) ja palkinto. Tulokset näkyvät Kisa-sivulla; esikatsele: <Link href="/kisa?avaa=1">kisa päättynyt</Link>.</p>
        <form action={saveContest}>
          <input name="end" type="datetime-local" defaultValue={endLocal} required />
          <input name="prize" defaultValue={contest.prize} placeholder="Palkinto, esim. Reippaan keijun kruunu 👑" maxLength={200} />
          <button className="btn">Tallenna</button>
        </form>
      </section>

      <section className="card">
        <h2>Ilmoitukset 🔔</h2>
        <p className="muted">Laita ensin ilmoitukset päälle omassa profiilissasi, ja lähetä sitten testi.</p>
        <form action={testPush}><button className="btn ghost">Lähetä testi-ilmoitus itselle</button></form>
      </section>

      <section className="card">
        <h2>Testidata</h2>
        <p className="muted">Luo 8 keijua ({'🧪'}-merkillä) satunnaisilla askelilla, liikunnoilla ja avatareilla, jotta kärkilista, putket ja merkit näyttävät aidoilta.</p>
        <form action={seedTest}><button className="btn">Luo testikeijut</button></form>
        <form action={clearTest}><button className="btn ghost" style={{ marginTop: 8 }}>Poista kaikki testikeijut</button></form>
      </section>

      <section className="card">
        <h2>Keijut</h2>
        {board.map((b) => (
          <details key={b.id} className="fairy-row">
            <summary>
              <Avatar a={b} size={34} />
              <span className="nmx">{b.name}{b.isAdmin ? ' 🛠' : ''}<small>{b.pts} p · tänään {b.today.toLocaleString('fi-FI')} · synkattu {ago(b.lastSync)}</small></span>
            </summary>
            <form action={adminSetSteps} className="row" style={{ marginTop: 8 }}>
              <input type="hidden" name="id" value={b.id} />
              <input name="steps" type="number" placeholder="Askelia" min={0} max={200000} required />
              <input name="day" type="date" defaultValue={helsinkiDay()} />
              <button className="btn ghost" style={{ flex: '0 0 auto', width: 'auto' }}>Aseta</button>
            </form>
            <form action={adminResetPassword} className="row">
              <input type="hidden" name="id" value={b.id} />
              <input name="pin" placeholder="Uusi salasana" minLength={4} required />
              <button className="btn ghost" style={{ flex: '0 0 auto', width: 'auto' }}>Vaihda</button>
            </form>
            {!b.mine && (
              <form action={adminDelete}>
                <input type="hidden" name="id" value={b.id} />
                <button className="btn ghost">Poista keiju</button>
              </form>
            )}
          </details>
        ))}
      </section>
    </>
  );
}
