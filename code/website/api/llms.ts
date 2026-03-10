import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://wkautoselectie.nl";
const BUSINESS_NAME = "Auto Service van der Waals";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  let aanbodCars: any[] = [];
  let verkochtCars: any[] = [];

  if (!supabaseUrl || !supabaseKey) {
    console.error('LLMs endpoint: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
  } else {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: aanbod, error: aanbodError } = await supabase
      .from("cars")
      .select("id, merk, model, bouwjaar, prijs, kilometerstand, brandstof_type, transmissie, vermogen_pk")
      .eq("status", "aanbod")
      .order("created_at", { ascending: false });

    if (aanbodError) {
      console.error('Supabase query error in llms (aanbod):', aanbodError);
      return res.status(500).send('Database error');
    }

    aanbodCars = aanbod || [];

    const { data: verkocht, error: verkochtError } = await supabase
      .from("cars")
      .select("id, merk, model, bouwjaar, prijs, kilometerstand, brandstof_type, transmissie, vermogen_pk")
      .eq("status", "verkocht")
      .order("created_at", { ascending: false });

    if (verkochtError) {
      console.error('Supabase query error in llms (verkocht):', verkochtError);
      return res.status(500).send('Database error');
    }

    verkochtCars = verkocht || [];
  }

  const carLines = aanbodCars.map((car) => {
    const specs = [
      car.brandstof_type,
      car.transmissie,
      car.vermogen_pk ? `${car.vermogen_pk} pk` : null,
      car.kilometerstand ? `${Number(car.kilometerstand).toLocaleString("nl-NL")} km` : null,
    ].filter(Boolean).join(", ");

    const price = car.prijs ? `€${Number(car.prijs).toLocaleString("nl-NL")}` : "";

    return `- [${car.bouwjaar} ${car.merk} ${car.model}](${SITE_URL}/auto/${car.id}): ${price}${specs ? ` — ${specs}` : ""}`;
  });

  const text = `# ${BUSINESS_NAME}

> ${BUSINESS_NAME} is een erkend autobedrijf in Wieringerwaard, Noord-Holland, gespecialiseerd in auto onderhoud, reparatie, LPG installaties en de aan- en verkoop van kwalitatieve occasions. Met meer dan 30 jaar ervaring bieden wij betrouwbare service en persoonlijk advies.

${BUSINESS_NAME} is een samenwerking van Stefan van der Waals en Kees Kraakman. Wij zijn gevestigd aan de Zuid Zijperweg 66, 1766 HD Wieringerwaard. Ons bedrijf combineert jarenlange expertise in automobieltechniek met een persoonlijke aanpak voor elke klant.

## Huidig Aanbod (${aanbodCars.length} auto's)

${carLines.length > 0 ? carLines.join("\n") : "Momenteel geen auto's in het aanbod."}

- [Bekijk volledig aanbod](${SITE_URL}/aanbod)

## Verkocht (${verkochtCars.length} auto's)

${verkochtCars.length > 0 ? verkochtCars.map((car) => {
    const specs = [
      car.brandstof_type,
      car.transmissie,
      car.vermogen_pk ? `${car.vermogen_pk} pk` : null,
      car.kilometerstand ? `${Number(car.kilometerstand).toLocaleString("nl-NL")} km` : null,
    ].filter(Boolean).join(", ");
    const price = car.prijs ? `€${Number(car.prijs).toLocaleString("nl-NL")}` : "";
    return `- [${car.bouwjaar} ${car.merk} ${car.model}](${SITE_URL}/auto/${car.id}): ${price}${specs ? ` — ${specs}` : ""} (verkocht)`;
  }).join("\n") : "Nog geen verkochte auto's."}

- [Bekijk alle verkochte auto's](${SITE_URL}/verkocht)

## Diensten

- [LPG Installaties](${SITE_URL}/lpg): Informatie over onze LPG installatieservice, voordelen en mogelijkheden
- [Onderhoud & Reparatie](${SITE_URL}/): Auto onderhoud, APK, reparatie en diagnose

## Bedrijfsinformatie

- [Over ons](${SITE_URL}/): Onze geschiedenis, team en werkwijze — 30+ jaar ervaring
- [Contact & Route](${SITE_URL}/contact): Adres, telefoonnummer, e-mail en routebeschrijving naar Wieringerwaard

## Klantervaringen

- [Reviews](${SITE_URL}/reviews): Google Reviews en ervaringen van onze klanten

## Contactgegevens

- Adres: Zuid Zijperweg 66, 1766 HD Wieringerwaard
- Telefoon: 06-26 344 965
- E-mail: info@wkautoselectie.nl
- Openingstijden: Maandag t/m vrijdag 08:00-17:00 (op afspraak)
`;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(text);

  } catch (err) {
    console.error('LLMs endpoint error:', err);
    return res.status(500).send('Internal Server Error');
  }
}
