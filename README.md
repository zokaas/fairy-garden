# Fairy Garden – askeleet

Next.js-PWA, johon askeleet tulevat iPhonen Komennot-automaatiosta (ei App Storea, ei maksuja).

## Käyttöönotto
1. **Supabase:** luo projekti, aja `supabase/migrations/000_kaikki.sql` SQL Editorissa (idempotentti: voit ajaa uudelleen, kun koodiin tulee uusia osia). Kopioi Project URL ja `service_role`-avain (Project Settings → API).
2. **Vercel:** tuo repo, lisää ympäristömuuttujat `.env.example`-tiedoston mukaan.
3. **Jaa osoite porukalle.** Jokainen: avaa sivu Safarilla → Jaa → *Lisää Koti-valikkoon* → anna nimi → seuraa `/shortcut`-ohjetta (noin 5 min, kerran).

## Miten askeleet kulkevat
Komennot-automaatio (joka päivä klo 21) lukee Terveydestä päivän askelsumman ja tekee `POST /api/steps` `{ "token": "...", "steps": 8234 }`. Palvelin tallentaa päivän suurimman arvon, joten myöhäinen nollasynkka ei tyhjennä päivää.

## Päivitykset
Kun saat virheitä tai uusia ominaisuuksia, aja `supabase/migrations/000_kaikki.sql` uudelleen. Tarkista tila osoitteesta `/api/health`.

Sovellus on vain gaalaa edeltävään reippauskisaan (askeleet ja liikunta). Kisan päättymisaika ja palkinto asetetaan ylläpidossa.

## Ajastukset (Vercel Cron)
- `/api/cron/aamu`: klo 9 muistutus puuttuvista eilisen askelista.
- `/api/cron/maanantai`: maanantaisin klo 9 viime viikon yhteenveto (pisteet, sija, tavoite).
Molemmat vaativat `CRON_SECRET`- ja VAPID-ympäristömuuttujat (ks. `.env.example`).

## Jaettava Komennot-oikotie
Tee askelten synkka-komento kerran omalla iPhonellasi (ohje: ylläpito → Jaettava komento), jaa se iCloud-linkkinä ja lisää linkki Verceliin muuttujaan `NEXT_PUBLIC_SHORTCUT_INSTALL_URL`. Uudet käyttäjät näkevät silloin ohjesivulla yhden napin "Asenna oikotie". Komento kysyy asentaessa jokaisen oman avaimen.

## Askelten lähetys
`POST /api/steps` hyväksyy `{ token, steps }` (tämä päivä) tai takautuvasti `{ token, lines: "2026-10-09=8234\n2026-10-08=7120" }` (enintään 14 pv vanhat). Päivälle jää aina suurin arvo.

## Testit
`npm test`
