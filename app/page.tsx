import Link from 'next/link';
import { loadGarden } from '@/lib/data';
import { DAILY_GOAL, STAGES, ago, phaseOf, stageFor, type Phase } from '@/lib/garden';
import type { Fairy } from '@/lib/data';
import { dailyQuests } from '@/lib/quests';
import Journey from '@/components/Journey';
import NameDice from '@/components/NameDice';
import { BADGES } from '@/lib/badges';
import { join, login } from './actions';
import Countdown from '@/components/Countdown';
import Garden from '@/components/Garden';
import Ring from '@/components/Ring';
import Celebrate from '@/components/Celebrate';
import SyncButton from '@/components/SyncButton';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: { virhe?: string; synkattu?: string; kirjaudu?: string; taso?: string; aika?: string; juhla?: string; tyhja?: string } }) {
  const { board, me: realMe, myRank, sentToday } = await loadGarden();
  // Ylläpitäjän esikatselu: ?taso=0..5, ?aika=night|dawn|day|dusk, ?juhla=1, ?tyhja=1 (uuden käyttäjän näkymä)
  const admin = !!realMe?.isAdmin;
  let me: Fairy | null = admin && searchParams.tyhja ? { ...realMe!, hasSteps: false, today: 0, yesterday: 0, totalSteps: 0, pts: 0, stageIdx: 0, badges: [], streak: 0 } : realMe;
  if (me && admin && searchParams.taso !== undefined) {
    const idx = Math.max(0, Math.min(5, Number(searchParams.taso) || 0));
    me = { ...me, stageIdx: idx, pts: STAGES[idx].min / 1000, hasSteps: true };
  }
  const phase: Phase = admin && ['night', 'dawn', 'day', 'dusk'].includes(searchParams.aika ?? '') ? (searchParams.aika as Phase) : phaseOf();
  const errs: Record<string, string> = {
    nimi: 'Kirjoita keijun nimi.',
    salasana: 'Salasanassa pitää olla vähintään 4 merkkiä.',
    olemassa: 'Tämä nimi on jo käytössä. Jos se on sinun, kirjaudu sisään alta.',
    eiloydy: 'Tällä nimellä ei löytynyt keijua.',
    vaara: 'Väärä salasana.',
    tallennus: 'Jokin meni pieleen, yritä uudelleen.',
  };
  const errMsg = searchParams.virhe ? errs[searchParams.virhe] ?? errs.tallennus : null;
  const showLogin = !!searchParams.kirjaudu || searchParams.virhe === 'olemassa';

  if (!me) {
    return (
      <>
        <Garden pts={Math.min(12, board.length * 3)} stageIdx={4} phase={phase} lines={['Tervetuloa puutarhaan ✨', 'Istuta siemen niin kasvamme yhdessä 🌱', 'Kimalle! 🦋']} />
        <h1>Fairy Garden 🧚🏼‍♀️</h1>
        <p className="sub">Kävele kukkaan, kasva keijuksi ja tule gaalaan 28.11.</p>
        <Countdown />
        {errMsg && <p className="err">{errMsg}</p>}
        {!showLogin ? (
          <form action={join} className="card">
            <h2>Liity puutarhaan ✨</h2>
            <input id="nm" name="name" placeholder="Keijun nimi" maxLength={30} required autoComplete="username" />
            <NameDice inputId="nm" />
            <input name="pin" type="password" placeholder="Salasana (väh. 4 merkkiä)" minLength={4} required autoComplete="new-password" />
            <p className="muted">Salasanalla pääset sisään myös toiselta puhelimelta tai kotinäytön sovelluksesta.</p>
            <button className="btn">Istuta siemen 🌰</button>
            <p className="muted" style={{ textAlign: 'center' }}><Link href="/?kirjaudu=1">Minulla on jo keiju →</Link></p>
          </form>
        ) : (
          <form action={login} className="card">
            <h2>Kirjaudu sisään 🔑</h2>
            <input name="name" placeholder="Keijun nimi" maxLength={30} required autoComplete="username" />
            <input name="pin" type="password" placeholder="Salasana" minLength={4} required autoComplete="current-password" />
            <p className="muted">Vanha tunnus ilman salasanaa? Kirjoita nimi ja keksi uusi salasana, niin se tallentuu.</p>
            <button className="btn">Kirjaudu</button>
            <p className="muted" style={{ textAlign: 'center' }}><Link href="/">Uusi keiju →</Link></p>
          </form>
        )}
        <section className="card how">
          <h2>Näin se toimii</h2>
          <ol>
            <li><b>Liity</b> nimellä, joka näkyy kärkilistalla.</li>
            <li><b>Yhdistä askeleet</b> iPhonen Terveydestä (5 min, kerran).</li>
            <li><b>Kävele</b>: jokainen 1 000 askelta ja 10 min liikuntaa kasvattaa puutarhaasi.</li>
          </ol>
        </section>
      </>
    );
  }

  const { stage, next, pct } = stageFor(me.pts);
  const stageIdx = me.stageIdx;

  return (
    <>
      <Celebrate stageIdx={stageIdx} stageName={stage.name} emoji={stage.emoji} force={admin && !!searchParams.juhla} />
      <Garden
        pts={me.pts}
        stageIdx={stageIdx}
        phase={phase}
        name={`${me.name} · ${stage.name}`}
        avatar={me}
        lines={[
          me.today < DAILY_GOAL ? `Vielä ${(DAILY_GOAL - me.today).toLocaleString('fi-FI')} askelta päivän tavoitteeseen! 👟` : 'Päivän tavoite täynnä, mahtavaa! ✨',
          next ? `${next.emoji} ${next.name} odottaa ${Math.max(1, Math.ceil(next.min / 1000 - me.pts))} pisteen päässä` : 'Olet puutarhan kuningatar 👑',
          'Kukat kasvavat jokaisesta tuhannesta askeleesta 🌷',
          'Muista juoda vettä, keiju 💧',
          `${me.name}, sinä loistat! 🌸`,
        ]}
      />
      <p className="muted" style={{ textAlign: 'center', marginTop: -6 }}><Link href="/profiili">✏️ Muokkaa avataria</Link></p>
      <Countdown />

      {!me.hasSteps ? (
        <section className="card setup">
          <h2>✨ Aloita tästä</h2>
          <p>Puutarha kasvaa vasta, kun askeleet tulevat mukaan.</p>
          <Link className="btn" href="/shortcut">📲 Yhdistä askeleet (5 min)</Link>
          <p className="muted" style={{ textAlign: 'center' }}>tai <Link href="/kirjaa">kirjaa ne käsin</Link></p>
        </section>
      ) : (
        <section className="card center">
          <Ring value={me.today} goal={DAILY_GOAL} />
          <div className="chips">
            <span className="chip">🔥 {me.streak} pv putki</span>
            <span className="chip">🏆 sija {myRank}/{board.length}</span>
            <span className="chip">⭐ {me.pts} p</span>
          </div>
          {searchParams.synkattu && <p className="muted">Synkkaus tehty ✨</p>}
          <SyncButton site={process.env.NEXT_PUBLIC_SITE_URL ?? ''} />
        </section>
      )}

      {me.hasSteps && me.yesterday === 0 && (
        <section className="card nudge">
          <p>🌙 Eilisen askeleet puuttuvat. Synkkaa ne tai <Link href="/kirjaa">kirjaa käsin</Link> (valitse eilinen päivä).</p>
          <p className="muted">Viimeksi synkattu: {ago(me.lastSync)}</p>
        </section>
      )}

      <section className="card">
        <h2>{next ? `Matkalla: ${next.emoji} ${next.name}` : 'Olet huipulla 👑'}</h2>
        <div className="bar"><i style={{ width: `${pct}%` }} /></div>
        {next && <p className="muted">Vielä {Math.max(0, Math.ceil(next.min / 1000 - me.pts))} pistettä seuraavaan tasoon.</p>}
      </section>
      {me.hasSteps && (() => {
        const quests = dailyQuests({ today: me.today, yesterday: me.yesterday, minsToday: me.minsToday, sentToday: sentToday.length });
        const all = quests.every((x) => x.done);
        return (
          <section className={`card quests ${all ? 'all' : ''}`}>
            <h2>{all ? '🌟 Taikapäivä täynnä!' : '✨ Päivän taika'}</h2>
            <ul className="plain">
              {quests.map((x) => (
                <li key={x.id} className={x.done ? 'done' : ''}>
                  <span className="check">{x.done ? '✓' : x.emoji}</span>
                  <span>{x.text}<small>{x.progress}</small></span>
                </li>
              ))}
            </ul>
          </section>
        );
      })()}

      {me.cheersToday > 0 && (
        <section className="card cheers">
          <p>💌 Sait tänään <b>{me.cheersToday}</b> {me.cheersToday === 1 ? 'kimallen' : 'kimallusta'} ✨</p>
        </section>
      )}

      {me.hasSteps && <Journey steps={me.totalSteps} avatar={me} />}

      <section className="card">
        <h2>Merkit {me.badges.length}/{BADGES.length}</h2>
        <div className="badges small">
          {BADGES.filter((b) => me.badges.includes(b.id)).map((b) => <span key={b.id} title={b.name}>{b.emoji}</span>)}
          {me.badges.length === 0 && <span className="muted">Ensimmäinen merkki tulee ensimmäisistä askelista.</span>}
        </div>
        <p className="muted"><Link href="/gaala">Kaikki merkit ja gaala →</Link></p>
      </section>
      {admin && <p className="muted" style={{ textAlign: 'center' }}><Link href="/yllapito">🛠 Ylläpito ja esikatselut</Link></p>}
    </>
  );
}
