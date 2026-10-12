export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Ladataan">
      <div className="skel" style={{ height: 270, borderRadius: 16 }} />
      <div className="skel" style={{ height: 24, width: '55%', margin: '18px 0' }} />
      <div className="skel" style={{ height: 300 }} />
      <div className="skel" style={{ height: 120, marginTop: 12 }} />
    </div>
  );
}
