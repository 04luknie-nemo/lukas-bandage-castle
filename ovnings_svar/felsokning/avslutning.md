# Felsökning, avslutning

## Grupparbete

Grupparbetet, med roller, gruppens anteckningar och min reflektion, finns i [grupparbete/README.md](../grupparbete/README.md).

## 1. Översikt över övningarna

| Del   | Labb gjord        | Övningar gjorda                      | Inte gjorda | Varför      |
| ----- | ----------------- | ------------------------------------ | ----------- | ----------- |
| Del 1 | [1.1](1.0/1.1.md) | [1.2](1.0/1.2.md), [1.3](1.0/1.3.md) | 1.4         | fördjupning |
| Del 2 | [2.1](2.0/2.1.md) | [2.2](2.0/2.2.md), [2.3](2.0/2.3.md) | 2.4         | fördjupning |
| Del 3 | [3.1](3.0/3.1.md) | [3.2](3.0/3.2.md), [3.3](3.0/3.3.md) | 3.4         | fördjupning |
| Del 4 | [4.1](4.0/4.1.md) | [4.2](4.0/4.2.md), [4.3](4.0/4.3.md) | 4.4         | fördjupning |
| Del 5 | [5.1](5.0/5.1.md) | [5.3](5.0/5.3.md), [5.4](5.0/5.4.md) | 5.2, 5.5    | fördjupning |
| Del 6 | [6.1](6.0/6.1.md) | [6.2](6.0/6.2.md)                    | 6.3, 6.4    | fördjupning |

Fördjupningar gör jag om jag hinner, fokus för mig ligger på att se de olika momenten och att inte riskera att fastna, med tanke på den korta tiden jag har.

## 2. Mitt bästa protokoll

Protokollet från [5.3](5.0/5.3.md):

> 5.3 Basilisken och tuppormen
>
> Symptom
> Tuppormen Clucky kan placeras i The Stone Garden, där basilisken Basil bor. Basil kan inte flytta till en lya där Clucky bor: "Basil can't move in: Cockatrice (Mutual petrification. Nobody wins.)". Regeln gäller bara åt ena hållet, trots att meddelandet säger mutual.
>
> Återskapa
>
> 1. Kör npm run db:reset och logga in som keeper.
> 2. Lairs, The Stone Garden: placera Clucky, klicka Assign anyway för mörkervarningen. Det går.
> 3. Försök flytta Basil till lyan där Clucky bor. Nekas.
>
> Hypoteser
>
> - Varningen "too dark" är felet. Test: läste meddelandet. Resultat: det är habitatkontrollen, som kan gås förbi. Kompatibiliteten är en annan kontroll. Föll.
> - Regeln saknas i databasen. Test: SELECT * FROM species_compatibility. Resultat: regeln finns, men bara en gång: species_id 8, basilisk, och incompatible_species_id 9, tupporm. Höll delvis.
> - Koden läser regeln åt ett håll. Test: läste findConflicts i lairs.service.ts. Resultat: den letar bara efter regler där species_id är den nya invånaren. Höll.
>
> Rotorsak
> apps/api/src/modules/lairs/lairs.service.ts, findConflicts. Regeln är sparad en gång, basilisk mot tupporm. Funktionen letar bara efter regler där den nya invånarens art står i species_id. När Clucky flyttar in letar den efter regler för tupporm och hittar inga. Seed-skriptet, prisma/seed/stays.ts rad 279, kontrollerar däremot åt båda hållen.
>
> Varför testet är grönt
> lairs.service.test.ts rad 48–53 saknar await, så expect kontrollerar ett Promise, som alltid är truthy. Även med await hade [] varit truthy. Testet kan inte misslyckas.
>
> Åtgärd
> Kontrollera regeln åt båda hållen, som seed-skriptet gör. Rätta testet: lägg till await och kontrollera exakt resultat med toEqual. Kontroll: Clucky nekas i The Stone Garden, och testet blir rött före fixen och grönt efter.
>
> Vilka antaganden visade sig vara fel?
> Att "too dark" var felet, och att ett grönt test betyder att regeln fungerar.
>
> Hjälpfråga (5.3)
>
> 1. Vad jag förväntade mig: att Clucky inte skulle få vara med i samma lair som Basil.
> 2. Vad som hände: Clucky hamnade i lairet. Jag testade flytta Basil till en lya där Clucky bor, men det gick inte.
> 3. Vad jag hade provat: tittat på varningen "too dark" och kollat efter SQL:en, som visade sig vara en SELECT mot species_compatibility, och kollat där i. Antog att regeln skulle vara mutual.
> 4. Vad jag hade uteslutit: att regeln saknas helt, eftersom Basil nekas.
>
> Hjälpfrågan skrev jag i efterhand, efter att felet var löst.
>
> Vad i frågan pekade mot svaret? Punkt 4: regeln finns, eftersom Basil nekas. Då återstod bara att den läses åt ett håll.

