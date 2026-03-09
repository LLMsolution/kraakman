# Migratieplan: WordPress → Vercel

> Doel: autoservicevanderwaals.nl overzetten van WordPress naar de nieuwe Vite/React site op Vercel, zonder SEO-verlies.

---

## Fase 0: Voorbereiding (VOOR de switch)

### WordPress URLs in kaart brengen
- [x] WordPress-site gecrawld met Firecrawl (57 URLs gevonden)
- [x] URL-structuur gedocumenteerd: `/listing/slug`, `/listings`, `/body-type/slug`, `/tag/slug`, `/author/slug`, plus pagina's `/over-ons`, `/diensten`, `/voorbeelden`, `/lpg`, `/contact`

### Backlinks gecontroleerd
- [x] Ahrefs backlink profiel geanalyseerd (DR 2.9, 19 linkende websites)
- [x] Kritieke backlink gevonden: `/lpg.php` → redirect toegevoegd
- [x] Alle echte backlinks wijzen naar `/` (homepage) of `/lpg.php` — beide afgedekt

### Google Search Console baseline
- [ ] Exporteer Prestaties-rapport (laatste 12 maanden) — dit is je benchmark
- [ ] Noteer het aantal geindexeerde pagina's (Indexering → Pagina's)
- [ ] Noteer de top 20 pagina's op clicks — deze hebben de hoogste prioriteit

---

## Fase 1: Redirect-map (KLAAR)

### WordPress → Nieuwe site URL-mapping
- [x] Redirect-map gebouwd op basis van crawl + backlinks:

