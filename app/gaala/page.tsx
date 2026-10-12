import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loadGarden } from '@/lib/data';
import { SECRET_AT } from '@/lib/garden';
import { BADGES } from '@/lib/badges';
import Avatar from '@/components/Avatar';
import Countdown from '@/components/Countdown';
import SecretCountdown from '@/components/SecretCountdown';

export const dynamic = 'force-dynamic';

export default async function Gaala({ searchParams }: { searchParams: { avaa?: string } }) {
  if (!cookies().get('fg_token')) redirect('/');
  const { board, me } = await loadGarden();
  const unlocked = Date.now() >= Date.parse(SECRET_AT) || (!!me?.isAdmin && !!searchParams.avaa);
  const top = board.slice(0, 3);
  const order = [top[1], top[0], top[2]]; // palkintopalli: 2 – 1 – 3
  const heights = [96, 128, 78];

  return (
    <>
      <h1>🌙 Fairy Garden -gaala</h1>
      <p className="sub">💯-Gaala · Älä tule mustissa 🌸</p>
      <Countdown />

      <section className="card gala">
        <h2>Illan kulku</h2>
        <ul className="plain">
          <li>📆 <b>28.11.2026</b></li>
          <li>📍 <b>Albertinkatu</b> klo 16</li>
          <li>✨ <b>Secretsecret</b> klo 20</li>
        </ul>
        <p className="muted">Pukukoodi: kukkia, keijuja, kimallusta, hulmuavia helmoja ja siipiä. <b>Black is banned.</b></p>
      </section>

      <section className={`card secret ${unlocked ? 'open' : ''}`}>
        {unlocked ? (
          <>
            <div style={{ fontSize: 56 }}>✨🥂✨</div>
            <h2>Secretsecret on alkanut!</h2>
            <p>Illan salaisuudet paljastuvat nyt. Ja tässä satakeijukaisten kärki:</p>
            <div className="podium">
              {order.map((f, i) =>
                f ? (
                  <div key={f.id} className="step">
                    <Avatar a={f} size={i === 1 ? 64 : 52} badge={['🥈', '🥇', '🥉'][i]} />
                    <b>{f.name}</b>
                    <span>{f.pts} p</span>
                    <div className="block" style={{ height: heights[i] }} />
                  </div>
                ) : <div key={i} className="step" />,
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 56 }} className="lock-bounce">🔒</div>
            <h2>Secretsecret</h2>
            <p className="muted">Salaisuus paljastuu 28.11. klo 20.00</p>
            <SecretCountdown at={SECRET_AT} />
          </>
        )}
      </section>

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
  );
}
