# Problemanalys, avslutning

## 1. Översikt över övningarna

| Del   | Labb gjord        | Övningar gjorda                      | Inte gjorda, och varför                              |
| ----- | ----------------- | ------------------------------------ | ---------------------------------------------------- |
| Del 1 | [1.1](1.0/1.1.md) | [1.2](1.0/1.2.md), [1.3](1.0/1.3.md) | 1.4, 1.5: fördjupning, frivilliga                    |
| Del 2 | [2.1](2.0/2.1.md) | [2.3](2.0/2.3.md)                    | 2.2: siktade på G. 2.4, 2.5: fördjupning, frivilliga |
| Del 3 | [3.1](3.0/3.1.md) | [3.3](3.0/3.3.md)                    | 3.2: siktade på G. 3.4: fördjupning, frivillig       |
| Del 4 | [4.1](4.0/4.1.md) | [4.2](4.0/4.2.md)                    | 4.3: siktade på G. 4.4: fördjupning, frivillig       |
| Del 5 | [5.1](5.0/5.1.md) | [5.2](5.0/5.2.md)                    | 5.3: fördjupning, frivillig                          |
| Del 6 | [6.1](6.0/6.1.md) | [6.2](6.0/6.2.md)                    | 6.3: fördjupning, frivillig                          |

Jag följde lärarens G-krav: labben plus minst en Öva själv i varje del.

## 2. Mitt bästa protokoll

Protokollet från [1.3](1.0/1.3.md):

> ### Symptom
>
> Faktura #11 visar 564.54 gp i listan, men 564.55 gp på detaljsidan.
>
> ### Återskapa
>
> 1. Logga in som admin och öppna Invoices med DevTools öppet.
> 2. Öppna money.ts under Debugger (Ctrl+P) och sätt en brytpunkt i formatGP.
> 3. Gör brytpunkten villkorad med n === 564.55 och ladda om sidan.
>
> ### Hypoteser
>
> - Värdet blir fel innan Math.floor. Test: n * 100 i Console medan sidan stod still. Resultat: 56454.99999999999. Höll.
>
> ### Rotorsak
>
> formatGP i apps/web/src/money.ts gör Math.floor(n * 100) / 100. 564.55 lagras som ett flyttal strax under, och Math.floor kapar till 56454, alltså 564.54.
>
> ### Åtgärd
>
> Räkna med koppar som heltal, som ADR-006 säger, och formatera med formatCopper.
>
> ### Verktyg
>
> - Debuggern i webbläsaren, eftersom formatGP körs i webben och inte i API:t.
> - Villkorad brytpunkt med n === 564.55, så att den bara stannade för faktura #11 och inte för varje faktura i listan.
> - Console för att räkna n * 100 med det riktiga värdet.

### Varför jag valde det

Protokollet i 1.3 var nog roligast. Det var bland de tydligaste uppgifterna, där man förstod att det fanns ett tydligt fel. Med en villkorad brytpunkt, n === 564.55, stannade debuggern bara för faktura #11 och inte för varje faktura i listan. I Console såg jag 56454.99999999999 i den riktiga koden, samma värde som jag räknat fram i Felsökning 1.1.

## 3. Reflektion

### Debuggern

I 1.1 visade detaljsidan för faktura #238 50 gp och v2, fast Billing v2 skulle vara avstängt. Hade jag bara läst .env-filen hade det stått false, och då hade jag tänkt att flaggan var av. Med en brytpunkt på rad 30 i billing.routes.ts och Step Into kom jag in i billingV2Enabled. Där visade debuggern "false" med citattecken, alltså en sträng och inte en bool. I Debug Console gav !!process.env.ENABLE_BILLING_V2 true, eftersom variabeln inte var tom. Det såg jag inte genom att läsa koden.

Villkorlig brytpunkt var också användbart, till exempel i 2.1 och 1.3. Annars måste jag köra igenom om och om igen tills jag kommer dit jag ville stanna, och stega igenom med risk att missa stegningen. Med villkoret stannade den bara där jag ville. I .NET hade GetValue <bool> tolkat texten false rätt, så det här felet hade jag aldrig letat efter. Debuggern visade vilken typ värdet hade, inte bara vad det stod.

### Fel verktyg

I 6.1 visade startsidan Lady Grimsbys monster efter att jag loggat ut och loggat in som grizelda inom en minut. Jag satte först en brytpunkt i API:t, på res.json i dashboard.routes.ts. Den stannade för owner, men inte för grizelda. Den stannade inte för att nyckeln för monstren redan fanns i minnet, så webben skickade inget nytt anrop till servern. Först när timern gick ut efter 60 sekunder var nyckeln gammal, och då stannade debuggern.

