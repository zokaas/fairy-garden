'use client';
import { useEffect, useState } from 'react';

type Info = Record<string, string>;

function read(): Info {
  const vv = window.visualViewport;
  const nav = document.querySelector('nav.tabs')?.getBoundingClientRect();
  return {
    'innerWidth x innerHeight': `${window.innerWidth} x ${window.innerHeight}`,
    'visualViewport w x h': vv ? `${Math.round(vv.width)} x ${Math.round(vv.height)}` : 'ei tukea',
    'visualViewport offsetTop / scale': vv ? `${Math.round(vv.offsetTop)} / ${vv.scale.toFixed(2)}` : '-',
    'screen w x h': `${screen.width} x ${screen.height}`,
    'devicePixelRatio': String(window.devicePixelRatio),
    'documentElement clientHeight': String(document.documentElement.clientHeight),
    'scrollY / sivun korkeus': `${Math.round(window.scrollY)} / ${document.documentElement.scrollHeight}`,
    'standalone (kotinäyttö)': String((navigator as Navigator & { standalone?: boolean }).standalone ?? 'ei tietoa') + ' / ' + String(window.matchMedia('(display-mode: standalone)').matches),
    'alapalkki top / bottom': nav ? `${Math.round(nav.top)} / ${Math.round(nav.bottom)}` : 'ei palkkia',
    'safe-area bottom': getComputedStyle(document.documentElement).getPropertyValue('--sab') || '(ei asetettu)',
    'userAgent': navigator.userAgent.replace(/\(.*?\)/, '(..)').slice(0, 80),
  };
}

/** Diagnostiikka alapalkin sijaintiongelmaa varten: avaa /diag sovelluksessa ja ota kuvakaappaus. */
export default function ViewportInfo() {
  const [info, setInfo] = useState<Info>({});
  useEffect(() => {
    const upd = () => setInfo(read());
    upd();
    const vv = window.visualViewport;
    window.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    vv?.addEventListener('resize', upd);
    vv?.addEventListener('scroll', upd);
    const t = setInterval(upd, 1000);
    return () => {
      window.removeEventListener('scroll', upd);
      window.removeEventListener('resize', upd);
      vv?.removeEventListener('resize', upd);
      vv?.removeEventListener('scroll', upd);
      clearInterval(t);
    };
  }, []);
  return (
    <ul className="plain">
      {Object.entries(info).map(([k, v]) => <li key={k}><b>{k}</b><br /><span className="muted">{v}</span></li>)}
    </ul>
  );
}
