import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loadGarden } from '@/lib/data';
import { ago, stageFor } from '@/lib/garden';
import { TEAMS, teamOf } from '@/lib/teams';
import Avatar from '@/components/Avatar';
import { leave, sendCheer } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Karki({ searchParams }: { searchParams: { nayta?: string } }) {
  if (!cookies().get('fg_token')) redirect('/');
  const { board: all, me, sentToday } = await loadGarden();
  const week = searchParams.nayta === 'viikko';
  const score = (b: (typeof all)[number]) => (week ? b.weekPts : b.pts);
  const board = [...all].sort((a, b) => score(b) - score(a));
  const medal = ['🥇', '🥈', '🥉'];

  const teams = TEAMS.map((t) => {
    const m = all.filter((f) => f.team === t.id);
    const total = m.reduce((a, f) => a + score(f), 0);
    return { ...t, members: m.length, total, avg: m.length ? total / m.length : 0 };
  }).filter((t) => t.members > 0).sort((a, b) => b.avg - a.avg);

  return (
    <>
      <h1>Puutarhan kärki</h1>
      <div className="seg">
        <Link href="/karki" className={!week ? 'on' : ''}>Koko kausi</Link>
        <Link href="/karki?nayta=viikko" className={week ? 'on' : ''}>Tämä viikko</Link>
      </div>

      {teams.length > 0 && (
        <section className="card">
          <h2>Joukkueet {week ? '(viikko)' : ''}</h2>
          <ol className="rank">
            {teams.map((t, i) => (
              <li key={t.id}>
                <span className="pos">{medal[i] ?? i + 1}</span>
                <span className="nm"><span className="teamdot">{t.emoji}</span><span>{t.name}<small>{t.members} jäsentä · yhteensä {t.total} p</small></span></span>
                <span className="pt">{t.avg.toFixed(1)} p/keiju</span>
              </li>
            ))}
          </ol>
          <p className="muted">Joukkueen pisteet ovat jäsenten keskiarvo, joten pieni joukkue voi voittaa. Valitse joukkue <Link href="/profiili">profiilissa</Link>.</p>
        </section>
      )}

      <section className="card">
        {board.length === 0 ? <p className="muted">Ei vielä keijuja.</p> : (
          <ol className="rank">
            {board.map((b, i) => (
              <li key={b.id} className={b.mine ? 'me' : ''}>
                <span className="pos">{medal[i] ?? i + 1}</span>
                <span className="nm"><Avatar a={b} size={38} badge={stageFor(b.pts).stage.emoji} stage={b.stageIdx} />
                  <span>{b.name} {teamOf(b.team)?.emoji ?? ''}<small>{b.totalSteps.toLocaleString('fi-FI')} askelta{b.streak > 1 ? ` · 🔥 ${b.streak}` : ''} · synkattu {ago(b.lastSync)}</small></span>
                </span>
                <span className="pt">{score(b)} p</span>
                {me && !b.mine && (
                  <form action={sendCheer}>
                    <input type="hidden" name="to" value={b.id} />
                    <button className={`cheer ${sentToday.includes(b.id) ? 'sent' : ''}`} disabled={sentToday.includes(b.id)} title="Lähetä kimalle">{sentToday.includes(b.id) ? '💌' : '✨'}</button>
                  </form>
                )}
              </li>
            ))}
          </ol>
        )}
        <p className="muted">Napauta ja lähetä keijulle kimalle (yksi / päivä / keiju). 1 piste / 1 000 askelta ja 1 piste / 10 min liikuntaa.</p>
      </section>
      <form action={leave}><button className="btn ghost">Poistu tältä laitteelta</button></form>
    </>
  );
}
