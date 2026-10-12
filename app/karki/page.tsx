import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loadGarden } from '@/lib/data';
import { stageFor } from '@/lib/garden';
import { leave } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Karki() {
  if (!cookies().get('fg_token')) redirect('/');
  const { board } = await loadGarden();
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
                <span className="nm">{stageFor(b.pts).stage.emoji} {b.name}
                  <small>{b.totalSteps.toLocaleString('fi-FI')} askelta{b.streak > 1 ? ` · 🔥 ${b.streak}` : ''}</small>
                </span>
                <span className="pt">{b.pts} p</span>
              </li>
            ))}
          </ol>
        )}
        <p className="muted">1 piste / 1 000 askelta ja 1 piste / 10 min liikuntaa.</p>
      </section>
      <form action={leave}><button className="btn ghost">Poistu tältä laitteelta</button></form>
    </>
  );
}
