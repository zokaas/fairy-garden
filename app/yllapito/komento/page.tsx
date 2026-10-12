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
  const hasLink = !!process.env.NEXT_PUBLIC_SHORTCUT_INSTALL_URL;
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
          <li><b>Lista</b> (List): seitsemän riviä <code>0 1 2 3 4 5 6</code>.</li>
          <li><b>Toista jokaiselle</b> (Repeat with Each) tälle listalle. Toiston sisään, tässä järjestyksessä:
            <ol>
              <li><b>Säädä päivämäärää</b> (Adjust Date): <i>Nykyinen päivämäärä</i>, vähennä <i>Toiston kohde</i> päivää. Nimeä <b>Päivä</b>.</li>
              <li><b>Säädä päivämäärää</b>: <b>Päivä</b>, <i>Hae päivän alku</i> (Get Start of Day). Nimeä <b>Alku</b>.</li>
              <li><b>Säädä päivämäärää</b>: <b>Alku</b>, lisää 1 päivä. Nimeä <b>Loppu</b>.</li>
              <li><b>Muotoile päivämäärä</b> (Format Date): <b>Päivä</b>, muoto <i>Mukautettu</i> <code>yyyy-MM-dd</code>. Nimeä <b>Päivämerkki</b>.</li>
              <li><b>Etsi terveysnäytteitä</b> (Find Health Samples): Tyyppi <i>Askelmäärä</i> (Step Count), Alkamispäivä <i>on välillä</i> (is between) <b>Alku</b> ja <b>Loppu</b>.</li>
              <li><b>Laske tilastot</b> (Calculate Statistics): <i>Summa</i> (Sum).</li>
              <li><b>Teksti</b> (Text): <code>[Päivämerkki]=[Tilasto]</code> (valitse muuttujat), sitten <b>Lisää muuttujaan</b> (Add to Variable) nimellä <b>Rivit</b>.</li>
            </ol>
          </li>
          <li>Toiston jälkeen: <b>Yhdistä tekstit</b> (Combine Text): <b>Rivit</b>, erotin <i>Uusi rivi</i> (New Lines).</li>
          <li><b>Hae URL-osoitteen sisältö</b> (Get Contents of URL):
            <ul>
              <li>URL <code>{url}</code> <CopyButton text={url} label="Kopioi osoite" /></li>
              <li>Tapa <b>POST</b>, Pyynnön runko <b>JSON</b>, lisää kaksi tekstikenttää:</li>
              <li><code>token</code> = <i>(kirjoita tähän väliaikaisesti oma avaimesi, ks. kohta 2)</i></li>
              <li><code>lines</code> = <b>Yhdistetty teksti</b></li>
            </ul>
          </li>
        </ol>
        <p className="muted">Jos “on välillä” -suodatinta ei löydy, valitse <i>Alkamispäivä</i> → <i>on jälkeen</i> “Alku” ja lisää toinen ehto <i>on ennen</i> “Loppu”. Aja komento kerran ja tarkista, että viimeiset päivät näkyvät Tilastoissa.</p>
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
