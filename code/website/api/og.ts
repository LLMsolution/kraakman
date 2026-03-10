import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const CANONICAL_URL = "https://autoservicevanderwaals.nl";
const BUSINESS_NAME = "Auto Service van der Waals & WK Auto Selectie";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getSiteUrl(req: VercelRequest): string {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "";
  const proto = req.headers["x-forwarded-proto"] || "https";
  return host ? `${proto}://${host}` : CANONICAL_URL;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
  const { id } = req.query;
  const siteUrl = getSiteUrl(req);

  if (!id || typeof id !== "string" || !UUID_RE.test(id)) {
    return res.redirect(302, siteUrl);
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('OG handler: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
    return res.redirect(302, `${siteUrl}/auto/${id}`);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: car, error } = await supabase
    .from("cars")
    .select("*, car_images(url, display_order)")
    .eq("id", id)
    .single();

  if (error || !car) {
    console.error('Supabase query error in OG handler:', error);
    return res.redirect(302, `${siteUrl}/auto/${id}`);
  }

  const images = (car.car_images || []).sort(
    (a: { display_order: number }, b: { display_order: number }) =>
      (a.display_order || 0) - (b.display_order || 0)
  );
  const mainImage = images[0]?.url || `${siteUrl}/og-image.jpg`;
  const carTitle = `${car.bouwjaar} ${car.merk} ${car.model}${car.type ? ` ${car.type}` : ""}`;
  const price = car.prijs
    ? `€${car.prijs.toLocaleString("nl-NL")}`
    : "";
  const km = car.kilometerstand
    ? `${car.kilometerstand.toLocaleString("nl-NL")} km`
    : "";
  const description = car.omschrijving
    ? (car.omschrijving.length > 155 ? car.omschrijving.substring(0, 155).replace(/\s+\S*$/, "...") : car.omschrijving)
    : `${carTitle} te koop bij ${BUSINESS_NAME}. ${[price, km].filter(Boolean).join(" · ")}`;
  const fullTitle = `${carTitle} kopen | ${BUSINESS_NAME}`;
  const pageUrl = `${siteUrl}/auto/${id}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Car",
    "name": carTitle,
    "url": pageUrl,
    "image": images.map((img: { url: string }) => img.url),
    "brand": { "@type": "Brand", "name": car.merk },
    "model": car.model,
    "vehicleModelDate": car.bouwjaar ? String(car.bouwjaar) : undefined,
    "color": car.kleur || undefined,
    "fuelType": car.brandstof_type || undefined,
    "vehicleTransmission": car.transmissie || undefined,
    "vehicleEngine": car.vermogen_pk
      ? { "@type": "EngineSpecification", "enginePower": { "@type": "QuantitativeValue", "value": car.vermogen_pk, "unitCode": "BHP" } }
      : undefined,
    "mileageFromOdometer": car.kilometerstand
      ? { "@type": "QuantitativeValue", "value": car.kilometerstand, "unitCode": "KMT" }
      : undefined,
    "offers": car.prijs
      ? { "@type": "Offer", "price": car.prijs, "priceCurrency": "EUR", "availability": car.status === "aanbod" ? "https://schema.org/InStock" : "https://schema.org/SoldOut", "seller": { "@type": "AutoDealer", "name": BUSINESS_NAME, "address": { "@type": "PostalAddress", "streetAddress": "Zuid Zijperweg 66", "addressLocality": "Wieringerwaard", "postalCode": "1766 HD", "addressCountry": "NL" } } }
      : undefined,
    "description": car.omschrijving || undefined,
  };

  const cleanJsonLd = JSON.stringify(jsonLd, (_, v) => v === undefined ? undefined : v);

  const breadcrumbLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": car.status === "aanbod" ? "Aanbod" : "Verkocht", "item": `${siteUrl}/${car.status === "aanbod" ? "aanbod" : "verkocht"}` },
      { "@type": "ListItem", "position": 3, "name": carTitle, "item": pageUrl },
    ],
  });

  // No meta-refresh redirect — this page is only served to social media crawlers.
  // Human visitors access /auto/:id directly via the SPA.
  const html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${pageUrl}" />

  <meta property="og:title" content="${escapeHtml(fullTitle)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(mainImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(carTitle)}" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:type" content="product" />
  <meta property="og:locale" content="nl_NL" />
  <meta property="og:site_name" content="${BUSINESS_NAME}" />
  ${price ? `<meta property="product:price:amount" content="${car.prijs}" />\n  <meta property="product:price:currency" content="EUR" />` : ""}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(fullTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(mainImage)}" />

  <script type="application/ld+json">${cleanJsonLd.replace(/<\//g, '<\\/')}</script>
  <script type="application/ld+json">${breadcrumbLd.replace(/<\//g, '<\\/')}</script>
</head>
<body>
  <p><a href="${pageUrl}">${escapeHtml(carTitle)}</a></p>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(html);

  } catch (err) {
    console.error('OG handler error:', err);
    return res.status(500).send('Internal Server Error');
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
