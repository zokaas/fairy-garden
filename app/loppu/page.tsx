import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loadGarden } from '@/lib/data';
import { fp, JOURNEY_GOAL, STOPS } from '@/lib/garden';
import { awards } from '@/lib/awards';
import { getContest } from '@/lib/contest';
import { km } from '@/lib/stats';
import Avatar from '@/components/Avatar';

export const dynamic = 'force-dynamic';

const fi = (n: number) => Math.round(n).toLocaleString('fi-FI');

/** Juhlan loppukatsaus: voittajat, ryhmän yhteiset luvut, kategoriat ja oma kausi. Avautuu kisan päätyttyä; ylläpito voi esikatsella (?avaa=1). */
export default async function Loppu({ searchParams }: { searchParams: { avaa?: string } }) {
  if (!cookies().get('fg_token')) redirect('/');
  const [{ board, me }, contest] = await Promise.all([loadGarden(), getContest()]);
  const open = contest.over || (!!me?.isAdmin && !!searchParams.avaa);
  if (!open) redirect('/kisa');

  const top = board.slice(0, 3);
  const prizes = awards(board);
  const total = (f: (b: (typeof board)[number]) => number) => board.reduce((a, b) => a + f(b), 0);
  const steps = total((b) => b.totalSteps);
  const flowers = total((b) => b.flowers);
  const sportMins = total((b) => b.sportMins);
  const creativeMins = total((b) => b.creativeMins);
  const sessions = total((b) => b.workouts);
  const weeks = total((b) => b.weeksDone);
  const leader = [...board].sort((a, b) => b.totalSteps - a.totalSteps)[0];
  const stop = leader ? STOPS.filter((s) => leader.totalSteps >= s.at).pop() : null;
  const arrived = board.filter((b) => b.totalSteps >= JOURNEY_GOAL).length;
  const myRank = me ? board.findIndex((b) => b.id === me.id) + 1 : 0;
  const preview = !contest.over;

  return (
    <>
      <h1>Kisa ohi 🏆</h1>
      {preview && <p className="toast">Esikatselu: kisa ei ole vielä päättynyt. Muut näkevät tämän sivun vasta päättymisen jälkeen.</p>}

      {top[0] && (
        <section className="card center">
          <div style={{ fontSize: 44 }}>👑</div>
          <h2>Reippain keiju</h2>
          <Avatar a={top[0]} size={96} stage={top[0].stageIdx} />
          <p style={{ fontSize: '1.3rem', margin: '8px 0 0' }}><b>{top[0].name}</b></p>
          <p className="muted">{fp(top[0].pts)} pistettä</p>
          {contest.prize && <p>🎁 <b>{contest.prize}</b></p>}
        </section>
      )}

      {top.length > 1 && (
        <div className="podium-row">
          {top.map((f, i) => (
            <Link key={f.id} href={`/keiju/${f.id}`} className="pr-item">
              <Avatar a={f} size={i === 0 ? 56 : 46} badge={['🥇', '🥈', '🥉'][i]} stage={f.stageIdx} />
              <b>{f.name}</b>
              <span>{fp(f.pts)} p</span>
            </Link>
          ))}
        </div>
      )}

      <section className="card">
        <h2>Yhdessä saimme aikaan</h2>
        <div className="tiles">
          <div><b>{fi(steps)}</b><span>askelta</span><small>{fi(km(steps))} km</small></div>
          <div><b>{fi(flowers)}</b><span>kukkaa 🌸</span></div>
          <div><b>{fi(sportMins / 60)} h</b><span>urheilua</span><small>{fi(sessions)} kirjausta yhteensä</small></div>
          <div><b>{fi(creativeMins / 60)} h</b><span>luovaa</span></div>
          <div><b>{weeks}</b><span>täyttä viikkoa</span><small>viikkotavoite täynnä</small></div>
          <div><b>{board.length}</b><span>keijua mukana</span></div>
        </div>
        <p className="muted">🥂 Matka Albertinkadulle: {leader ? <><b>{leader.name}</b> pääsi pisimmälle ({fi(leader.totalSteps)} askelta{stop ? `, ${stop.emoji} ${stop.name}` : ''}).</> : ''} {arrived > 0 ? `${arrived} / ${board.length} keijua perillä.` : `Perille (${fi(JOURNEY_GOAL)} askelta) ei vielä kukaan päässyt.`}</p>
      </section>

      {prizes.length > 0 && (
        <section className="card">
          <h2>Palkinnot</h2>
          <ul className="plain prizes">
            {prizes.map((p) => (
              <li key={p.title}>
                <span className="pe">{p.emoji}</span>
                <span><b>{p.title}</b><small>{p.winner.name} · {p.value}</small></span>
                <Avatar a={p.winner} size={34} stage={p.winner.stageIdx} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {me && (
        <section className="card">
          <h2>Sinun kautesi</h2>
          <div className="tiles">
            <div><b>{myRank}. / {board.length}</b><span>sijoitus</span><small>{fp(me.pts)} p</small></div>
            <div><b>{fi(me.totalSteps)}</b><span>askelta</span><small>{fi(km(me.totalSteps))} km</small></div>
            <div><b>{me.flowers}</b><span>kukkaa 🌸</span></div>
            <div><b>{fi(me.bestDay)}</b><span>paras päivä</span></div>
            <div><b>{me.bestRun} pv</b><span>pisin putki</span></div>
            <div><b>{me.weeksDone}</b><span>täyttä viikkoa</span><small>+{me.bonusPts} p</small></div>
            <div><b>{fi((me.sportMins + me.creativeMins) / 60)} h</b><span>urheilua ja luovaa</span><small>{me.workouts} kertaa</small></div>
            <div><b>{me.badges.length}</b><span>merkkiä</span></div>
          </div>
        </section>
      )}

      <section className="card">
        <h2>Lopputulokset</h2>
        <ol className="rank">
          {board.map((b, i) => (
            <li key={b.id} className={b.mine ? 'me' : ''}>
              <span className="pos">{['🥇', '🥈', '🥉'][i] ?? i + 1}</span>
              <Link href={`/keiju/${b.id}`} className="nm"><Avatar a={b} size={38} stage={b.stageIdx} /><span>{b.name}<small>{fi(b.totalSteps)} askelta · {b.flowers} 🌸</small></span></Link>
              <span className="pt">{fp(b.pts)} p</span>
            </li>
          ))}
        </ol>
      </section>

      <Link className="btn ghost" href="/kisa">Takaisin kisaan</Link>
    </>
  );
}
