import { avatarUrl } from '@/lib/avatar';

export type AvatarData = { avatarEmoji: string | null; avatarBg: string | null; avatarPath: string | null; avatarVer?: string | null };

export default function Avatar({ a, size = 40, badge }: { a: AvatarData; size?: number; badge?: string }) {
  const url = avatarUrl(a.avatarPath);
  return (
    <span className="avatar" style={{ width: size, height: size, background: a.avatarBg ?? '#f8d7ec', fontSize: size * 0.58 }}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`${url}?v=${a.avatarVer ?? ''}`} alt="" width={size} height={size} />
      ) : (
        a.avatarEmoji ?? '🧚🏼‍♀️'
      )}
      {badge && <i className="avbadge" style={{ fontSize: size * 0.32 }}>{badge}</i>}
    </span>
  );
}
