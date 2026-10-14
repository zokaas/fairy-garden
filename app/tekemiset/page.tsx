import { redirect } from 'next/navigation';

/** Vanha osoite: Kaikki-näkymä on nyt Päivät-sivun välilehti. */
export default function Tekemiset() {
  redirect('/paivat?nakyma=kaikki');
}
