import { BADGES } from '@/lib/badges';
import { UNLOCKS } from '@/lib/garden';
import { redirect } from 'next/navigation';
import { loadGarden } from '@/lib/data';
import { AVATAR_BGS } from '@/lib/avatar';
import AvatarEditor from '@/components/AvatarEditor';
import PushToggle from '@/components/PushToggle';
import ThemeToggle from '@/components/ThemeToggle';
import { removePhoto, saveAvatar } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Profiili({ searchParams }: { searchParams: { uusi?: string; ok?: string } }) {
  const { me, board } = await loadGarden();
  if (!me) redirect('/');
  const uusi = !!searchParams.uusi;
  return (
    <>
      <h1>{uusi ? 'Valitse oma keijusi' : 'Profiili'}</h1>
      <p className="sub">{uusi ? 'Voit vaihtaa tämän myöhemmin.' : 'Avatar, ulkoasu ja ilmoitukset. Avatar näkyy puutarhassa ja kärkilistalla.'}</p>
      {searchParams.ok && <p className="toast">Tallennettu 🌸</p>}

      <AvatarEditor
        initial={{ name: me.name, emoji: me.avatarEmoji ?? 'fig', bg: me.avatarBg ?? AVATAR_BGS[0] }}
        stage={me.stageIdx}
        photoPath={me.avatarPath}
        photoVer={me.avatarVer}
        isNew={uusi}
        saveAction={saveAvatar}
        removeAction={removePhoto}
      />
          {!uusi && (
        <>
          <section className="card">
            <h2>Profiilisi</h2>
            <p className="muted">Näin muut näkevät sinut: puutarha, tavoitteet, päivät ja merkit.</p>
            <a className="btn ghost" href={`/keiju/${me.id}`}>Katso profiilisi</a>
          </section>
          <section className="card" id="palkinnot">
            <h2>Puutarhan palkinnot</h2>
            <ul className="plain unlocks">
              {UNLOCKS.map((u) => (
                <li key={u.at} className={me.flowers >= u.at ? 'done' : ''}>
                  <span className="ob-check">{me.flowers >= u.at ? '✓' : ''}</span>
                  <span><b>{u.at} kukkaa</b><small>{u.text}</small></span>
                </li>
              ))}
            </ul>
            <p className="muted">Päivän askeltavoite on yksi kukka, ja jokainen täysi 10 000 askelta sen yli tuo lisäkukan. Sinulla on nyt {me.flowers}.</p>
          </section>
          <section className="card" id="merkit">
            <h2>Merkit {me.badges.length}/{BADGES.length}</h2>
            <div className="badges">
              {BADGES.map((b) => {
                const got = me.badges.includes(b.id);
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
          <section className="card">
            <h2>Ohjeet</h2>
            <p className="muted">Pisteet, viikkotavoite, kukat ja synkka lyhyesti.</p>
            <a className="btn ghost" href="/ohje">Näin kisa toimii</a>
          </section>
          <section className="card">
            <h2>Askelten synkka</h2>
            <p className="muted">Asennus, tila ja ongelmanratkaisu: kaikki askelten siirrosta yhdessä paikassa.</p>
            <a className="btn ghost" href="/shortcut">Avaa Askelten synkka</a>
          </section>
          <section className="card">
            <h2>Ulkoasu</h2>
            <p className="muted">Oletuksena vaalea. Voit vaihtaa tumman tai laitteen asetuksen mukaan.</p>
            <ThemeToggle />
          </section>
          <section className="card">
            <h2>Ilmoitukset</h2>
            <PushToggle />
          </section>
        </>
      )}

    </>
  );
}
