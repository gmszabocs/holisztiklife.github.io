# Holistiklife saját foglaló – élesítési útmutató

A rendszer Cal.com nélkül működik. A Google Naptár a foglalások egyetlen kezelőfelülete.

## 1. Foglalási naptár
1. Google Calendarben hozz létre egy új naptárat, például **Holistiklife foglalások** néven.
2. A naptár beállításainál másold ki a **Naptárazonosítót**. Ez általában egy e-mail címhez hasonló érték.
3. Ezt a naptárat használd minden foglalás és saját blokkolt időpont kezelésére.

## 2. Google Cloud szolgáltatásfiók
1. Nyisd meg a Google Cloud Console-t, hozz létre egy projektet, majd engedélyezd a **Google Calendar API**-t.
2. IAM és admin → Service Accounts: hozz létre egy szolgáltatásfiókot.
3. Készíts hozzá JSON-kulcsot, és biztonságos helyen őrizd meg. **Ne töltsd fel a honlaphoz, és ne küldd nyilvános üzenetben.**
4. A foglalási Google Naptár megosztásánál add hozzá a szolgáltatásfiók e-mail címét „Módosítások végzése az eseményeken” jogosultsággal.

## 3. Supabase
1. Regisztrálj a [Supabase](https://supabase.com) oldalán, majd hozz létre egy Free projektet.
2. Telepítsd a Supabase CLI-t, lépj be, majd a projekt gyökerében futtasd:
   ```bash
   supabase link --project-ref A_SAJAT_PROJEKT_AZONOSITOD
   supabase secrets set GOOGLE_SERVICE_ACCOUNT_EMAIL="a szolgáltatásfiók client_email értéke"
   supabase secrets set GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="a szolgáltatásfiók private_key értéke"
   supabase secrets set GOOGLE_CALENDAR_ID="a foglalási naptár azonosítója"
   supabase secrets set SITE_ORIGIN="https://holistiklife.com"
   supabase secrets set RESEND_API_KEY="később"
   supabase secrets set EMAIL_FROM="később"
   supabase functions deploy availability --no-verify-jwt
   supabase functions deploy book --no-verify-jwt
   ```
3. A `booking-config.js` fájlban töltsd ki a `SUPABASE_FUNCTIONS_URL` értékét:
   ```js
   SUPABASE_FUNCTIONS_URL: 'https://A_SAJAT_PROJEKT_AZONOSITOD.supabase.co/functions/v1'
   ```

## 4. Resend – egyedi visszaigazoló e-mail
1. Regisztrálj a [Resend](https://resend.com) oldalán.
2. Add hozzá a `holistiklife.com` domaint, majd vedd fel a Resend által megadott SPF és DKIM DNS rekordokat.
3. Hozz létre API kulcsot, majd töltsd ki a fenti `RESEND_API_KEY` és `EMAIL_FROM` Supabase titkokat. Javasolt feladó: `Holistiklife <hello@holistiklife.com>`.

## 5. Mielőtt éles lesz
- A `supabase/functions/_shared/booking-config.ts` fájlban állítsd be a nyitvatartást, szolgáltatási időtartamokat és szüneteket.
- Készítsd el az `adatkezeles.html` oldalt; a foglaló ennek elfogadását kéri.
- Tesztnaptárral, teszt e-mail címmel próbálj ki egy foglalást. Ellenőrizd a naptáreseményt és az e-mailt.
- Csak ezután állítsd a foglalási naptárat éles naptárra.

## Ingyenes használat
A tervezett 10–20 heti foglalás mellett a Google Calendar API, Supabase Free és Resend Free keretei várhatóan bőségesek. A Supabase Free projekt 1 hét teljes inaktivitás után szünetelhet; az ingyenes csomagok feltételei változhatnak és nem adnak üzleti SLA-t.
