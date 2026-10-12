'use client';
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { uploadPhoto } from '@/app/actions';

/** Pienennetään kuva selaimessa 256 px:n neliöksi ennen latausta. */
async function square(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(bmp.width, bmp.height);
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  c.getContext('2d')!.drawImage(bmp, (bmp.width - s) / 2, (bmp.height - s) / 2, s, s, 0, 0, 256, 256);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej()), 'image/jpeg', 0.85));
}

export default function PhotoPicker({ hasPhoto }: { hasPhoto: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [msg, setMsg] = useState('');
  const [pending, start] = useTransition();

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setMsg('');
          start(async () => {
            try {
              const fd = new FormData();
              fd.append('photo', new File([await square(f)], 'a.jpg', { type: 'image/jpeg' }));
              const r = await uploadPhoto(fd);
              setMsg(r.ok ? 'Kuva tallennettu ✨' : 'Lataus epäonnistui, kokeile toista kuvaa.');
              if (r.ok) router.refresh();
            } catch {
              setMsg('Kuvaa ei voitu käsitellä.');
            }
          });
        }}
      />
      <button type="button" className="btn ghost" disabled={pending} onClick={() => ref.current?.click()}>
        {pending ? 'Ladataan…' : hasPhoto ? 'Vaihda kuva' : 'Lisää oma kuva'}
      </button>
      {msg && <p className="muted" style={{ textAlign: 'center' }}>{msg}</p>}
    </>
  );
}
