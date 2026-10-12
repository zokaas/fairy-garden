import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CopyButton from '@/components/CopyButton';
import SyncButton from '@/components/SyncButton';

export const dynamic = 'force-dynamic';

export default function ShortcutGuide() {
  const token = cookies().get('fg_token')?.value;
  if (!token) redirect('/');
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const url = `${site}/api/steps`;
  const install = process.env.NEXT_PUBLIC_SHORTCUT_INSTALL_URL;
  const body = JSON.stringify({ token, steps: '<Askeleet>' });
  const bodyDays = JSON.stringify({ token, lines: '<Rivit>' });

  return (
    <>
      <h1>Askelten automaattisynkka</h1>
      <p className="sub">Tehdään kerran, sen jälkeen iPhone lähettää askeleesi itse.</p>

      <section className="card">
        <h2>Sinun salainen avaimesi</h2>
        <span className="tok">{token}</span>
        <CopyButton text={token} label="Kopioi avain" />
        <p className="muted">Älä jaa tätä muille: avaimella voi kirjata askelia sinun nimissäsi.</p>
      </section>

      {install && (
        <section className="card">
          <h2>1. Pikavalinta: asenna valmis oikotie</h2>
          <ol className="steps-list">
            <li>Napauta alla olevaa nappia ja valitse <b>Lisää komento</b>.</li>
            <li>Kun komento kysyy <b>Avain</b>, liitä yllä kopioimasi avain.</li>
            <li>Salli pääsy Terveyteen. Valmis!</li>
          </ol>
          <a className="btn" href={install}>Asenna oikotie</a>
        </section>
      )}

      <section className="card">
        <h2>{install ? 'Tai tee oikotie käsin: yksinkertainen versio' : 'Oikotie: yksinkertainen versio (vain tämä päivä)'}</h2>
        <ol className="steps-list">
          <li>Avaa <b>Komennot</b> → <b>+</b> → uusi komento, nimeksi “Fairy Garden”.</li>
          <li>Lisää <b>Etsi terveysnäytteitä</b>: Tyyppi on <i>Askelmäärä</i>, Alkamispäivä on <i>tänään</i>.</li>
          <li>Lisää <b>Laske tilastot</b>: <i>Summa</i> edellisestä.</li>
          <li>Lisää <b>Hae URL-osoitteen sisältö</b>:
            <code>{url}</code>
            <CopyButton text={url} label="Kopioi osoite" />
            Tapa: <b>POST</b>, pyynnön runko: <b>JSON</b>, ja lisää kentät:
            <code>token = {token}{'\n'}steps = (Laskettu tilasto)</code>
            <CopyButton text={body} label="Kopioi JSON-malli" />
          </li>
          <li>Anna Komennot-sovelluksen käyttää Terveyttä, kun iPhone kysyy.</li>
        </ol>
      </section>

      <section className="card">
        <h2>Suositus: takautuva versio (viimeiset 7 päivää)</h2>
        <p className="muted">Jos automaatio jää yhtenä iltana pois, tämä versio korjaa puuttuvat päivät itsestään seuraavalla kerralla. Se on vähän pidempi tehdä, mutta kannattaa.</p>
        <ol className="steps-list">
          <li>Tee uusi komento “Fairy Garden” (tai muokkaa vanhaa).</li>
          <li>Lisää <b>Lista</b>, jossa on rivit <code>0 1 2 3 4 5 6</code> (yksi numero per rivi).</li>
          <li>Lisää <b>Toista jokaiselle</b> tälle listalle. Toiston sisään:
            <ol>
              <li><b>Säädä päivämäärää</b>: nykyinen päivämäärä, vähennä <i>Toiston kohde</i> päivää.</li>
              <li><b>Muotoile päivämäärä</b>: mukautettu muoto <code>yyyy-MM-dd</code>.</li>
              <li><b>Etsi terveysnäytteitä</b>: Tyyppi <i>Askelmäärä</i>, Alkamispäivä on <i>säädetty päivämäärä</i>.</li>
              <li><b>Laske tilastot</b>: <i>Summa</i>.</li>
              <li><b>Teksti</b>: <code>[muotoiltu päivämäärä]=[tilasto]</code> ja <b>Lisää muuttujaan</b> “Rivit”.</li>
            </ol>
          </li>
          <li>Toiston jälkeen: <b>Yhdistä tekstit</b> (Rivit), erottimena <i>Uusi rivi</i>.</li>
          <li><b>Hae URL-osoitteen sisältö</b>: osoite <code>{url}</code>, tapa <b>POST</b>, runko <b>JSON</b>, kentät <code>token</code> ja <code>lines</code> (= yhdistetty teksti).
            <CopyButton text={bodyDays} label="Kopioi JSON-malli" />
          </li>
        </ol>
        <p className="muted">Palvelin tallentaa jokaiselle päivälle suuremman arvon vanhasta ja uudesta, joten uudelleen lähetys ei haittaa. Ennen kuin luotat tähän, aja komento kerran ja tarkista, että viimeiset päivät näkyvät Tilastoissa. Jos jokin kohta ei toimi, käytä yksinkertaista versiota yllä.</p>
      </section>

      <section className="card">
        <h2>Automaatio (kaikille versioille)</h2>
        <ol className="steps-list">
          <li>Komennot → <b>Automaatio</b> → <b>+</b> → <b>Vuorokaudenaika</b>, esim. 21:00, joka päivä.</li>
          <li>Valitse “Fairy Garden” ja <b>Suorita heti</b> (ei kysy joka kerta).</li>
        </ol>
        <p className="muted">Jos automaatio ei aina laukea, paina etusivun Synkkaa askeleet nyt -nappia kerran päivässä.</p>
      </section>

      <section className="card">
        <h2>Kokeile heti</h2>
        <SyncButton site={site} />
      </section>

      <Link className="btn" href="/">Takaisin puutarhaan 🌸</Link>
    </>
  );
}
