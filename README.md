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

## Testit
`npm test`