| Oud (WordPress) | Nieuw (Vercel) | Type | Status |
|---|---|---|---|
| `/` | `/` | — | Zelfde URL |
| `/contact` | `/contact` | — | Zelfde URL |
| `/lpg` | `/lpg` | — | Zelfde URL |
| `/lpg.php` | `/lpg` | 301 | ✅ In vercel.json |
| `/listings` en `/listings/` | `/aanbod` | 301 | ✅ In vercel.json |
| `/listing/:slug` (alle auto's) | `/aanbod` | 301 | ✅ In vercel.json |
| `/over-ons` | `/` | 301 | ✅ In vercel.json |
| `/diensten` | `/` | 301 | ✅ In vercel.json |
| `/voorbeelden` | `/` | 301 | ✅ In vercel.json |
| `/find-your-favorite-car-in-a-minute` | `/aanbod` | 301 | ✅ In vercel.json |
| `/im-looking-for` | `/aanbod` | 301 | ✅ In vercel.json |
| `/body-type/:slug` | `/aanbod` | 301 | ✅ In vercel.json |
| `/tag/:slug` | `/aanbod` | 301 | ✅ In vercel.json |
| `/category/:slug` | `/aanbod` | 301 | ✅ In vercel.json |
| `/author/:slug` | `/` | 301 | ✅ In vercel.json |
| `/page/:number` | `/aanbod` | 301 | ✅ In vercel.json |
| `/feed/` en varianten | `/` | 301 | ✅ In vercel.json |
| `/wp-admin/*` | `/` | 302 | ✅ In vercel.json |
| `/wp-login.php` | `/` | 302 | ✅ In vercel.json |
| `/wp-content/*` | `/` | 302 | ✅ In vercel.json |
| `/xmlrpc.php` | `/` | 302 | ✅ In vercel.json |
| Trailing slashes | Zonder slash | 301 | ✅ In vercel.json |

---

## Fase 2: Domein bijwerken in codebase (KLAAR)

### Alle verwijzingen naar kraakman-auto.vercel.app → autoservicevanderwaals.nl
- [x] `index.html` — canonical link, og:url, og:image, twitter:image
- [x] `src/config/business.ts` — `SITE_URL`
- [x] `public/robots.txt` — sitemap URL + WordPress-paden geblokkeerd
- [x] `public/sitemap.xml` — alle page URLs + hreflang
- [x] `public/llms.txt` — alle URLs
- [x] `supabase/functions/send-testdrive-request/index.ts` — `siteUrl` in BRAND_DEFAULTS
- [x] `api/og/[id].ts` — OG image base URL
- [x] Geverifieerd: 0 verwijzingen naar oud domein in source files

### Sitemap
- [ ] Dynamische auto-pagina's (`/auto/:id`) toevoegen aan sitemap

---

## Fase 2b: AI Auto-fill configuratie

> De admin heeft twee AI-knoppen: "Vul in met AI" (specs + opties via RDW + LLM) en "Genereer omschrijving" (beschrijving via LLM). Beide gebruiken OpenRouter als LLM provider (model: google/gemini-2.0-flash-001).

### OpenRouter API Key instellen
- [ ] Ga naar [openrouter.ai/keys](https://openrouter.ai/keys) → **Create Key**
- [ ] Kopieer de key (begint met `sk-or-`)
- [ ] Instellen als Supabase secret:
  ```bash
  npx supabase secrets set OPENROUTER_API_KEY=sk-or-jouw_key_hier --project-ref asqamsbnrjldkxievcmj
  ```
  Of via Supabase Dashboard → Edge Functions → Secrets → `OPENROUTER_API_KEY`

### Testen
- [ ] Open admin dashboard → "Nieuwe Auto" → vul kenteken in → klik "Vul in met AI"
- [ ] Controleer of velden worden ingevuld (merk, model, brandstof, opties, etc.)
- [ ] Klik "Genereer omschrijving" → controleer of een nuchtere beschrijving verschijnt
- [ ] Test ook zonder kenteken: vul alleen merk + model in → "Vul in met AI"

### Code (al klaar):
- [x] `supabase/functions/ai-autofill/index.ts` — RDW Open Data + OpenRouter LLM (deployed)
- [x] `supabase/functions/ai-generate-description/index.ts` — OpenRouter LLM (deployed)
- [x] `src/components/admin/AdminCarForm.tsx` — kenteken veld + twee AI knoppen
- [x] Database: `kenteken` kolom toegevoegd aan `cars` tabel
- [x] JWT-beveiliging: alleen ingelogde gebruikers kunnen de functies aanroepen

### Huidige status:
- ❌ `OPENROUTER_API_KEY` staat NIET in Supabase secrets → AI knoppen werken nu niet
- ✅ Edge Functions gedeployed en actief
- ✅ Frontend code klaar

---

## Fase 3: Resend e-mail configuratie

> Resend verstuurt e-mails via Amazon SES. Het domein en de API key moeten nog worden ingesteld.

### Stap 1: Domein toevoegen in Resend
- [ ] Ga naar [resend.com](https://resend.com) → **Domains** → **+ Add Domain**
- [ ] Vul in: `autoservicevanderwaals.nl`
- [ ] Kies regio: **EU (Frankfurt)**
- [ ] Resend toont een lijst DNS-records → **screenshot maken en aan Claude geven**
- [ ] DNS-records toevoegen bij Mijndomein.nl (Claude vertelt welke al staan en welke nieuw zijn)
- [ ] Wacht tot domein status "Verified" is in Resend

### Stap 2: DNS-records toevoegen bij Mijndomein.nl
> ⚠️ Domein moet EERST geverifieerd zijn voordat e-mails verstuurd kunnen worden

Wat al in DNS staat (mogelijk van eerdere setup):
- [x] 3 DKIM CNAME records (wijzen naar `.dkim.amazonses.com`)
- [x] Amazon SES verificatie TXT record (`_amazonses.autoservice...`)

Wat waarschijnlijk nog moet (exact na Resend screenshot):

| Type | Naam | Inhoud | Prio |
|---|---|---|---|
| **TXT** | `send.autoservicevanderwaals` | `v=spf1 include:amazonses.com ~all` | — |
| **MX** | `send.autoservicevanderwaals` | `feedback-smtp.eu-west-1.amazonses.com` | 10 |

### Stap 3: Wacht tot domein "Verified" is in Resend
- [ ] Ga terug naar Resend → Domains → check status
- [ ] Alle records moeten groen zijn (kan 5 min tot een paar uur duren)

### Stap 4: API Key aanmaken (PAS NA verificatie)
- [ ] Ga naar [resend.com](https://resend.com) → **API Keys** → **+ Create API Key**
- [ ] Naam: `autoservice-production`
- [ ] Permission: **Sending access**
- [ ] Domain: `autoservicevanderwaals.nl`
- [ ] Kopieer de key (begint met `re_`)
- [ ] Instellen als Supabase secret:
  ```bash
  npx supabase secrets set RESEND_API_KEY=re_jouw_key_hier --project-ref asqamsbnrjldkxievcmj
  ```

### Stap 5: Testen
- [ ] Wacht op DNS-propagatie (5 min - 48 uur)
- [ ] Test contactformulier (`/contact`) — e-mail komt aan
- [ ] Test proefrit aanvraag (`/auto/:id`) — e-mail komt aan
- [ ] Test review popup — feedback e-mail komt aan
- [ ] Check of e-mails NIET in spam komen

### Huidige status:
- ❌ `RESEND_API_KEY` staat NIET in Supabase secrets → e-mails werken nu niet
- ❌ Domein `autoservicevanderwaals.nl` staat NIET in Resend → e-mails zouden vanaf `onboarding@resend.dev` gaan
- ⚠️ DKIM-records staan al in DNS maar zijn mogelijk van een andere setup

---

## Fase 4: Cloudflare Turnstile activeren

> Cloudflare Turnstile vereist GEEN Cloudflare DNS. Het is een los product. DNS blijft bij Mijndomein.nl.

### Cloudflare dashboard
- [ ] Ga naar [dash.cloudflare.com](https://dash.cloudflare.com/) → Turnstile → Site toevoegen
- [ ] Domein: `autoservicevanderwaals.nl`
- [ ] Type: "Managed"
- [ ] Kopieer de **Site Key** en **Secret Key**

### Keys instellen
- [ ] Vercel: voeg environment variable toe: `VITE_TURNSTILE_SITE_KEY=<site-key>`
  - Project Settings → Environment Variables → Add
  - Zet voor Production, Preview, en Development
- [ ] Supabase: voeg secret toe:
  ```bash
  npx supabase secrets set CLOUDFLARE_TURNSTILE_SECRET_KEY=<secret-key> --project-ref asqamsbnrjldkxievcmj
  ```

### Testen
- [ ] Test contactformulier (`/contact`) — Turnstile widget verschijnt, formulier werkt
- [ ] Test proefrit aanvraag (`/auto/:id`) — Turnstile widget verschijnt, aanvraag werkt

### Code (al klaar):
- [x] `src/components/Turnstile.tsx` — React component
- [x] `src/pages/Contact.tsx` — Turnstile widget geintegreerd
- [x] `index.html` — Turnstile script tag
- [x] `supabase/functions/send-contact/index.ts` — server-side verificatie
- [x] `supabase/functions/send-testdrive-request/index.ts` — server-side verificatie

---

## Fase 5: DNS omzetten bij Mijndomein.nl (de switch)

### Voorbereiding
- [ ] Voeg `autoservicevanderwaals.nl` toe aan Vercel (Project → Settings → Domains)
- [ ] Verifieer het domein via TXT-record (Vercel geeft instructies)
- [ ] Wacht tot Vercel het SSL-certificaat heeft aangemaakt

### DNS wijzigingen bij Mijndomein.nl

**VERWIJDEREN:**

| Type | Naam | Huidige waarde | Reden |
|---|---|---|---|
| A | `www.autoservicevanderwaals` | `109.163.225.27` | Wordt CNAME naar Vercel |
| A | `*.autoservicevanderwaals` | `109.163.225.27` | Wildcard niet nodig |
| AAAA | `www.autoservicevanderwaals` | `2a03:5180:...` | IPv6 niet nodig voor Vercel |
| AAAA | `*.autoservicevanderwaals` | `2a03:5180:...` | Wildcard niet nodig |
| AAAA | `autoservicevanderwaals` | `2a03:5180:...` | IPv6 niet nodig voor Vercel |

**WIJZIGEN:**

| Type | Naam | Oud | Nieuw |
|---|---|---|---|
| A | `autoservicevanderwaals` | `109.163.225.27` | `76.76.21.21` |

**TOEVOEGEN:**

| Type | Naam | Inhoud |
|---|---|---|
| CNAME | `www` | `cname.vercel-dns.com` |

**NIET AANRAKEN (e-mail):**

| Type | Naam | Waarvoor |
|---|---|---|
| MX | `autoservicevanderwaals` | E-mail routing (Outlook) |
| CNAME | `autodiscover.autoservice...` | Outlook autodiscover |
| CNAME | `mail.autoservice...` | Mail subdomain |
| CNAME | `_dmarc.autoservice...` | DMARC beleid |
| CNAME | `qwiuc2siv2gp47r...` | DKIM key 1 (Amazon SES / Resend) |
| CNAME | `klupq2opk2zlbmr...` | DKIM key 2 |
| CNAME | `ozasgtt3qieztr...` | DKIM key 3 |
| TXT | `_amazonses.autoservice...` | Amazon SES verificatie |
| TXT | `autoservicevanderwaals` (SPF) | SPF e-mail beveiliging |
| TXT | `autoservicevanderwaals` (MS=) | Microsoft verificatie |

### Verificatie na switch
- [ ] `curl -I https://autoservicevanderwaals.nl` → Vercel-site
- [ ] HTTPS werkt zonder certificaatwaarschuwingen
- [ ] Alle hoofdpagina's laden: `/`, `/aanbod`, `/verkocht`, `/lpg`, `/reviews`, `/contact`
- [ ] Auto-detailpagina's laden: `/auto/:id`
- [ ] Admin werkt: `/admin`
- [ ] Contactformulier verstuurt e-mails
- [ ] Proefrit aanvraag verstuurt e-mails
- [ ] Review popup verstuurt feedback
- [ ] Oude WordPress URLs redirecten correct (test `/listings`, `/over-ons`, `/lpg.php`)
- [ ] E-mail ontvangst/verzending werkt nog (stuur test-mail)

---

## Fase 6: Google Search Console na livegang

### Dag 1
- [ ] Sitemap indienen: GSC → Sitemaps → `https://autoservicevanderwaals.nl/sitemap.xml`
- [ ] URL Inspection → "Indexering aanvragen" voor top 10 pagina's
- [ ] Controleer dat geen pagina `noindex` heeft (behalve `/admin`)

### Week 1-2 (dagelijks)
- [ ] Monitor Pagina's-rapport op 404-errors
- [ ] Monitor Pagina's-rapport op redirect-fouten
- [ ] Check of belangrijkste pagina's worden geindexeerd

### Week 2-4 (wekelijks)
- [ ] Vergelijk clicks/impressies met baseline
- [ ] Check Core Web Vitals (GSC → Ervaring)

### Maand 2-3
- [ ] Rankings gestabiliseerd?
- [ ] WordPress-hosting kan worden opgezegd

---

## Overzicht: Wat is al gedaan

### Edge Functions & E-mails
- [x] `send-contact` Edge Function — contactformulier met Resend e-mail
- [x] `send-testdrive-request` Edge Function — proefrit aanvraag met auto-foto en details
- [x] `send-feedback` Edge Function — review/feedback notificatie
- [x] Bevestigingsmails naar klanten (contact + proefrit)
- [x] Alle e-mails in website-branding (kleuren, layout, lettertype)
- [x] Dynamische kleuren uit `site_settings` database (admin kan kleuren wijzigen)
- [x] Alle 3 Edge Functions gedeployed op Supabase

### Codebase opgeschoond
- [x] Ongebruikte componenten verwijderd
- [x] Dead code verwijderd
- [x] Proefrit formulier gerepareerd
- [x] ReviewPopup gekoppeld aan echte Edge Function
- [x] E-mail branding consistent gemaakt

### SEO
- [x] `react-helmet-async` SEO component met dynamische meta tags per pagina
- [x] Structured data: AutoDealer, Car/Product schema, BreadcrumbList, FAQ
- [x] Open Graph tags + Twitter Cards
- [x] OG image generatie voor auto-detailpagina's
- [x] `robots.txt` met WordPress-paden geblokkeerd + AI-bots toegestaan
- [x] `sitemap.xml` met alle statische pagina's
- [x] `llms.txt` voor AI-platformen (ChatGPT, Claude, Perplexity, etc.)
- [x] Canonical URLs, geo meta tags, hreflang tags
- [x] Security headers (HSTS, X-Frame-Options, etc.)

### Migratie-voorbereiding
- [x] WordPress-site gecrawld (57 URLs)
- [x] Backlinks geanalyseerd, kritieke URLs afgedekt
- [x] Redirect-map gebouwd (38 regels in `vercel.json`)
- [x] Domein bijgewerkt in alle source files
- [x] DNS-records gedocumenteerd en plan gemaakt

---

## Veelgestelde vragen

### Moet ik iets doen met Cloudflare DNS?
**Nee.** Cloudflare Turnstile is een los product dat geen Cloudflare DNS vereist. DNS blijft bij Mijndomein.nl en wijst naar Vercel. Je hebt alleen een Site Key en Secret Key nodig.

### Wat als e-mails in spam terechtkomen?
Check of de Resend SPF- en MX-records voor het `send` subdomain zijn ingesteld (Fase 3). Zonder deze records kan SPF-alignment falen waardoor sommige mailservers e-mails als spam markeren.

### Hoe lang duurt de DNS-switch?
Met een lage TTL (60 seconden): 5-30 minuten. Zonder TTL-verlaging: tot 48 uur.

---

## Risico's & veelgemaakte fouten

| Fout | Impact | Preventie |
|---|---|---|
| Niet alle URLs redirecten | Backlink-equity verloren | ✅ Crawl + backlinks gedaan |
| Alles naar homepage redirecten | Duplicate content | ✅ Specifieke redirects |
| MX-records vergeten | E-mail stopt | ✅ Gedocumenteerd wat niet aanraken |
| Resend SPF niet ingesteld | E-mails in spam | Fase 3 uitvoeren |
| Te snel WordPress opzeggen | Geen fallback | Min. 2 weken wachten |

---

## Tijdlijn

| Wanneer | Wat | Door wie |
|---|---|---|
| ✅ **Gedaan** | Crawl, redirects, domein update, DNS-plan | Claude |
| **Volgende stap** | GSC baseline exporteren | Jij |
| **Volgende stap** | Resend DNS records checken/toevoegen | Samen |
| **Volgende stap** | Cloudflare Turnstile keys aanmaken | Jij |
| **D-dag voorbereiding** | Domein aan Vercel toevoegen, SSL cert | Samen |
| **D-dag** | DNS omzetten bij Mijndomein.nl, testen | Samen |
| **Week 1-2** | Dagelijks GSC monitoren | Jij |
| **Week 8+** | WordPress-hosting opzeggen | Jij |
