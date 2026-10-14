import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loadGarden } from '@/lib/data';
import { fp } from '@/lib/garden';
import { awards } from '@/lib/awards';
import { BADGES } from '@/lib/badges';
import { getContest } from '@/lib/contest';
import Avatar from '@/components/Avatar';
import { GroupJourney } from '@/components/Journey';
import Countdown from '@/components/Countdown';
import KarkiView from '@/components/KarkiView';
import { UNLOCKS } from '@/lib/garden';

export const dynamic = 'force-dynamic';

export default async function Kisa({ searchParams }: { searchParams: { avaa?: string; nakyma?: string; lista?: string; nayta?: string } }) {
  if (!cookies().get('fg_token')) redirect('/');
  const [{ board, me }, contest] = await Promise.all([loadGarden(), getContest()]);
  const view = ['matka', 'merkit', 'saannot'].includes(searchParams.nakyma ?? '') ? (searchParams.nakyma as string) : 'karki';
  const over = contest.over || (!!me?.isAdmin && !!searchParams.avaa);
  const prizes = awards(board);
  const top = board.slice(0, 3);
  const order = [top[1], top[0], top[2]];
  const heights = [96, 128, 78];
  const endDate = new Date(contest.end).toLocaleDateString('fi-FI', { timeZone: 'Europe/Helsinki', day: 'numeric', month: 'numeric' });

  return (
    <>
      <h1>Kisa</h1>
      <p className="sub">Kisa päättyy {endDate} Eniten pisteitä keränneestä tulee <b>Reippain keiju</b>.</p>
      <Countdown to={contest.end} />
      <div className="seg" role="tablist">
        {([['karki', 'Kärki'], ['matka', 'Matka'], ['merkit', 'Merkit'], ['saannot', 'Säännöt']] as const).map(([k2, label]) => (
          <Link key={k2} role="tab" aria-selected={view === k2} className={view === k2 ? 'on' : ''} href={k2 === 'karki' ? '/kisa' : `/kisa?nakyma=${k2}`}>{label}</Link>
        ))}
      </div>

      {view === 'karki' && (
        <>
          {(!searchParams.lista || searchParams.lista === 'kaikki') && (
        <section className={`card secret ${over ? 'open' : ''}`}>
          {over ? (
            <>
              <div style={{ fontSize: 56 }}>🏆</div>
              <h2>Kisa on ohi!</h2>
              {top[0] && <p>Reippain keiju on <b>{top[0].name}</b> {fp(top[0].pts)} pisteellä 🎉</p>}
            </>
          ) : (
            <>
              <div style={{ fontSize: 48 }}>🔥</div>
              <h2>Tilanne juuri nyt</h2>
              {top[0] ? <p>Johtaa: <b>{top[0].name}</b> ({fp(top[0].pts)} p)</p> : <p className="muted">Kisa ei ole vielä alkanut.</p>}
            </>
          )}
          {contest.prize && <p>🎁 Palkinto: <b>{contest.prize}</b></p>}
          {top.length > 0 && (
            <div className="podium">
              {order.map((f, i) =>
                f ? (
                  <div key={f.id} className="step">
                    <Avatar a={f} size={i === 1 ? 64 : 52} badge={['🥈', '🥇', '🥉'][i]} stage={f.stageIdx} />
                    <b>{f.name}</b>
                    <span>{fp(f.pts)} p</span>
                    <div className="block" style={{ height: heights[i] }} />
                  </div>
                ) : <div key={i} className="step" />,
              )}
            </div>
          )}
        </section>

          )}
          <KarkiView all={board} me={me} lista={searchParams.lista} nayta={searchParams.nayta} />
        </>
      )}

      {view === 'matka' && (
        <>
        <GroupJourney fairies={board} />

        <section className="card">
          <h2>{over ? 'Palkinnot ' : 'Kategoriat: kuka johtaa '}</h2>
          {prizes.length === 0 ? <p className="muted">Palkinnot ilmestyvät, kun ensimmäiset askeleet on kirjattu.</p> : (
            <ul className="plain prizes">
              {prizes.map((p) => (
                <li key={p.title}>
                  <span className="pe">{p.emoji}</span>
                  <span><b>{p.title}</b><small>{p.winner.name} · {p.value}</small></span>
                  <Avatar a={p.winner} size={34} stage={p.winner.stageIdx} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2>Puutarhan palkinnot</h2>
          <ul className="plain unlocks">
            {UNLOCKS.map((u) => (
              <li key={u.at} className={me && me.flowers >= u.at ? 'done' : ''}>
                <span className="ob-check">{me && me.flowers >= u.at ? '✓' : ''}</span>
                <span><b>{u.at} kukkaa</b><small>{u.text}</small></span>
              </li>
            ))}
          </ul>
          <p className="muted">Päivän askeltavoite on yksi kukka, ja jokainen täysi 10 000 askelta sen yli tuo lisäkukan.{me ? ` Sinulla on nyt ${me.flowers}.` : ''}</p>
        </section>

        </>
      )}

      {view === 'saannot' && (
        <>
        <section className="card how">
          <h2>Säännöt</h2>
          <p>Eniten pisteitä kisan päättyessä voittaa. Reilu peli: kirjaa vain omat askeleesi ja oma liikuntasi.</p>
          <p className="muted"><Link href="/ohje">Pisteet, viikkotavoite ja kukat: Näin kisa toimii →</Link></p>
        </section>

        </>
      )}

      {view === 'merkit' && (
        <>
        <section className="card">
          <h2>Merkit {me ? `${me.badges.length}/${BADGES.length}` : ''}</h2>
          <div className="badges">
            {BADGES.map((b) => {
              const got = !!me?.badges.includes(b.id);
              return (
                <div key={b.id} className={got ? 'badge on' : 'badge'}>
                  <span>{got ? b.emoji : '🔒'}</span>
                  <b>{b.name}</b>
                  <small>{b.desc}</small>
                </div>
              );
            })}
          </div>
        </section>
        </>
      )}
    </>
  );
}
