import 'server-only';
import webpush from 'web-push';
import { db } from './db';

export type PushPayload = { title: string; body: string; url?: string };

/** Lähettää push-ilmoituksen annetuille keijuille (tai kaikille). Virheet eivät kaada kutsujaa. */
export async function sendPush(payload: PushPayload, fairyIds: string[] | null = null): Promise<number> {
  const { NEXT_PUBLIC_VAPID_PUBLIC_KEY: pub, VAPID_PRIVATE_KEY: priv, VAPID_SUBJECT: subject } = process.env;
  if (!pub || !priv || !subject) return 0;
  if (fairyIds && fairyIds.length === 0) return 0;
  webpush.setVapidDetails(subject, pub, priv);
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
