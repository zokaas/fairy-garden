import { redirect } from 'next/navigation';

/** Vanha osoite: Kärki on nyt Kisa-sivun välilehti. */
export default function Karki({ searchParams }: { searchParams: { lista?: string; nayta?: string } }) {
  const q = new URLSearchParams();
  if (searchParams.lista) q.set('lista', searchParams.lista);
  if (searchParams.nayta) q.set('nayta', searchParams.nayta);
  redirect(`/kisa${q.size ? `?${q}` : ''}`);
}
