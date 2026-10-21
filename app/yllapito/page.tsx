import { SHORTCUT_INSTALL_URL } from '@/lib/shortcut';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { loadGarden, loadRaw } from '@/lib/data';
import { syncWatch } from '@/lib/watch';
import { DEMO } from '@/lib/demo';
import { db } from '@/lib/db';
import { GROWTH, ago, fp, helsinkiDay } from '@/lib/garden';
import Avatar from '@/components/Avatar';
import { getContest } from '@/lib/contest';
import { adminDelete, adminResetPassword, adminSetSteps, clearTest, remindAll, remindFairy, saveContest, seedTest, testPush, testWeekly } from './actions';

export const dynamic = 'force-dynamic';

export default async function Yllapito({ searchParams }: { searchParams: { ok?: string } }) {
  const { board, me } = await loadGarden();
  if (!me?.isAdmin) redirect('/');
  const contest = await getContest();
  const endLocal = new Date(contest.end).toLocaleString('sv-SE', { timeZone: 'Europe/Helsinki' }).slice(0, 16).replace(' ', 'T');
  const [raw, subsRes] = await Promise.all([loadRaw(), DEMO ? Promise.resolve({ data: [] as { fairy_id: string }[] }) : db().from('push_subscriptions').select('fairy_id')]);
  const subscribed = new Set((subsRes.data ?? []).map((x) => x.fairy_id as string));
  const watch = syncWatch(board, raw.steps);
  const problems = watch.filter((w) => w.level !== 'ok');
  const dm2 = (d: string) => `${Number(d.slice(8))}.${Number(d.slice(5, 7))}.`;
  const synced = board.filter((b) => b.today > 0).length;
  const stale = board.filter((b) => b.hasSteps && b.yesterday === 0).length;

  return (
    <>
      <h1>Ylläpito</h1>
      {searchParams.ok && <p className={`toast ${/^(Ei|Vercel|Virheellinen|Sinulla)/.test(searchParams.ok) ? 'warn' : ''}`}>{/^(Ei|Vercel|Virheellinen|Sinulla)/.test(searchParams.ok) ? '⚠️' : '✓'} {searchParams.ok}</p>}

      <section className="card">
        <h2>Tilanne</h2>
        <div className="tiles">
          <div><b>{board.length}</b><span>keijua</span></div>
          <div><b>{synced}</b><span>synkannut tänään</span></div>
          <div><b>{stale}</b><span>ilman eilistä</span></div>
          <div><b>{subscribed.size}</b><span>ilmoitukset päällä</span></div>
        </div>
      </section>

      <section className="card">
        <h2>Synkkavahti</h2>
        <p className="muted">Kenen askeleet puuttuvat viimeiseltä kolmelta päivältä. Muistutus lähtee push-ilmoituksena (jos keijulla on ilmoitukset päällä).</p>
        {problems.length === 0 ? <p className="toast">Kaikilla on askeleet viimeiseltä kolmelta päivältä.</p> : (
          <ul className="watch">
            {problems.map((w) => (
              <li key={w.fairy.id} className={`lv-${w.level}`}>
                <Avatar a={w.fairy} size={34} stage={w.fairy.stageIdx} />
                <span className="wt">
                  <b>{w.fairy.name}</b>
                  <small>
                    {w.level === 'never' ? 'Ei yhtään kirjausta vielä' : `Puuttuu: ${w.missing.map(dm2).join(', ')}`} · viimeksi synkattu {ago(w.fairy.lastSync)}
                    {!subscribed.has(w.fairy.id) && ' · ei ilmoituksia'}
                  </small>
                </span>
                {w.level !== 'never' && (
                  <form action={remindFairy}><input type="hidden" name="id" value={w.fairy.id} /><button className="btn ghost" disabled={!subscribed.has(w.fairy.id)}>Muistuta</button></form>
                )}
              </li>
            ))}
          </ul>
        )}
        {problems.some((w) => w.level === 'warn' || w.level === 'alert') && (
          <form action={remindAll}><button className="btn">Muistuta kaikkia puuttuvia</button></form>
        )}
      </section>

      <details className="card adm">
        <summary><h2>Jaettava komento</h2></summary>
        <p className="muted">{SHORTCUT_INSTALL_URL ? 'Asennuslinkki on asetettu.' : ''}</p>
        <Link className="btn ghost" href="/yllapito/komento">Rakennusohje</Link>
      </details>

      <details className="card adm">
        <summary><h2>Esikatsele näkymiä</h2></summary>
        <p className="muted">Puutarhan kasvu (kukkia):</p>
        <div className="chips" style={{ justifyContent: 'flex-start' }}>
          {GROWTH.map((g, i) => <Link key={g} className="chip" href={`/?taso=${i}`}>{g} kukkaa</Link>)}
        </div>
        <p className="muted">Vuorokaudenaika:</p>
        <div className="chips" style={{ justifyContent: 'flex-start' }}>
          {[['dawn', '🌅 Aamu'], ['day', '☀️ Päivä'], ['dusk', '🌇 Ilta'], ['night', '🌙 Yö']].map(([k, l]) => <Link key={k} className="chip" href={`/?aika=${k}&taso=3`}>{l}</Link>)}
        </div>
        <p className="muted">Muut:</p>
        <div className="chips" style={{ justifyContent: 'flex-start' }}>
          <Link className="chip" href="/?juhla=1&taso=2">🎉 Uuden kukan juhla</Link>
          <Link className="chip" href="/?tyhja=1"> Uuden käyttäjän aloitus</Link>
          <Link className="chip" href="/kisa">🏁 Kisa (käynnissä)</Link>
          <Link className="chip" href="/kisa?avaa=1">🏆 Kisa (päättynyt)</Link>
          <Link className="chip" href="/loppu?avaa=1">🥂 Loppukatsaus (esikatselu)</Link>
          <Link className="chip" href="/profiili?uusi=1">🧚 Avatarin valinta</Link>
          <Link className="chip" href="/shortcut">Synkka-ohje</Link>
        </div>
      </details>

      <details className="card adm">
        <summary><h2>Kisan asetukset</h2></summary>
        <p className="muted">Kisan päättymisaika (Suomen aikaa) ja palkinto. Tulokset näkyvät Kisa-sivulla; esikatsele: <Link href="/kisa?avaa=1">kisa päättynyt</Link>.</p>
        <form action={saveContest}>
          <input name="end" type="datetime-local" defaultValue={endLocal} required />
          <input name="prize" defaultValue={contest.prize} placeholder="Palkinto, esim. Reippaan keijun kruunu 👑" maxLength={200} />
          <button className="btn">Tallenna</button>
        </form>
      </details>

      <details className="card adm">
        <summary><h2>Ilmoitukset</h2></summary>
        <p className="muted">Laita ensin ilmoitukset päälle omassa profiilissasi, ja lähetä sitten testi.</p>
        <form action={testPush}><button className="btn ghost">Lähetä testi-ilmoitus itselle</button></form>
        <form action={testWeekly}><button className="btn ghost" style={{ marginTop: 8 }}>Lähetä viikkoyhteenveto itselle (testi)</button></form>
        <p className="muted">Maanantaisin klo 9 kaikille tilaajille lähtee automaattisesti viime viikon yhteenveto.</p>
      </details>

      <details className="card adm">
        <summary><h2>Testidata</h2></summary>
        <p className="muted">Luo 8 keijua ({'🧪'}-merkillä) satunnaisilla askelilla, liikunnoilla ja avatareilla, jotta kärkilista, putket ja merkit näyttävät aidoilta.</p>
        <form action={seedTest}><button className="btn">Luo testikeijut</button></form>
        <form action={clearTest}><button className="btn ghost" style={{ marginTop: 8 }}>Poista kaikki testikeijut</button></form>
      </details>

      <section className="card">
        <h2>Keijut</h2>
        {board.map((b) => (
          <details key={b.id} className="fairy-row">
            <summary>
              <Avatar a={b} size={34} />
              <span className="nmx">{b.name}{b.isAdmin ? ' 🛠' : ''}{b.inactive ? ' · passiivinen' : ''}<small>{fp(b.pts)} p · tänään {b.today.toLocaleString('fi-FI')} · synkattu {ago(b.lastSync)}</small></span>
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
