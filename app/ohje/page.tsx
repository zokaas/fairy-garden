import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getContest } from '@/lib/contest';
import { CONTEST_START, CREATIVE_WEEK_CAP, GROWTH, JOURNEY_GOAL, STEPS_PER_POINT } from '@/lib/garden';
import { WEEK_BONUS, WEEK_GOAL } from '@/lib/weekly';

export const dynamic = 'force-dynamic';

const dm = (d: string) => `${Number(d.slice(8))}.${Number(d.slice(5, 7))}.`;
const fi = (n: number) => n.toLocaleString('fi-FI');

export default async function Ohje() {
  if (!cookies().get('fg_token')) redirect('/');
  const contest = await getContest();
  const end = new Date(contest.end).toLocaleDateString('fi-FI', { timeZone: 'Europe/Helsinki', day: 'numeric', month: 'numeric' });
  return (
    <>
      <h1>Näin kisa toimii</h1>
      <p className="sub">Kuka on reippain keiju? Kisa alkaa {dm(CONTEST_START)} ja päättyy {end}. Eniten pisteitä kerännyt voittaa.</p>

      <section className="card">
        <h2>🏁 Pisteet</h2>
        <ul className="plain">
          <li>🚶 <b>1 piste / {fi(STEPS_PER_POINT)} askelta.</b> Kävely ratkaisee eniten. Askeleet tulevat itsestään Terveys-sovelluksesta.</li>
          <li>💪 <b>1 piste / 30 min urheilua</b> (0,5 p jokaisesta 15 minuutista). Ei ylärajaa.</li>
          <li>🎨 <b>1 piste / 30 min luovaa harrastusta</b> (piirtäminen, virkkaus, lukeminen…). Pisteitä enintään <b>{CREATIVE_WEEK_CAP / 60} h viikossa</b>.</li>
          <li>🎯 <b>+{WEEK_BONUS} pistettä</b> jokaisesta viikosta, kun viikkotavoite täyttyy.</li>
        </ul>
      </section>

      <section className="card">
        <h2>🎯 Viikkotavoite</h2>
        <p className="muted">Viikko alkaa maanantaina. Jotta saat bonuksen, täytä kaikki kolme:</p>
        <ul className="plain">
          <li>👟 Askeltavoite <b>{WEEK_GOAL.stepDays} päivänä</b> viikossa: {fi(WEEK_GOAL.stepsRestDay)} askelta, urheilupäivänä {fi(WEEK_GOAL.stepsSportDay)}.</li>
          <li>💪 <b>{WEEK_GOAL.sportDays} urheilupäivää</b>.</li>
          <li>🎨 <b>{WEEK_GOAL.creativeDays} luova päivä</b>.</li>
        </ul>
      </section>

      <section className="card">
        <h2>🌸 Kukat ja puutarha</h2>
        <p>Jokainen päivä, jolloin askeltavoite täyttyy, kasvattaa puutarhaasi <b>yhden kukan</b>. Puutarhan edessä kasvaa <b>päivän nuppu</b>, joka venyy askelten mukana (neljä vaihetta) ja puhkeaa kukaksi, kun tavoite täyttyy. Puutarha muuttuu kukkien mukana: {GROWTH.slice(1).join(', ')} kukalla aukeaa uusia näkymiä.</p>
      </section>

      <section className="card">
        <h2>🥂 Matka Albertinkadulle</h2>
        <p>Haltijasi kulkee polkua omilla askelillasi. Perillä olet, kun olet kävellyt <b>{fi(JOURNEY_GOAL)} askelta</b>. Polku on etusivun Lisää-osiossa.</p>
      </section>

      <section className="card">
        <h2>👟 Miten askeleet päivittyvät?</h2>
        <ul className="plain">
          <li>Askeleet siirtyvät <b>Fairy Garden -oikotiellä</b> (Komennot-sovellus). Asennus kestää noin 5 min ja tehdään kerran.</li>
          <li>Kun avaat sovelluksen <b>Koti-valikon kuvakkeesta</b>, askeleet synkataan itsestään (enintään 5 minuutin välein).</li>
          <li>Voit synkata myös käsin etusivun napista <b>Synkkaa askeleet nyt</b>.</li>
          <li>Etusivun rivi <b>"Askeleet synkattu"</b> kertoo, milloin luku on viimeksi päivitetty.</li>
          <li>Jos lukusi on selvästi suurempi kuin Terveys-sovelluksessa, ks. <Link href="/shortcut">Synkka-ohje</Link>.</li>
        </ul>
      </section>

      <section className="card">
        <h2>🔔 Ilmoitukset</h2>
        <p>Laita ilmoitukset päälle Profiilissa (sovellus pitää olla lisättynä Koti-valikkoon). Saat muistutuksen puuttuvista askelista ja maanantaisin viime viikon yhteenvedon.</p>
      </section>

      <div className="row">
        <Link className="btn" href="/shortcut">Synkka-ohje</Link>
        <Link className="btn ghost" href="/kisa">Takaisin kisaan</Link>
      </div>
    </>
  );
}
