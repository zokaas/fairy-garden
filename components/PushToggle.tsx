'use client';
import { useEffect, useState } from 'react';

type State = 'checking' | 'off' | 'on' | 'denied' | 'unsupported' | 'needs-home-screen';

function b64(base64: string) {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

async function save(sub: PushSubscription) {
  const res = await fetch('/api/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? `Palvelin vastasi ${res.status}`);
}

export default function PushToggle() {
  const [state, setState] = useState<State>('checking');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return setState(ios && !standalone ? 'needs-home-screen' : 'unsupported');
      if (Notification.permission === 'denied') return setState('denied');
      try {
        await navigator.serviceWorker.register('/sw.js');
        if (Notification.permission !== 'granted') return setState('off');
        const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
        if (!sub) return setState('off');
        await save(sub);
        setState('on');
      } catch {
        setState('off');
      }
    })();
  }, []);

  async function enable() {
    setBusy(true);
    setError('');
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return setState(perm === 'denied' ? 'denied' : 'off');
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY puuttuu Vercelistä.');
      const reg = await navigator.serviceWorker.ready;
      const opts = { userVisibleOnly: true, applicationServerKey: b64(key) };
      let sub: PushSubscription;
      try {
        sub = await reg.pushManager.subscribe(opts);
      } catch {
        await (await reg.pushManager.getSubscription())?.unsubscribe();
        sub = await reg.pushManager.subscribe(opts);
      }
      await save(sub);
      setState('on');
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
          <p className="muted">Saat muistutuksen puuttuvista askelista ja kuulet, kun joku lähettää sinulle kimallen.</p>
          <button type="button" className="btn" disabled={busy} onClick={enable}>{busy ? 'Hetki…' : '🔔 Laita ilmoitukset päälle'}</button>
        </>
      )}
      {error && <p className="err">{error}</p>}
    </div>
  );
}
