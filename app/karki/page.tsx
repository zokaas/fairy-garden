import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loadGarden } from '@/lib/data';
import { ago, stageFor } from '@/lib/garden';
import Avatar from '@/components/Avatar';
import { leave, sendCheer } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Karki() {
  if (!cookies().get('fg_token')) redirect('/');
  const { board, me, sentToday } = await loadGarden();
  const medal = ['🥇', '🥈', '🥉'];
  return (
    <>
      <h1>🏆 Puutarhan kärki</h1>
      <section className="card">
        {board.length === 0 ? <p className="muted">Ei vielä keijuja.</p> : (
          <ol className="rank">
            {board.map((b, i) => (
              <li key={b.id} className={b.mine ? 'me' : ''}>
                <span className="pos">{medal[i] ?? i + 1}</span>
                <span className="nm"><Avatar a={b} size={38} badge={stageFor(b.pts).stage.emoji} />
                  <span>{b.name}<small>{b.totalSteps.toLocaleString('fi-FI')} askelta{b.streak > 1 ? ` · 🔥 ${b.streak}` : ''} · synkattu {ago(b.lastSync)}</small></span>
                </span>
                <span className="pt">{b.pts} p</span>
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
        <p className="muted">Napauta ✨ ja lähetä keijulle kimalle (yksi / päivä / keiju). 1 piste / 1 000 askelta ja 1 piste / 10 min liikuntaa.</p>
      </section>
      <form action={leave}><button className="btn ghost">Poistu tältä laitteelta</button></form>
    </>
  );
}
