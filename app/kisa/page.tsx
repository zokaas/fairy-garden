import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loadGarden } from '@/lib/data';
import { fp } from '@/lib/garden';
import { awards } from '@/lib/awards';
import { getContest } from '@/lib/contest';
import Avatar from '@/components/Avatar';
import { GroupJourney } from '@/components/Journey';
import Countdown from '@/components/Countdown';
import KarkiView from '@/components/KarkiView';

export const dynamic = 'force-dynamic';

export default async function Kisa({ searchParams }: { searchParams: { avaa?: string; nakyma?: string; lista?: string; nayta?: string } }) {
  if (!cookies().get('fg_token')) redirect('/');
  const [{ board, me }, contest] = await Promise.all([loadGarden(), getContest()]);
  const view = searchParams.nakyma === 'matka' ? 'matka' : 'karki';
  const over = contest.over || (!!me?.isAdmin && !!searchParams.avaa);
  const prizes = awards(board);
  const top = board.slice(0, 3);
  const endDate = new Date(contest.end).toLocaleDateString('fi-FI', { timeZone: 'Europe/Helsinki', day: 'numeric', month: 'numeric' });

  return (
    <>
      <h1>Kisa</h1>
      <p className="sub">Päättyy {endDate} Eniten pisteitä kerännyt on <b>Reippain keiju</b>.</p>
      <Countdown to={contest.end} />
      <div className="seg" role="tablist">
        {([['karki', 'Kärki'], ['matka', 'Matka ja kategoriat']] as const).map(([k2, label]) => (
          <Link key={k2} role="tab" aria-selected={view === k2} className={view === k2 ? 'on' : ''} href={k2 === 'karki' ? '/kisa' : `/kisa?nakyma=${k2}`}>{label}</Link>
        ))}
      </div>

      {view === 'karki' && (
        <>
          {(over || contest.prize) && (
            <section className={`card secret ${over ? 'open' : ''}`}>
              {over && top[0] && <p>🏆 <b>Kisa on ohi!</b> Reippain keiju on <b>{top[0].name}</b> {fp(top[0].pts)} pisteellä 🎉</p>}
              {contest.prize && <p>🎁 Palkinto: <b>{contest.prize}</b></p>}
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


        </>
      )}

    </>
  );
}
