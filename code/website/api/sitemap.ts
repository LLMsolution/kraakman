import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://autoservicevanderwaals.nl";

const STATIC_PAGES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/aanbod", changefreq: "daily", priority: "0.9" },
  { path: "/verkocht", changefreq: "weekly", priority: "0.5" },
  { path: "/lpg", changefreq: "monthly", priority: "0.7" },
  { path: "/reviews", changefreq: "weekly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.8" },
];

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  let cars: { id: string; status: string; updated_at: string | null }[] = [];

  if (!supabaseUrl || !supabaseKey) {
    console.error('Sitemap: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
  } else {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("cars")
      .select("id, status, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error('Supabase query error in sitemap:', error);
    } else {
      cars = data || [];
    }
  }

  const today = new Date().toISOString().split("T")[0];

  const urls = STATIC_PAGES.map(
    (p) => `  <url>
    <loc>${SITE_URL}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  );

  for (const car of cars) {
    const lastmod = car.updated_at
      ? new Date(car.updated_at).toISOString().split("T")[0]
      : today;
    const priority = car.status === "aanbod" ? "0.8" : "0.4";
    const changefreq = car.status === "aanbod" ? "weekly" : "monthly";

    urls.push(`  <url>
    <loc>${SITE_URL}/auto/${escapeXml(car.id)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(xml);

  } catch (err) {
    console.error('Sitemap generation error:', err);
    return res.status(500).send('Internal Server Error');
  }
}
