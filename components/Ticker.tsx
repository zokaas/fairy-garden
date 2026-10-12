/** Juokseva uutisnauha: ryhmän tilanne liikkuu tasaisesti vasemmalle. */
export default function Ticker({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const row = items.map((t, i) => <span key={i}><i />{t}</span>);
  return (
    <div className="ticker" aria-label="Ryhmän tilanne">
      <div className="ticker-track">
        <div>{row}</div>
        <div aria-hidden="true">{row}</div>
      </div>
    </div>
  );
}
