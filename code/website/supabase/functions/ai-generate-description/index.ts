import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OPENROUTER_MODEL = "google/gemini-2.0-flash-001";

const FEW_SHOT_EXAMPLE = `Voorbeeld van een goede omschrijving:

Auto: Volvo XC60 2.0 T Powershift, 2010, 203 pk, Automaat, Benzine, 123.000 km
Opties: Leren bekleding, Stoelverwarming, Automatische climate control, Navigatiesysteem, Trekhaak, Parkeersensoren, Cruise control, BLIS dodehoekbewaking

Omschrijving:
Een ruime gezins-SUV met 203 pk turbomotor en Powershift automaat. De verhoogde zitpositie geeft goed overzicht en het interieur biedt voldoende ruimte voor het hele gezin. De motor is soepel en maakt inhalen moeiteloos.

Het leren interieur met stoelverwarming is prettig op koude ochtenden. De automatische climate control houdt het binnenklimaat aangenaam, en met de trekhaak kunt u een aanhanger of fietsendrager meenemen.

Uitgerust met onder andere:
• Leren bekleding met stoelverwarming
• Automatische climate control
• Geïntegreerd navigatiesysteem
• Trekhaak
• Parkeersensoren
• Cruise control
• BLIS dodehoekbewaking

De XC60 staat bekend als één van de veiligste SUV's in zijn klasse, met uitgebreide airbags en stabiliteitscontrole. Met 123.000 km op de teller is hij goed ingereden. Het is een bouwjaar 2010, dus houd rekening met wat leeftijdsgerelateerde slijtage, maar Volvo's uit deze periode staan bekend om hun lange levensduur. Een degelijke gezinsauto met veel ruimte en goede veiligheidsuitrusting.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openrouterKey) {
      return new Response(
        JSON.stringify({ error: "OpenRouter API key niet geconfigureerd" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const carData = await req.json();

    // Build car summary from all available fields
    const parts: string[] = [];
    if (carData.merk) parts.push(`Merk: ${carData.merk}`);
    if (carData.model) parts.push(`Model: ${carData.model}`);
    if (carData.bouwjaar) parts.push(`Bouwjaar: ${carData.bouwjaar}`);
    if (carData.voertuig_type)
      parts.push(`Type: ${carData.voertuig_type}`);
    if (carData.brandstof_type)
      parts.push(`Brandstof: ${carData.brandstof_type}`);
    if (carData.transmissie)
      parts.push(`Transmissie: ${carData.transmissie}`);
    if (carData.vermogen_pk) parts.push(`Vermogen: ${carData.vermogen_pk} pk`);
    if (carData.motor_cc) parts.push(`Motor: ${carData.motor_cc} cc`);
    if (carData.motor_cilinders)
      parts.push(`Cilinders: ${carData.motor_cilinders}`);
    if (carData.kilometerstand)
      parts.push(`Kilometerstand: ${carData.kilometerstand.toLocaleString("nl-NL")} km`);
    if (carData.kleur) parts.push(`Kleur: ${carData.kleur}`);
    if (carData.gewicht_kg) parts.push(`Gewicht: ${carData.gewicht_kg} kg`);
    if (carData.topsnelheid_kmh)
      parts.push(`Topsnelheid: ${carData.topsnelheid_kmh} km/u`);
    if (carData.acceleratie_0_100)
      parts.push(`0-100 km/u: ${carData.acceleratie_0_100} s`);
    if (carData.zitplaatsen)
      parts.push(`Zitplaatsen: ${carData.zitplaatsen}`);
    if (carData.deuren) parts.push(`Deuren: ${carData.deuren}`);
    if (carData.opties && carData.opties.length > 0)
      parts.push(`Opties: ${carData.opties.join(", ")}`);

    const carSummary = parts.join("\n");

    const prompt = `Je schrijft autohandelaar-omschrijvingen in het Nederlands voor een autobedrijf. De toon is nuchter, eerlijk en concreet — geen superlatieven of marketingtaal. Beschrijf wat de auto praktisch biedt, noem sterke punten maar ook eerlijke kanttekeningen waar relevant (leeftijd, kilometerstand, bekende aandachtspunten).

${FEW_SHOT_EXAMPLE}

---

Schrijf nu een omschrijving voor de volgende auto:

${carSummary}

Regels:
- Begin met een korte samenvatting van wat de auto is (type, motor, transmissie)
- Beschrijf het praktische gebruik (voor wie is deze auto geschikt?)
- Maak een opsomming met bullet points (•) van de belangrijkste opties
- Sluit af met een eerlijke beoordeling, inclusief eventuele aandachtspunten
- Gebruik "u" als aanspreking, niet "je"
- Geen superlatieven zoals "prachtig", "schitterend", "fantastisch"
- Wees concreet en informatief
- Schrijf 150-250 woorden`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openrouterKey}`,
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", errText);
      return new Response(
        JSON.stringify({ error: "LLM verzoek mislukt" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content?.trim() || "";

    return new Response(
      JSON.stringify({ success: true, data: { omschrijving: description } }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in ai-generate-description:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Er ging iets mis" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
