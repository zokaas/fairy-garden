import { revalidateTag } from 'next/cache';

/** Yhteinen tunniste jaetulle datalle (askeleet, liikunta, asetukset). Kirjoitukset tyhjentävät sen, muuten tieto uusiutuu 30 s välein. */
export const DATA_TAG = 'fg-data';
export const bustData = () => revalidateTag(DATA_TAG);
