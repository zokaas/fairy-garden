'use client';
import { useMemo, useState } from 'react';
import Avatar from './Avatar';
import FairyFigure from './FairyFigure';
import PhotoPicker from './PhotoPicker';
import { ACCESSORIES, AVATAR_BGS, AVATAR_EMOJIS } from '@/lib/avatar';
import { GROWTH } from '@/lib/garden';

type Tab = 'hahmo' | 'vari' | 'asuste' | 'kuva';
const TABS: [Tab, string][] = [['hahmo', 'Hahmo'], ['vari', 'Väri'], ['asuste', 'Asuste'], ['kuva', 'Kuva']];

/** Avatarin muokkaus: elävä esikatselu, välilehdet, satunnaisarvonta ja tallennuspalkki, joka aktivoituu muutoksista. */
export default function AvatarEditor({ initial, stage, photoPath, photoVer, isNew, saveAction, removeAction }: {
  initial: { name: string; emoji: string; bg: string; acc: string };
  stage: number;
  photoPath: string | null;
  photoVer: string | null;
  isNew: boolean;
  saveAction: (fd: FormData) => void | Promise<void>;
  removeAction: (fd: FormData) => void | Promise<void>;
}) {
  const [name, setName] = useState(initial.name);
  const [emoji, setEmoji] = useState(initial.emoji);
  const [bg, setBg] = useState(initial.bg);
  const [acc, setAcc] = useState(initial.acc);
  const [tab, setTab] = useState<Tab>('hahmo');

  const dirty = isNew || name !== initial.name || emoji !== initial.emoji || bg !== initial.bg || acc !== initial.acc;
  const preview = useMemo(() => ({ avatarEmoji: emoji, avatarBg: bg, avatarPath: photoPath, avatarAcc: acc, avatarVer: photoVer }), [emoji, bg, acc, photoPath, photoVer]);
  const openAcc = ACCESSORIES.filter((a) => stage >= a.stage);

  function randomize() {
    const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
    setEmoji(pick(AVATAR_EMOJIS));
    setBg(pick(AVATAR_BGS));
    setAcc(pick(openAcc).id);
  }

  return (
    <form action={saveAction} className="card editor">
      {isNew && <input type="hidden" name="uusi" value="1" />}
      <input type="hidden" name="emoji" value={emoji} />
      <input type="hidden" name="bg" value={bg} />
      <input type="hidden" name="acc" value={acc} />

      <div className="ed-preview">
        <div className="ed-big"><Avatar a={preview} size={124} stage={stage} /></div>
        <div className="ed-small">
          <div><Avatar a={preview} size={40} stage={stage} /><small>listassa</small></div>
          <div><Avatar a={preview} size={64} stage={stage} /><small>puutarhassa</small></div>
        </div>
        <div className="ed-actions">
          <button type="button" className="btn ghost ed-rand" onClick={randomize}>Yllätä minut</button>
          {dirty && !isNew && <button type="button" className="btn ghost ed-rand" onClick={() => { setName(initial.name); setEmoji(initial.emoji); setBg(initial.bg); setAcc(initial.acc); }}>Peru muutokset</button>}
        </div>
      </div>

      <label className="ed-label" htmlFor="ed-name">Nimi</label>
      <input id="ed-name" name="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} required />

      <div className="seg four ed-tabs" role="tablist">
        {TABS.map(([k, label]) => (
          <a key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)} href={`#${k}`}>{label}</a>
        ))}
      </div>

      {tab === 'hahmo' && (
        <div className="picker" role="radiogroup" aria-label="Hahmo">
          {AVATAR_EMOJIS.map((e) => (
            <button type="button" key={e} role="radio" aria-checked={emoji === e} className={`pick ${emoji === e ? 'sel' : ''}`} onClick={() => setEmoji(e)} title={e === 'fig' ? 'Piirretty keiju' : e}>
              {e === 'fig' ? <FairyFigure stage={stage} size={36} /> : e}
            </button>
          ))}
        </div>
      )}

      {tab === 'vari' && (
        <div className="picker colors" role="radiogroup" aria-label="Taustaväri">
          {AVATAR_BGS.map((c) => (
            <button type="button" key={c} role="radio" aria-checked={bg === c} aria-label="Taustaväri" className={`pick ${bg === c ? 'sel' : ''}`} onClick={() => setBg(c)}><i style={{ background: c }} /></button>
          ))}
        </div>
      )}

      {tab === 'asuste' && (
        <>
          <div className="picker" role="radiogroup" aria-label="Asuste">
            {ACCESSORIES.map((a) => {
              const open = stage >= a.stage;
              return (
                <button type="button" key={a.id} role="radio" aria-checked={acc === a.id} disabled={!open} className={`pick ${acc === a.id ? 'sel' : ''} ${open ? '' : 'locked'}`} onClick={() => setAcc(a.id)} title={open ? a.name : `Aukeaa ${GROWTH[a.stage]} kukalla`}>
                  {a.emoji || '∅'}{!open && <small className="lock">🔒</small>}
                </button>
              );
            })}
          </div>
          <p className="muted">Asusteet aukeavat kukkien mukana (jokainen tavoitepäivä on yksi kukka).{stage < 5 ? ` Seuraava aukeaa ${GROWTH[stage + 1]} kukalla.` : ''}</p>
        </>
      )}

      {tab === 'kuva' && (
        <>
          <PhotoPicker hasPhoto={!!photoPath} />
          {photoPath && <button type="submit" formAction={removeAction} formNoValidate className="btn ghost" style={{ marginTop: 8 }}>Poista kuva (käytä hahmoa)</button>}
          <p className="muted">Oma kuva korvaa hahmon ja näkyy kaikille. Kuva rajataan neliöksi keskeltä.</p>
        </>
      )}

      <div className={`ed-save ${dirty ? 'dirty' : ''}`}>
        <button className="btn" disabled={!dirty}>{isNew ? 'Valmis, puutarhaan' : dirty ? 'Tallenna muutokset' : 'Ei tallennettavaa'}</button>
      </div>
    </form>
  );
}
