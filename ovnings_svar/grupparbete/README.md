# Grupparbete: Bandage Castle

**Grupp Blå:** Daniel, Lukas, Christian och Filip.

Grupparbetet gällde alla tre övningsdokumenten: onboardingen, Felsökningsstrategi och Problemanalys. Vi hjälpte varandra att bli klara med det som var kvar. Var och en skrev sina egna svar i sitt eget svarsdokument.

## Var stod vi?

### Måndag 23 november, innan vi började

| | Onboarding | Felsökning | Problemanalys |
|---|---|---|---|
| Filip | Del 1 med fördjupningar, 2.1–2.3, 3.1–3.4, nästan hela Del 5 och 7. Inget i Del 4 och 6. | Bara labb 1.1 | Inget |
| Daniel | Del 1, 2.1, ungefär halva Del 3, Del 5 till 5.8, nästan hela Del 7. Inget i Del 0, 4 och 6. | Inte börjat | Inte börjat |
| Christian | Del 0, Del 1 till 1.6, Del 2 till 2.7, Del 3 till 3.8, Del 4 till 4.7. Inget i Del 5–7. | Del 1, 2 och 4 | Del 1 |
| Lukas | Del 1, 2.1, 5.1–5.2, Del 6, 7.10 | Alla delar, med avslutning | 1.1–1.3, 2.1, 2.3, 3.1, 3.3, 5.1, 6.1, med avslutning |

### Onsdag 25 november, efter passet

Vi gjorde fyra labbar tillsammans: Felsökning 1.1, 3.1 och 3.3 och Problemanalys 2.1. Del 3 i Felsökning är nu klar för G för alla fyra.

## Labbarna vi gjorde tillsammans

Rollerna roterade, så att alla fick prova alla fyra.

| Labb | Förare | Navigatör | Protokollförare | Ifrågasättare |
|---|---|---|---|---|
| Felsökning 1.1 | Filip | Lukas | Christian | Daniel |
| Felsökning 3.1 | Daniel | Christian | Filip | Lukas |
| Felsökning 3.3 | Lukas | Filip | Daniel | Christian |
| Problemanalys 2.1 | Christian | Daniel | Lukas | Filip |

## Gruppens anteckningar

Protokollföraren skrev ner det här under passet. Det är gruppens gemensamma anteckningar, inte mina egna svar.

### Felsökning 1.1

| Rubrik | Innehåll |
|---|---|
| Symptom | Beloppet är olika på listvyn och detaljvyn för fakturor, faktura 11. |
| Återskapa | Logga in som admin, navigera till invoices, notera beloppet för faktura 11. Gå in på faktura 11 och jämför beloppet. |
| Hypoteser | Skickade API:t fel? Föll. Olika formatering av beloppen på sidorna. Stämmer. |
| Rotorsak | Inkonsekvent formatering av belopp. Olika funktioner formaterar olika: formatGP och formatGold. |
| Åtgärd | Bara använda formatGold. Konsekvent formatering av beloppen överallt. API:t borde skicka heltal. |

### Felsökning 3.1

| Rubrik | Innehåll |
|---|---|
| Symptom | När vet besöker vissa patientsidor blir sidan helt blank, inklusive menyn. |
| Återskapa | Logga in som vet. Gå in på Vet i menyn för att se patientlistan. Klicka på Pebble och notera hur hela sidan blir blank. |
| Hypoteser | Skickar API:t fel data? Föll. Webben förväntar sig minst ett record och hanterar inte ett tomt svar. Stämmer. |
| Rotorsak | VetDashboardPage.tsx hanterar inte tomma records-listor. filter-funktionen får in en lista som förväntas ha innehåll, och då kraschar sidan. |
| Åtgärd | Hantera tomma records-listor och gör en villkorad rendering för när listan har innehåll eller inte. |

### Felsökning 3.3

| Rubrik | Innehåll |
|---|---|
| Symptom | Hämtning på avtalad dag ger en sen dag. |
| Återskapa | Be Claude köra testet som inte kördes tidigare, som kollar att man inte får en avgift. |
| Hypoteser | Tidszoner. Föll: testet gav 1 i stället för 0 i UTC, Europe/Stockholm, America/Los_Angeles och Asia/Tokyo, och mitt på dagen. Beräkningen görs på fel sätt. Stämmer. |
| Rotorsak | En dag läggs på hämtningsdagen. |
| Åtgärd | Ta bort påslaget för differensen. Se till att testet körs. |

### Problemanalys 2.1

| Rubrik | Innehåll |
|---|---|
| Symptom | Med Hit Count 11 ska programmet inte stanna, men det gör det. Sidan visar "Opening the castle gates". |
| Återskapa | Species-sidan, brytpunkt på rad 26 och 36. |
| Hypoteser | API:t får dubbla anrop. Höll. Hit Count räknar per sidladdning. Föll: med nya brytpunkter stannade 20 i första laddningen, och 21 först i den andra. |
| Rotorsak | 2 anrop × 10 regler blir 20 körningar av rad 26 när labben räknar med 10. Sidan gör två anrop för att React.StrictMode i utvecklingsläge kör hämtningen två gånger. |
| Åtgärd | Kolla hur många anrop sidan gör innan man väljer Hit Count. |

## Kommandon och fällor att komma ihåg

- **Samma utgångsläge före varje labb:** git status, git switch main, git status och npm run db:reset.
- **Testa tidszonen:** for tz in UTC Europe/Stockholm America/Los_Angeles Asia/Tokyo; do TZ=$tz npx vitest run apps/api/src/legacy/billing/billing.test.ts; done
- **Hit Count** räknar alla träffar sedan brytpunkten sattes, inte per sidladdning. Sätt en ny brytpunkt om räknaren ska börja om.
- **Sidan hänger sig** när debuggern står still, eftersom hela API:t väntar. Tryck F5 i VS Code.
- **rules.length ger ReferenceError** om debuggern inte står i rulesFor, eller om rad 23 inte har körts än. Stega in med F11 och kör raden med F10.
- **Lady Grimsbys bokningar** godkänns automatiskt. Använd grizelda när en förfrågan ska synas i listan.

## Min reflektion

**Vilka labbar och övningar gjorde jag i gruppen, och i vilken roll?**
Felsökning 1.1 som navigatör, 3.1 som ifrågasättare, 3.3 som förare och Problemanalys 2.1 som protokollförare. Jag fick prova alla fyra rollerna en gång var.

**Ett tillfälle då någon annan i gruppen tänkte annorlunda än jag. Vad lärde jag mig av det?**
[Fyll i]

**Ett tillfälle då jag hjälpte någon. Vilken fråga ställde jag?**
[Fyll i]

**Vad skulle jag göra annorlunda nästa gång jag felsöker tillsammans med andra?**
[Fyll i]
