const GLOSS: Record<string, [string, string][]> = {
  yhteenveto: [
    ['Pisteet', 'Askelpisteet + urheilu- ja luovuuspisteet + viikkobonukset. Sija lasketaan pisteistä.'],
    ['Putki nyt', 'Peräkkäisten hyvien päivien määrä. Hyvä päivä on vähintään 5 000 askelta. Kesken oleva päivä ei katkaise putkea.'],
    ['Kukkia puutarhassa', 'Päivät, jolloin askeltavoite täyttyi (10 000 askelta, urheilupäivänä 7 000).'],
    ['Täysiä viikkoja', 'Viikot, joina täytit koko viikkotavoitteen ja saat +10 p bonuksen.'],
    ['Sinä ja ryhmä', 'Ryhmä ka. on kaikkien keijujen keskiarvo, sinä mukana. Ero kertoo, kuinka paljon olet sen ylä- tai alapuolella.'],
  ],
  mina: [
    ['Keskiarvo kävelypäivältä', 'Askeleet jaettuna päivillä, joilla on ollut askelia.'],
    ['Keskiarvo / päivä alusta', 'Askeleet jaettuna kaikilla päivillä kisan alusta (nollapäivät mukana).'],
    ['Tavoitepäivät', 'Päivät, jolloin ylitit 10 000 askelta.'],
    ['Putki nyt / ennätys', 'Nykyinen ja pisin hyvien päivien (5 000+) putkesi.'],
    ['Viikon keskiarvo (liukuva)', 'Keskiarvo viimeisiltä 7 päivältä päivä päivältä. Tasoittaa vaihtelut ja näyttää suunnan.'],
    ['Päivien jakauma', 'Montako päivää olet kävellyt vähän (alle 5 000), keskitasoisesti ja paljon.'],
  ],
  ryhma: [
    ['Keskiarvo / keiju-pv', 'Kaikki ryhmän askeleet jaettuna keijun päivillä, joilla on askelia.'],
    ['Tyypillinen / keiju yhteensä', 'Mediaani: keskimmäisen keijun askelmäärä. Yksittäinen ennätys ei vääristä sitä.'],
    ['Osallistuminen', 'Prosenttia keijuista, jotka kävelivät päivänä vähintään 5 000 askelta.'],
    ['Kisan kulku', 'Viiden kärkikeijun pisteet päivä päivältä.'],
  ],
  urheilu: [
    ['Minuutit yhteensä', 'Kaikki urheilusta ja luovasta kirjatut minuutit. Pisteitä luovasta saa enintään 2 h viikossa.'],
    ['Pisteitä vielä tällä viikolla', 'Kuinka monta luovan minuuttia voit vielä kirjata pisteitä varten tällä viikolla.'],
    ['Milloin kirjaat', 'Näyttää, mihin vuorokaudenaikaan teet kirjauksesi (ei varsinaisen treenin aikaa).'],
  ],
  vertailu: [
    ['Kävelypäiviä', 'Päivät, joilta on kirjattu yli 0 askelta.'],
    ['Askelia kävelypäivänä', 'Keskiarvo päivää kohden niiltä päiviltä, joilla on askelia.'],
    ['Putki nyt / Ennätysputki', 'Peräkkäiset hyvät päivät (5 000+ askelta): nykyinen ja pisin.'],
    ['Viikon askeleet', 'Askeleet tällä viikolla (ma–su).'],
    ['Ryhmä ka.', 'Kaikkien keijujen keskiarvo.'],
  ],
  ennatykset: [
    ['Kauden ennätykset', 'Yksittäisten päivien ja kirjausten parhaat tulokset koko kisan ajalta.'],
  ],
};

/** Taittuva selitys tilastojen luvuille (näytetään kunkin välilehden alussa). */
export default function Glossary({ tab }: { tab: string }) {
  const items = GLOSS[tab];
  if (!items) return null;
  return (
    <details className="card gloss">
      <summary>Mitä luvut tarkoittavat? (napauta)</summary>
      <dl>
        {items.map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
    </details>
  );
}
