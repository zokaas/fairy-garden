'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Päivittää sivun, kun sovellus palaa etualalle (esim. Komennot-sovelluksesta synkan jälkeen). */
export default function ResumeRefresh() {
  const router = useRouter();
  useEffect(() => {
    let last = Date.now();
    const on = () => {
      if (document.visibilityState === 'visible' && Date.now() - last > 4000) router.refresh();
      last = Date.now();
    };
    document.addEventListener('visibilitychange', on);
    window.addEventListener('pageshow', on);
    return () => {
      document.removeEventListener('visibilitychange', on);
      window.removeEventListener('pageshow', on);
    };
  }, [router]);
  return null;
}
