'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const TARGETS = '.card, .tiles, ol.rank li, .badge, .quests li, .podium .step, .prizes li, .garden + *';

/**
 * Liike: 1) alta tulevat osat paljastuvat vieritettäessä (sumennus + nousu, porrastettuna),
 * 2) kortit seuraavat sormea/kursoria valokeilalla. Ylhäällä olevat osat käyttävät CSS:n sisääntuloa.
 */
export default function Motion() {
  const path = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let io: IntersectionObserver | null = null;
    // Odotetaan, että sivun hydraatio on valmis, ettei luokkien muutos sotke Reactin tilaa.
    const t = setTimeout(() => {
      const els = Array.from(document.querySelectorAll<HTMLElement>(TARGETS)).filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.92);
      els.forEach((el, i) => {
        const sib = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : i;
        el.style.setProperty('--d', `${Math.min(sib, 6) * 55}ms`);
        el.classList.add('rv');
      });
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add('in'); io?.unobserve(e.target); } }),
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
      );
      els.forEach((el) => io!.observe(el));
    }, 500);
    return () => { clearTimeout(t); io?.disconnect(); };
  }, [path]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const move = (e: PointerEvent) => {
      const card = (e.target as HTMLElement | null)?.closest<HTMLElement>('.card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerdown', move, { passive: true });
    return () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerdown', move); };
  }, []);

  return null;
}
