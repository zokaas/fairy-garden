'use client';
import { useEffect, useState } from 'react';
import { enablePush, saveSubscription, withTimeout } from './pushClient';

type State = 'checking' | 'off' | 'on' | 'denied' | 'unsupported' | 'needs-home-screen';

export default function PushToggle() {
  const [diag, setDiag] = useState('');
  const [state, setState] = useState<State>('checking');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
      const perm0 = 'Notification' in window ? Notification.permission : 'ei tuettu';
      setDiag(`Tila: ${standalone ? 'kotivalikon sovellus' : 'selain'} · Palvelutyöntekijä: ${'serviceWorker' in navigator ? 'tuettu' : 'ei'} · Push: ${'PushManager' in window ? 'tuettu' : 'ei'} · Lupa: ${perm0}`);
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return setState(ios && !standalone ? 'needs-home-screen' : 'unsupported');
      if (Notification.permission === 'denied') return setState('denied');
      try {
        await navigator.serviceWorker.register('/sw.js');
        if (Notification.permission !== 'granted') return setState('off');
        const sub = await (await withTimeout(navigator.serviceWorker.ready, 6000, 'Palvelutyöntekijä ei käynnisty')).pushManager.getSubscription();
        setDiag((d) => `${d} · Tilaus: ${sub ? 'on' : 'ei vielä'}`);
        if (!sub) return setState('off');
        await saveSubscription(sub);
        setState('on');
      } catch (e) {
        setDiag((d) => `${d} · Virhe: ${e instanceof Error ? e.message : String(e)}`);
        setState('off');
      }
    })();
  }, []);

  async function enable() {
    setBusy(true);
    setError('');
    try {
      const { permission } = await enablePush();
      setDiag((d) => d.replace(/Lupa: \S+/, `Lupa: ${permission}`));
      if (permission === 'granted') return setState('on');
      if (permission === 'denied') return setState('denied');
      setError('Lupaa ei annettu. Napauta nappia uudelleen ja valitse Salli.');
    } catch (e) {
      setError(`Käyttöönotto epäonnistui: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {state === 'checking' && <p className="muted">Tarkistetaan…</p>}
      {state === 'on' && <p>✓ Ilmoitukset ovat päällä tässä laitteessa.</p>}
      {state === 'denied' && <p className="err">Ilmoitukset on estetty. Salli ne puhelimen asetuksista (Asetukset → Ilmoitukset → Fairy Garden) ja avaa sovellus uudelleen.</p>}
      {state === 'needs-home-screen' && <p className="muted">iPhonessa ilmoitukset toimivat vain, kun sovellus on lisätty Koti-valikkoon (Jaa → Lisää Koti-valikkoon) ja avattu sieltä.</p>}
      {state === 'unsupported' && <p className="muted">Tämä selain ei tue ilmoituksia.</p>}
      {state === 'off' && (
        <>
          <p className="muted">Saat muistutuksen puuttuvista askelista ja maanantaisin viime viikon yhteenvedon.</p>
          <button type="button" className="btn" disabled={busy} onClick={enable}>{busy ? 'Hetki…' : 'Laita ilmoitukset päälle'}</button>
        </>
      )}
      {error && <p className="err">{error}</p>}
      {diag && <p className="muted" style={{ fontSize: '.7rem', wordBreak: 'break-word' }}>{diag}</p>}
    </div>
  );
}
