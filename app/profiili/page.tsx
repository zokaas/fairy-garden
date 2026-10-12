import { redirect } from 'next/navigation';
import { loadGarden } from '@/lib/data';
import { AVATAR_BGS } from '@/lib/avatar';
import AvatarEditor from '@/components/AvatarEditor';
import { TEAMS } from '@/lib/teams';
import PushToggle from '@/components/PushToggle';
import { deleteAccount, removePhoto, saveAvatar, saveTeam } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Profiili({ searchParams }: { searchParams: { uusi?: string; ok?: string; virhe?: string } }) {
  const { me, board } = await loadGarden();
  if (!me) redirect('/');
  const uusi = !!searchParams.uusi;
  return (
    <>
      <h1>{uusi ? 'Valitse oma keijusi' : 'Oma avatar'}</h1>
      <p className="sub">{uusi ? 'Voit vaihtaa tämän myöhemmin.' : 'Näkyy puutarhassa ja kärkilistalla.'}</p>
      {searchParams.ok && <p className="toast">Tallennettu 🌸</p>}

      <AvatarEditor
        initial={{ name: me.name, emoji: me.avatarEmoji ?? 'fig', bg: me.avatarBg ?? AVATAR_BGS[0], acc: me.avatarAcc ?? 'none' }}
        stage={me.stageIdx}
        photoPath={me.avatarPath}
        photoVer={me.avatarVer}
        isNew={uusi}
        saveAction={saveAvatar}
        removeAction={removePhoto}
      />
          {!uusi && (
        <>
          <form action={saveTeam} className="card">
            <h2>Joukkue</h2>
            <div className="teams">
              {TEAMS.map((t) => (
                <label key={t.id}>
                  <input type="radio" name="team" value={t.id} defaultChecked={me.team === t.id} required />
                  <span>{t.emoji}<b>{t.name}</b><small>{board.filter((f) => f.team === t.id).length} jäsentä</small></span>
                </label>
              ))}
            </div>
            <button className="btn ghost">Liity joukkueeseen</button>
          </form>
          <section className="card">
            <h2>Askelten synkka</h2>
            <p className="muted">Oikotie, jolla iPhone lähettää askeleesi automaattisesti.</p>
            <a className="btn ghost" href="/shortcut">Avaa Synkka-ohje</a>
          </section>
          <section className="card">
            <h2>Ilmoitukset</h2>
            <PushToggle />
          </section>
        </>
      )}

  {!uusi && (
        <details className="card danger">
          <summary>Poista tunnukseni</summary>
          <p className="muted">Poistaa nimesi, askeleesi, liikuntasi ja avatarisi pysyvästi. Esim. jos sinulla on vahingossa kaksi tunnusta.</p>
          {searchParams.virhe && <p className="err">Nimi ei täsmännyt, tunnusta ei poistettu.</p>}
          <form action={deleteAccount}>
            <input name="confirm" placeholder={`Kirjoita nimesi: ${me.name}`} required />
            <button className="btn ghost">Poista pysyvästi</button>
          </form>
        </details>
      )}
    </>
  );
}
