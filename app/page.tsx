import Link from 'next/link';
import { loadGarden } from '@/lib/data';
import { DAILY_GOAL, stageFor } from '@/lib/garden';
import { join } from './actions';
import Countdown from '@/components/Countdown';
import Garden from '@/components/Garden';
import Ring from '@/components/Ring';
import Celebrate from '@/components/Celebrate';
import SyncButton from '@/components/SyncButton';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: { virhe?: string; synkattu?: string } }) {
  const { board, me, myRank } = await loadGarden();

  if (!me) {
    return (
      <>
        <Garden pts={Math.min(12, board.length * 3)} stageIdx={4} />
        <h1>Fairy Garden 🧚🏼‍♀️</h1>
        <p className="sub">Kävele kukkaan, kasva keijuksi ja tule gaalaan 28.11.</p>
        <Countdown />
        <form action={join} className="card">
          <h2>Liity puutarhaan ✨</h2>
          <input name="name" placeholder="Keijun nimi" maxLength={30} required autoComplete="nickname" />
          {searchParams.virhe && <p className="err">Jokin meni pieleen, yritä uudelleen.</p>}
          <button className="btn">Istuta siemen 🌰</button>
        </form>
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
  const stageIdx = [0, 10, 50, 100, 250, 500].findLastIndex((m) => me.pts >= m);

  return (
    <>
      <Celebrate stageIdx={stageIdx} stageName={stage.name} emoji={stage.emoji} />
      <Garden pts={me.pts} stageIdx={stageIdx} name={`${me.name} · ${stage.name}`} />
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

      <section className="card">
        <h2>{next ? `Matkalla: ${next.emoji} ${next.name}` : 'Olet huipulla 👑'}</h2>
        <div className="bar"><i style={{ width: `${pct}%` }} /></div>
        {next && <p className="muted">Vielä {Math.max(0, Math.ceil(next.min / 1000 - me.pts))} pistettä seuraavaan tasoon.</p>}
      </section>
    </>
  );
}