### Varför jag valde det

Jag valde 5.3 eftersom den fick mig att tänka på att felmeddelanden inte alltid stämmer och att gröna tester inte alltid är rätt bara för att de är gröna. Felmeddelandet sa "Mutual petrification", men regeln gällde bara åt ett håll. Testet saknade await, så det kontrollerade ett Promise, som alltid är truthy. Jag trodde först att varningen "too dark" tog över kompatibilitetskontrollen, men det visade sig vara två separata kontroller. Det var också roligt att jobba med objekt med lustiga namn.

## 3. Reflektion

### Gissning eller metod

I onboardingen 6.8 använde jag git bisect för att hitta när länken till /supplies slutade fungera. Första gången markerade jag commits som bad utan att testa sidan i varje steg. Bisect pekade då på en commit som hörde till ADR-008, men den ändrade bara dokumentation och kunde inte ha orsakat felet. Allt är inte bad. Jag gjorde om det och testade /supplies vid varje steg. Hypotesen i varje steg var att länken fungerar i den här committen eller inte. Då hamnade jag på 6821e3d, där navConfig infördes. I apps/web/src/nav/navConfig.ts bestäms routens path, och där stod /supply i stället för /supplies. Den måste stämma överens med routen. Då förstod jag att jag hamnat rätt.

I 5.3 trodde jag först att varningen "too dark" tog över kompatibilitetskontrollen. När jag läste meddelandet såg jag att det var två separata kontroller, och jag kunde stryka den hypotesen.

Att gissa sig fram kan bli rörigt och bli fel utan ett tydligt mål. Med en hypotes blir det mer konkret vad man ska testa, och sedan kan man se om den höll eller föll.

### Symptom och rotorsak

I 4.2 stod det i webben att Brambert är 34, men han har inte fyllt 34 än. Han föddes 1992-11-22 och borde vara 33 ett litet tag till. Jag tittade i Network efter API-svaret, och API:t skickade 34. Då låg inte felet i webben, webben förde bara det vidare. Jag sökte på ageInYears och hittade till filen. I packages/shared/src/dates.ts räknar ageInYears bara år, och månader och dagar tas inte med i beräkningen.

Funktionen hämtas från sex olika ställen. Om man inte lagar i shared kommer problemet att kvarstå på de andra ställena, och möjligen på framtida ställen. Fixar jag det i en fil i webben har jag två olika uträkningar. Bäst är att ha uträkningen på ett ställe, i shared, så att alla ställen garanterat får rätt ålder. Om jag fixar orsaken i shared kommer alla ställen som hämtar åldern att visa rätt. Hade jag lagat symptomet i webben hade Brambert visat rätt ålder på en sida, men fel på de andra fem.

### Felmeddelanden

Det mest missvisande var "oops" i 3.2. Söker man på O'Brien på Monsters händer ingenting. Console sa bara "request failed", och Network visade 500 med svaret "oops". Statuskoden säger att något gick fel på servern, men inte vad. Orsaken, ett SQL-syntaxfel med hela frågan och söktexten inklistrad, fanns bara i terminalen. Loggen var bra för mig som utvecklare. Användaren borde se ett tydligt meddelande, till exempel att sökningen inte gick att genomföra, inte SQL-felet. Men tecknet borde vara tillåtet.

