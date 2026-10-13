// Selaimen puolen apurit push-ilmoitusten käyttöönottoon (käytetään profiilissa ja aloituskehotteessa).

function b64(base64: string) {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export const withTimeout = <T,>(p: Promise<T>, ms: number, msg: string) => Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error(msg)), ms))]);

export async function saveSubscription(sub: PushSubscription) {
  const res = await fetch('/api/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? `Palvelin vastasi ${res.status}`);
}

export const pushSupported = () => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

export const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;

/** Pyytää luvan (jos tarvitaan) ja tekee tilauksen. Heittää virheen, jos jokin vaihe epäonnistuu. Kutsu käyttäjän napautuksesta. */
export async function enablePush(): Promise<{ permission: NotificationPermission }> {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { permission };
  await subscribeNow();
  return { permission };
}

/** Tilaa ilmoitukset, kun lupa on jo annettu. */
export async function subscribeNow() {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY puuttuu Vercelistä.');
  await navigator.serviceWorker.register('/sw.js');
  const reg = await withTimeout(navigator.serviceWorker.ready, 8000, 'Palvelutyöntekijä ei käynnisty. Sulje sovellus kokonaan ja avaa se uudelleen');
  const opts = { userVisibleOnly: true, applicationServerKey: b64(key) };
  let sub: PushSubscription;
  try {
    sub = await reg.pushManager.subscribe(opts);
  } catch {
    await (await reg.pushManager.getSubscription())?.unsubscribe();
    sub = await reg.pushManager.subscribe(opts);
  }
  await saveSubscription(sub);
}
