import { SHORTCUT_INSTALL_URL } from '@/lib/shortcut';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { loadGarden } from '@/lib/data';
import { ago } from '@/lib/garden';
import CopyButton from '@/components/CopyButton';
import SyncButton from '@/components/SyncButton';
import { AutoSyncToggle } from '@/components/AutoSync';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function ShortcutGuide() {
  const token = cookies().get('fg_token')?.value;
  if (!token) redirect('/');
  const { me } = await loadGarden();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const url = `${site}/api/steps`;
  const install = SHORTCUT_INSTALL_URL;
  const body = JSON.stringify({ token, steps: '<Askeleet>' });
  const bodyDays = JSON.stringify({ token, values: '<values>' });
  const working = !!me?.hasSteps;

  return (
    <>
      <h1>Askelten synkka</h1>
      <p className="sub">Tehdään kerran. Sen jälkeen iPhone lähettää askeleesi itse.</p>

      <section className={`card ${working ? 'quests all' : ''}`}>
        <h2>Tila</h2>
        {working ? (
          <p><b>Synkka toimii.</b> Viimeksi synkattu {ago(me?.lastSync ?? null)}. Tarkista silti, että automaatio on tehty (vaihe 4).</p>
        ) : (
          <p><b>Ei vielä synkattu.</b> Tee alla olevat vaiheet. Kun ensimmäinen synkka onnistuu, tämä kortti muuttuu.</p>
        )}
      </section>

      {install ? (
        <section className="card">
          <h2>Asenna kolmessa vaiheessa</h2>
          <ol className="steps-list">
            <li><b>Kopioi avaimesi</b> (salainen, älä jaa muille)
              <span className="tok">{token}</span>
              <CopyButton text={token} label="Kopioi avain" />
            </li>
            <li><b>Asenna oikotie</b>: napauta alla, valitse <i>Lisää komento</i>. Kun komento kysyy <b>Avain</b>, liitä kopioimasi avain. Salli pääsy Terveyteen.
              <a className="btn" href={install}>Asenna oikotie</a>
            </li>
            <li><b>Kokeile</b>: aja komento kerran.
              <SyncButton site={site} />
              <AutoSyncToggle />
              <span className="muted"> Kun kokeilu on onnistunut, sovellus synkkaa itse aina kun avaat sen kotivalikosta.</span>
            </li>
            <li><b>Automaatio</b> (tehdään kerran): Komennot → <i>Automaatio</i> → <b>+</b> → <i>Vuorokaudenaika</i>. Tee kaksi: klo <b>07:00</b> ja klo <b>21:00</b>, molemmat joka päivä. Valitse “Fairy Garden” ja <b>Suorita heti</b>. Aamuajo viimeistelee eilisen päivän askeleet. Jos puhelin on lukossa, iOS ei välttämättä anna Terveys-dataa, mutta avatessasi sovelluksen synkka ajetaan joka tapauksessa.</li>
          </ol>
        </section>
      ) : (
        <section className="card nudge">
          <h2>Asennuslinkki puuttuu vielä</h2>
          <p>Ylläpitäjä ei ole vielä lisännyt valmista oikotietä. Pyydä häntä tekemään se (ohje ylläpidossa), tai tee oikotie käsin alla olevan ohjeen mukaan.</p>
        </section>
      )}

      <details className="card manual" open={!install}>
        <summary><b>Tee oikotie käsin</b>{install ? ' (jos asennuslinkki ei toimi)' : ''}</summary>
        <div style={{ marginTop: 12 }}>
          {!install && (
            <>
              <h2>Avaimesi</h2>
              <span className="tok">{token}</span>
              <CopyButton text={token} label="Kopioi avain" />
            </>
          )}
          <h2 style={{ marginTop: 14 }}>Yksinkertainen versio (vain tämä päivä)</h2>
          <ol className="steps-list">
            <li>Avaa <b>Komennot</b> → <b>+</b> → uusi komento, nimeksi “Fairy Garden”.</li>
            <li>Lisää <b>Etsi terveysnäytteitä</b>: Tyyppi on <i>Askelmäärä</i>, Alkamispäivä on <i>tänään</i>.</li>
            <li>Lisää <b>Laske tilastot</b>: <i>Summa</i> edellisestä.</li>
            <li>Lisää <b>Hae URL-osoitteen sisältö</b>:
              <code>{url}</code>
              <CopyButton text={url} label="Kopioi osoite" />
              Tapa <b>POST</b>, runko <b>JSON</b>, kentät:
              <code>token = {token}{'\n'}steps = (Laskettu tilasto)</code>
              <CopyButton text={body} label="Kopioi JSON-malli" />
            </li>
            <li>Salli pääsy Terveyteen, kun iPhone kysyy.</li>
          </ol>

          <h2 style={{ marginTop: 14 }}>Takautuva versio (viimeiset 7 päivää)</h2>
          <p className="muted">Korjaa ohi menneet päivät itsestään. Pidempi, mutta suositeltava.</p>
          <ol className="steps-list">
            <li><b>Etsi terveysnäytteitä</b>: Askelmäärä, Alkamispäivä <i>on viimeisen</i> 7 päivää, Yksikkö <i>count</i>, <b>Ryhmittele: Päivä</b>, <b>Täytä puuttuvat</b> päälle.</li>
            <li><b>Toista jokaiselle</b> näytteelle: <b>Laske tilastot</b> (Summa, Toiston kohde), sitten <b>Lisää muuttujaan</b> “values”.</li>
            <li>Toiston jälkeen: <b>Yhdistä tekstit</b> (values), erottimena <i>Uusi rivi</i>.</li>
            <li><b>Hae URL-osoitteen sisältö</b>: osoite <code>{url}</code>, <b>POST</b>, <b>JSON</b>, kentät <code>token</code> ja <code>values</code> (= yhdistetty teksti).
              <CopyButton text={bodyDays} label="Kopioi JSON-malli" />
            </li>
          </ol>
        </div>
      </details>

      <Link className="btn" href="/">Takaisin puutarhaan</Link>
    </>
  );
}