Debuggern i API:t var fel verktyg, men att den inte stannade var ändå information. Den uteslöt hela servern. Debuggern i webbläsaren gav sedan svaret: logout sätter user till null, men tömmer aldrig cachen.

Det lärde mig att ett verktyg som inte ger utslag också är ett resultat, så länge jag vet vad det betyder. Med tabellen i Del 6 hade jag börjat med Network och sett direkt att anropet saknades. Nästa gång frågar jag först om anropet ens görs, innan jag sätter en brytpunkt på servern.

### Loggning

I 3.1 såg jag att Bandage Castle bara loggar fel. git grep hittade 14 console-rader, utan tidsstämpel och utan vem det gällde. Med en anropslogg såg jag varje anrop med tid och millisekunder.

I en app jag bygger själv skulle jag logga tidsstämpel, vad loggen gäller, ett tydligt felmeddelande med felkod, de variabler som behövs för att förstå felet och användarens id. Då hittar jag ett fel som en kund rapporterade i går bland alla andra anrop. Loggen ska sparas, inte bara synas i terminalen.

Jag skulle aldrig logga personlig data. I 3.3 hittade jag två rader som gör det: auth.service.ts loggar länken med token för att byta lösenord, och ravenPost.ts loggar kundens e-post. Alla som kan läsa loggen kan då ta över ett konto eller se personuppgifter. Logga user id i stället.

Stack trace och kodrader hör hemma i loggen, för utvecklarna. Användaren ska bara se ett tydligt felmeddelande.

### Mät först

I 5.1 mätte jag artsidan på två sätt. Network Timing visade tiden för sidladdningen: 38 ms för species och 13 ms för lairs. På min dator såg det inte ut som något problem.

Sedan slog jag på PRISMA_LOG, som visar varje SQL-fråga. Då såg jag att species gör 74 frågor per anrop, mot cirka 7 för lairs. Artsidan gör en fråga per art och en per regel. Det är N+1. Lairs hämtar allt i klump med IN (...).

Mätningen ändrade min bild. Tiden ljuger på min dator, eftersom databasen ligger bredvid. I produktion tar varje fråga en tur över nätverket. Med 2 ms per fråga blir det 148 ms för species mot 14 ms för lairs.

git log visade att Priya redan hade lagat det till 3 frågor, och att Sam återställde det. Jag provade Priyas version och fick 7 frågor, varav 3 för inloggningen, med samma innehåll. Hade jag bara tittat på tiden hade jag inte sett något fel.

### Från .NET

Jag vill prova EF Core-loggning först, i mitt eget projekt Transportfactory. Det motsvarar PRISMA_LOG=query i Bandage Castle.

I 5.1 var det PRISMA_LOG som visade problemet på artsidan. Network Timing sa bara 38 ms, men loggen visade 74 frågor för ett enda anrop. Utan den hade jag inte sett N+1-felet alls.

I Transportfactory använder jag EF Core med Repository och Unit of Work. Där vill jag se mina queries för att kunna räkna dem och kolla prestanda. I EF Core slår man på det med kategorin Microsoft.EntityFrameworkCore.Database.Command i appsettings.json, eller med ToQueryString() på en enskild fråga.

Enligt dokumentet uppstår N+1 i EF Core när man läser relationer i en loop utan Include. Det är samma sak som rulesFor gjorde i Bandage Castle, en fråga per regel. Med loggen påslagen kan jag se om mina repositories gör samma misstag innan det blir långsamt. Jag vill hellre se 74 frågor i loggen på min egen dator än märka dem när kunderna klagar på att sidan är långsam.
S

## 4. Vad jag tar med mig

Det var kul att se olika brytpunkter i debuggern och använda debuggern i webbläsaren. Villkorlig brytpunkt var användbart, annars måste jag köra igenom om och om igen tills jag kommer dit jag ville stanna. Protokollet i 1.3 var nog roligast, det var bland de tydligaste uppgifterna där man förstod att det fanns ett tydligt fel.

Det som var svårt var att uppgifterna var väldigt luddiga och att en röd tråd saknades. I senare delar, som 4.1, förstod jag inte vad felet var.

Det mest lärorika var att en brytpunkt bara stannar om koden den sitter på körs. Om debuggern inte stannar betyder det att raden inte kördes. I 6.1 visste jag därför att servern aldrig fick någon fråga, och att felet låg i webbläsaren.

Det kändes också i många senare delar som att man gjorde något, klick, klick, klick, och sedan skulle förklara varför, fast man knappt förstått vad man gjorde eller att det fanns ett fel.
