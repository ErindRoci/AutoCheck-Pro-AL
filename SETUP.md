# Setup: Supabase + Resend (pjesa e backend-it)

1. **Supabase**: krijo projekt falas në supabase.com. SQL Editor > ngjit dhe ekzekuto `schema.sql`.
2. **Llogaria e pronarit**: Authentication > Users > Add user (email + fjalëkalim i fortë). Kopjo UUID-në dhe ekzekuto rreshtin e fundit të `schema.sql` (`insert into admins ...`).
3. **Resend**: krijo llogari në resend.com, verifiko domenin tënd dhe krijo API key.
   Pa domen të verifikuar, Resend dërgon vetëm te emaili i llogarisë së Resend.
4. **Edge Function** (me Supabase CLI):
   ```
   supabase login
   supabase link --project-ref <PROJECT-REF>
   supabase secrets set RESEND_API_KEY=re_xxx MAIL_FROM="AutoCheck Pro AL <noreply@domaini-yt.com>" ADMIN_EMAIL=erind.roci26@icloud.com ALLOWED_ORIGIN=https://domaini-yt.com
   supabase functions deploy submit --no-verify-jwt
   ```
   (`SUPABASE_URL` dhe `SUPABASE_SERVICE_ROLE_KEY` vendosen automatikisht nga Supabase.)
5. **Faqja**: në `AUTOCHECK-PRO-AL-WEBSITE.html`, te `CONFIG`, vendos
   `endpoint:"https://<PROJECT-REF>.supabase.co/functions/v1/submit"`.
6. **Test**: dërgo një rezervim; duhet të shfaqet referenca (ACP-XXXXXX), rreshti te tabela `bookings` dhe emaili te administratori.

## Siguria
- Service role key dhe Resend key ekzistojnë vetëm si secrets në server, kurrë në HTML.
- RLS është aktiv dhe nuk ka asnjë politikë publike: vizitorët nuk lexojnë të dhëna.
- Vetëm përdoruesit në tabelën `admins` mund të lexojnë ose ndryshojnë rezervimet.

## Çfarë nuk përfshihet ende
- Paneli i administrimit (login, aprovim, kalendar, CSV) dhe emailet te klienti për aprovim/ricaktim/anulim.
- Ngarkimi i fotove/videove (Supabase Storage); aktualisht dërgohen vetëm fushat tekstuale.