Det som hjälpte mest var skiftbytet i 5.4. När admin försökte lägga samma pass på Old Hobb nekades det med "Already working Wed 07:00–15:00" och "Only 9 hours rest between shifts (minimum 11)". Meddelandet sa vilken regel som bröts, vilken dag och vilken tid. Då förstod jag att admin hade regler för skift, medan bytet inte hade regler alls. De borde ha samma regler, som står på ett ställe, så att inget råkar skilja sig.

### Claude Code

I 2.1 hade jag hypotesen att datumfelet berodde på serverns tidszon. Claude föreslog att starta appen med TZ=UTC npm run dev. Jag kände inte till det kommandot. Med det visade både listan och sidan 2026-11-25, och då visste jag att felet berodde på serverns tidszon och inte på datan. I 5.3 hittade jag frågan mot species_compatibility i PRISMA_LOG, och Claude föreslog att köra SELECT direkt i MySQL. Svaret visade att regeln bara var sparad åt ett håll. Claude gav mig sätt att testa, för att jag själv skulle få insikt i hur man gör.

Två gånger fick jag kontrollera det Claude sa. I 5.3 fick jag en sökning på lairsRouter.post('/:id/assignments') som inte gav någon träff, eftersom raden var uppdelad på flera rader. På framstegssidan sa Claude att 3.2 och 5.1 var avbockade, men när jag dubbelkollade var de inte det.

Nu tänker jag efter en extra gång om det verkligen stämmer och testar själv. Med sökningen hade jag kunnat dela upp den så att den hittas, i stället för att gå till Claude och säga det. Jag vill bli mer självständig. Jag dubbelkollar också när mycket händer samtidigt, eftersom Claude då kan missa saker.

### Min strategi

1. Börja i DevTools. Network avgör om API:t skickar fel data eller om webben gör om datan till något annat. Det skär ner mitt sökområde.

2. Återskapa med ett minsta exempel och ett fall som fungerar. I 2.3 lade jag till en resa som började tidigare än den befintliga, och jämförde med en som började mitt i. Då såg jag att logiken fanns men att en del av den var trasig.

3. Skriv hypoteser innan jag testar, oftast tre. När jag skriver "om hypotesen stämmer ser jag detta" vet jag vad jag ska titta efter, och sökområdet blir smalare.

4. Följ datan bakåt med git grep, sökning i VS Code, PRISMA_LOG, terminalen och MySQL. De tar mig från rätt lager till rätt fil.

5. Pröva det som ser rätt ut. I 3.3 sa kommentaren att testet föll runt midnatt, men det föll alltid, och testet hade rätt. I 5.3 var testet grönt för att await saknades, och felmeddelandet sa mutual fast regeln gällde åt ett håll.

6. Laga där orsaken sitter, annars kan felet kvarstå på flera ställen eller på framtida ställen. Lagningen fungerar när ett test är rött före och grönt efter.

7. Tidsboxa. Om jag fastnar byter jag uppgift, eller skriver en hjälpfråga med vad jag förväntade mig, vad som hände, vad jag provat och vad jag uteslutit, och ber om stöd.

## 4. Vad jag tar med mig

Det var roligt att få jobba mer med DevTools och förstå mer. Jag får en bättre förståelse av flödet mellan anrop och svar. Det var också roligt att prova nya verktyg som Git Bash, git grep och MySQL Command Line Client. Att söka direkt efter filer i VS Code var smidigt när man tittar sig omkring i ett projekt man inte varit delaktig i.

Det svåraste var 6.2, som var förvirrande. Jag vet inte om det hade att göra med att jag hade varit inne hela dagen och var stressad över LIA och mängden uppgifter jag måste få gjort. Network var enklast efter några gånger, när jag visste var jag skulle leta.

Det mest lärorika var att kommentarer inte alltid stämmer med vad som händer. Antingen säger kommentaren något, testet är skippat och koden som körs är trasig, som i 3.3. Eller så är koden trasig fast kommentaren säger något annat. Eller så fungerar koden, men kommentaren är vilseledande.

Jag fick insikt i att försöka mer själv och att absolut inte stressa, eftersom jag lätt tappar tålamodet när jag är stressad. Jag ska fortsätta dubbelkolla det Claude gör. När Claude gör mycket samtidigt är det lätt att detaljer missas.
