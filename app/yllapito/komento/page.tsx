import { SHORTCUT_INSTALL_URL } from '@/lib/shortcut';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { loadGarden } from '@/lib/data';
import CopyButton from '@/components/CopyButton';

export const dynamic = 'force-dynamic';

export default async function KomentoOhje() {
  const { me } = await loadGarden();
  if (!me?.isAdmin) redirect('/');
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://SINUN-OSOITE';
  const url = `${site}/api/steps`;
  const hasLink = !!SHORTCUT_INSTALL_URL;
  const msg = `Hei! Fairy Garden -kisa alkaa. Näin pääset mukaan (5 min):\n1) Avaa ${site} Safarilla, luo keiju ja valitse Jaa → Lisää Koti-valikkoon.\n2) Avaa sovellus kotinäytöltä ja mene Profiili → Ilmoitukset → laita päälle.\n3) Etusivun "Aloita"-kortista: kopioi avaimesi, asenna oikotie ja liitä avain kun komento kysyy.\n4) Tee kaksi automaatiota (07:00 ja 21:00) ohjeen mukaan.`;

  return (
    <>
      <h1>Jaettava komento</h1>
      <p className="sub">Tee kerran omalla iPhonellasi. Sen jälkeen kaikki muut asentavat sen yhdellä napilla.</p>

      <section className={`card ${hasLink ? 'quests all' : 'nudge'}`}>
        <h2>Tila</h2>
        <p>{hasLink ? <><b>Asennuslinkki on käytössä.</b> Uudet käyttäjät näkevät sen automaattisesti ohjesivulla.</> : <><b>Asennuslinkkiä ei ole vielä asetettu.</b> Tee alla oleva komento ja lisää linkki Verceliin.</>}</p>
      </section>

      <section className="card">
        <h2>1. Rakenna komento (noin 10 min)</h2>
        <p className="muted">Komennot-sovellus (Shortcuts) iPhonessa. Toiminnot suomeksi, englanti suluissa. Tämä on versio, joka lähettää viimeiset 7 päivää, joten ohi mennyt päivä korjautuu itsestään.</p>
        <ol className="steps-list">
          <li>Komennot → <b>+</b> → nimeksi <b>Fairy Garden</b>.</li>
          <li><b>Etsi terveysnäytteitä</b> (Find Health Samples): Tyyppi <i>Askelmäärä</i> (Steps), Alkamispäivä <i>on viimeisen</i> (is in the last) <b>7 päivää</b>. Alla: Yksikkö <i>count</i>, <b>Ryhmittele: Päivä</b> (Group by Day), <b>Täytä puuttuvat</b> (Fill Missing) päälle.</li>
          <li><b>Toista jokaiselle</b> (Repeat with Each) näytteelle. Sisään: <b>Laske tilastot</b> (Calculate Statistics), <i>Summa</i> (Sum) kohteesta <i>Toiston kohde</i>, sitten <b>Lisää muuttujaan</b> (Add to Variable): <b>Summa</b> muuttujaan <b>values</b>.</li>
          <li>Toiston jälkeen: <b>Yhdistä tekstit</b> (Combine Text): <b>values</b>, erotin <i>Uusi rivi</i> (New Lines).</li>
          <li><b>Nykyinen päivämäärä</b> (Current Date), sen perään <b>Muotoile päivämäärä</b> (Format Date): <i>Päivämäärän muoto</i> → <b>Mukautettu</b> (Custom), muoto <code>yyyy-MM-dd</code>. Näin luvut kohdistuvat puhelimen omaan päivään myös ulkomailla.</li>
          <li><b>Hae URL-osoitteen sisältö</b> (Get Contents of URL):
            <ul>
              <li>URL <code>{url}</code> <CopyButton text={url} label="Kopioi osoite" /></li>
              <li>Tapa <b>POST</b>, Pyynnön runko <b>JSON</b>, lisää kolme tekstikenttää:</li>
              <li><code>token</code> = <i>(kirjoita tähän väliaikaisesti oma avaimesi, ks. kohta 2)</i></li>
              <li><code>values</code> = <b>Yhdistetty teksti</b></li>
              <li><code>today</code> = <b>Muotoiltu päivämäärä</b> (Formatted Date, valitse muuttuja, älä kirjoita tekstiä). Kenttä on vapaaehtoinen, vanha komento toimii ilman sitä.</li>
            </ul>
          </li>
        </ol>
        <p className="muted">Palvelin laskee päivämäärät itse: viimeinen luku on tämä päivä, edelliset taaksepäin. Jos uusin päivä on listassa ensin, lisää kenttä <code>newest</code> = <code>first</code>. Aja komento kerran ja tarkista, että päivät näkyvät Tilastoissa.</p>
      </section>

      <section className="card">
        <h2>2. Tee avaimesta asennuskysymys</h2>
        <p className="muted">Näin jokainen liittää asentaessaan oman avaimensa, eikä sinun avaintasi jaeta.</p>
        <ol className="steps-list">
          <li>Avaa komento ja napauta oikean yläkulman <b>i</b>-painiketta → <b>Asetukset</b>.</li>
          <li>Valitse <b>Asennuskysymykset</b> (Import Questions) ja lisää kysymys kentälle <code>token</code>. Kysymys: <i>Liitä sovelluksen avain</i>.</li>
          <li>Tyhjennä <code>token</code>-kentästä oma avaimesi (kysymys täyttää sen asentaessa).</li>
        </ol>
      </section>

      <section className="card">
        <h2>3. Jaa ja lisää linkki</h2>
        <ol className="steps-list">
          <li>Komennon valikosta <b>Jaa</b> → <b>Kopioi iCloud-linkki</b>.</li>
          <li>Vercel → projekti → Settings → Environment Variables → lisää <code>NEXT_PUBLIC_SHORTCUT_INSTALL_URL</code> = kopioitu linkki → Redeploy.</li>
          <li>Kokeile itse toisella tunnuksella tai puhelimella: ohjesivulla pitäisi näkyä <b>Asenna oikotie</b> -nappi.</li>
        </ol>
      </section>

      <section className="card">
        <h2>4. Kerro porukalle</h2>
        <code style={{ whiteSpace: 'pre-wrap' }}>{msg}</code>
        <CopyButton text={msg} label="Kopioi viesti" />
      </section>

      <Link className="btn ghost" href="/yllapito">Takaisin ylläpitoon</Link>
    </>
  );
}
