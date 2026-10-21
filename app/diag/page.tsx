import ViewportInfo from '@/components/ViewportInfo';

export const dynamic = 'force-dynamic';

export default function Diag() {
  return (
    <>
      <h1>Diagnostiikka</h1>
      <p className="sub">Ota tästä näkymästä kuvakaappaus (skrollaa ensin hieman alas, jotta alapalkin ongelma näkyy) ja lähetä se.</p>
      <section className="card"><ViewportInfo /></section>
      {Array.from({ length: 12 }, (_, i) => <section key={i} className="card"><p className="muted">Täytettä skrollausta varten ({i + 1}/12)</p></section>)}
    </>
  );
}
