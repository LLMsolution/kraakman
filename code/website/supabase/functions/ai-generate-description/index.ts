import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OPENROUTER_MODEL = "google/gemini-2.0-flash-001";

const FEW_SHOT_EXAMPLE = `Voorbeeld van een goede omschrijving:

Auto gegevens: Volvo XC60 2.0 T Powershift, 2010, 203 pk, Automaat, Benzine, 123.000 km, Zwart
Opties: Leren bekleding, Stoelverwarming, Automatische climate control, Navigatiesysteem, Trekhaak, Parkeersensoren, Cruise control, BLIS dodehoekbewaking

Gewenste output (direct de tekst, geen titel):
Een ruime gezins-SUV met 203 pk turbomotor en Powershift automaat. Deze zwarte XC60 biedt met zijn verhoogde zitpositie goed overzicht en het interieur heeft voldoende ruimte voor het hele gezin. De motor is soepel en maakt inhalen moeiteloos.

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

    // Build car summary from all available fields (use != null to allow 0 values)
    const fields: [string, unknown, string?][] = [
      ["Merk", carData.merk],
      ["Model", carData.model],
      ["Bouwjaar", carData.bouwjaar],
      ["Type", carData.voertuig_type],
      ["Kleur", carData.kleur],
      ["Prijs", carData.prijs, " euro"],
      ["Kilometerstand", carData.kilometerstand, " km"],
      ["Brandstof", carData.brandstof_type],
      ["Transmissie", carData.transmissie],
      ["Vermogen", carData.vermogen_pk, " pk"],
      ["Motor", carData.motor_cc, " cc"],
      ["Cilinders", carData.motor_cilinders],
      ["Gewicht", carData.gewicht_kg, " kg"],
      ["Topsnelheid", carData.topsnelheid_kmh, " km/u"],
      ["0-100 km/u", carData.acceleratie_0_100, " s"],
      ["Zitplaatsen", carData.zitplaatsen],
      ["Deuren", carData.deuren],
      ["Kenteken", carData.kenteken],
    ];
    const parts: string[] = fields
      .filter(([, val]) => val != null && val !== "" && val !== 0)
      .map(([label, val, suffix]) => `${label}: ${val}${suffix || ""}`);
    if (carData.opties && carData.opties.length > 0)
      parts.push(`Opties: ${carData.opties.join(", ")}`);

    const carSummary = parts.join("\n");

    const prompt = `Je schrijft autohandelaar-omschrijvingen in het Nederlands voor een autobedrijf. De toon is nuchter, eerlijk en concreet — geen superlatieven of marketingtaal. Beschrijf wat de auto praktisch biedt, noem sterke punten maar ook eerlijke kanttekeningen waar relevant (leeftijd, kilometerstand, bekende aandachtspunten).

${FEW_SHOT_EXAMPLE}

---

Vandaag is het ${new Date().toISOString().split("T")[0]}. Houd hier rekening mee bij het beoordelen van de leeftijd van de auto.

Schrijf nu een omschrijving voor de volgende auto:

${carSummary}

Regels:
- Begin DIRECT met de omschrijvende tekst — GEEN titel, header, autonaam of "Omschrijving:" label
- De lezer weet al welke auto het is, dus begin meteen met beschrijven
- Je krijgt alle beschikbare informatie mee: basis gegevens, technische specificaties, opties/extra's, kleur, prijs, kilometerstand, etc. Gebruik deze gegevens slim — verwerk ze alleen als ze de omschrijving waardevoller maken voor de lezer. Voorbeelden: noem de acceleratie als die sportief is ("in 4.5 seconden van 0 naar 100"), noem de kleur als het de auto typeert ("het witte exterieur geeft de auto een strakke uitstraling"), noem de prijs-kwaliteitverhouding als die opvalt. Niet elk gegeven hoeft benoemd te worden
- Beschrijf het praktische gebruik (voor wie is deze auto geschikt?)
- Maak een opsomming met bullet points (•) van de belangrijkste opties
- Sluit af met een eerlijke beoordeling, inclusief eventuele aandachtspunten
- Eindig ALTIJD met een korte call-to-action: "Heeft u vragen of wilt u meer weten? Neem gerust contact met ons op via de contactpagina of direct via de WhatsApp-button. U kunt hieronder ook direct een proefrit inplannen."
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
    let description = data.choices?.[0]?.message?.content?.trim() || "";

    // Strip any header/title the LLM might add (e.g. "Auto: BMW i3...\n\nOmschrijving:\n")
    description = description.replace(/^(Auto:.*\n+)?(Omschrijving:\s*\n?)/i, "").trim();

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
