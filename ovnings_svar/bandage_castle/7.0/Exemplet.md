# Exempel i Del 7: Finns funktionen redan? (#23)

**Vad jag kontrollerade**
I koden anropar POST /api/visits/:id/confirm i visits.routes.ts NotificationService.notifyCustomer med "Your visit is confirmed". notifyCustomer läser kundens contactPref, och är den raven anropas sendRaven, som skriver en rad i tbl_raven.

I appen bokade jag som overlord, Baron Aldric Vexmoor, ett besök hos Hester. Som frontdesk bekräftade jag det.

**Vad jag såg**
En ny rad i tbl_raven till Vexmoor med ämnet "Your visit is confirmed". Den syns under Ravens som admin.

**Svar på #23**
Funktionen finns redan. Kunder som föredrar korp får en korp när ett besök bekräftas. Det syns i koden och i korploggen, men inte bland notiserna, och där tittade den som skrev issuen. Issuen kan stängas.
