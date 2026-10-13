import { redirect } from 'next/navigation';
import { loadGarden } from '@/lib/data';
import { AVATAR_BGS } from '@/lib/avatar';
import AvatarEditor from '@/components/AvatarEditor';
import PushToggle from '@/components/PushToggle';
import ThemeToggle from '@/components/ThemeToggle';
import { deleteAccount, removePhoto, saveAvatar } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Profiili({ searchParams }: { searchParams: { uusi?: string; ok?: string; virhe?: string } }) {
  const { me, board } = await loadGarden();
  if (!me) redirect('/');
  const uusi = !!searchParams.uusi;
  return (
    <>
      <h1>{uusi ? 'Valitse oma keijusi' : 'Profiili'}</h1>
      <p className="sub">{uusi ? 'Voit vaihtaa tämän myöhemmin.' : 'Avatar, ilmoitukset ja tili. Avatar näkyy puutarhassa ja kärkilistalla.'}</p>
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
          <section className="card">
            <h2>Askelten synkka</h2>
            <p className="muted">Oikotie, jolla iPhone lähettää askeleesi automaattisesti.</p>
            <a className="btn ghost" href="/shortcut">Avaa Synkka-ohje</a>
          </section>
          <section className="card">
            <h2>Ulkoasu</h2>
            <p className="muted">Vaalea, tumma tai laitteen asetuksen mukaan.</p>
            <ThemeToggle />
          </section>
          <section className="card">
            <h2>Ilmoitukset</h2>
            <PushToggle />
          </section>
        </>
      )}

      {!uusi && (
        <section className="card danger">
          <h2>Poista tili</h2>
          <p className="muted">Poistaa nimesi, askeleesi, liikuntasi ja avatarisi pysyvästi. Esim. jos sinulla on vahingossa kaksi tunnusta. Tätä ei voi perua.</p>
          {searchParams.virhe && <p className="err">Nimi ei täsmännyt, tiliä ei poistettu.</p>}
          <details open={!!searchParams.virhe}>
            <summary className="btn ghost">Poista tilini…</summary>
            <form action={deleteAccount}>
              <input name="confirm" placeholder={`Kirjoita nimesi: ${me.name}`} autoComplete="off" required />
              <button className="btn ghost">Poista pysyvästi</button>
            </form>
          </details>
        </section>
      )}
    </>
  );
}
