import 'server-only';
import webpush from 'web-push';
import { db } from './db';

export type PushPayload = { title: string; body: string; url?: string };

/** Siistii ympäristömuuttujat: poistaa välilyönnit ja lisää puuttuvan mailto: sähköpostiosoitteelle. */
function vapid() {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const priv = process.env.VAPID_PRIVATE_KEY?.trim();
  let subject = process.env.VAPID_SUBJECT?.trim();
  if (subject && /^[^\s@:]+@[^\s@]+$/.test(subject)) subject = `mailto:${subject}`;
  return { pub, priv, subject };
}

/** Palauttaa selkeän syyn, jos ilmoitusten avaimet puuttuvat tai ovat virheelliset, muuten null. */
export function vapidProblem(): string | null {
  const { pub, priv, subject } = vapid();
  if (!pub || !priv || !subject) return `Vercelistä puuttuu: ${[!pub && 'NEXT_PUBLIC_VAPID_PUBLIC_KEY', !priv && 'VAPID_PRIVATE_KEY', !subject && 'VAPID_SUBJECT'].filter(Boolean).join(', ')}`;
  try {
    webpush.setVapidDetails(subject, pub, priv);
    return null;
  } catch (e) {
    return `Virheellinen VAPID-asetus: ${(e as Error).message}`;
  }
}

/** Lähettää push-ilmoituksen annetuille keijuille (tai kaikille). Virheet eivät kaada kutsujaa. */
export async function sendPush(payload: PushPayload, fairyIds: string[] | null = null): Promise<number> {
  if (fairyIds && fairyIds.length === 0) return 0;
  if (vapidProblem()) return 0;
  const supabase = db();
  let q = supabase.from('push_subscriptions').select('endpoint, p256dh, auth');
  if (fairyIds) q = q.in('fairy_id', fairyIds);
  const targets = (await q).data ?? [];
  const results = await Promise.allSettled(
    targets.map(async (t) => {
      try {
        await webpush.sendNotification({ endpoint: t.endpoint, keys: { p256dh: t.p256dh, auth: t.auth } }, JSON.stringify({ url: '/', ...payload }));
      } catch (e) {
        // Vanhentunut tilaus (410/404) siivotaan pois.
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await supabase.from('push_subscriptions').delete().eq('endpoint', t.endpoint);
        throw e;
      }
    }),
  );
  return results.filter((r) => r.status === 'fulfilled').length;
}
