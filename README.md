# AUTOCHECK PRO AL

Faqe web (një skedar `index.html`) për diagnostikim, kodim dhe programim automjetesh, Bathore, Kamëz, Tiranë.

## Struktura
- `index.html`: faqja e plotë (HTML, CSS, JS, logoja e ngulitur)
- `backend/`: Supabase (`schema.sql`, funksioni `functions/submit`) dhe `SETUP.md`
- `robots.txt`, `sitemap.xml`: zëvendëso `YOUR-DOMAIN.example` me domenin real

## Publikim në GitHub Pages
Settings > Pages > Deploy from a branch > `main` / `(root)`.

## Siguria
Mos ngarko kurrë çelësa (Resend, Supabase service role) në repo. Ata vendosen vetëm si secrets në server (shih `backend/SETUP.md`).
