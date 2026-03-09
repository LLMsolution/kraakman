import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OPENROUTER_MODEL = "google/gemini-2.0-flash-001";

const RDW_BASIC_URL = "https://opendata.rdw.nl/resource/m9d7-ebf2.json";
const RDW_FUEL_URL = "https://opendata.rdw.nl/resource/8ys7-d773.json";

async function fetchRDWData(kenteken: string) {
  const clean = kenteken.replace(/[-\s]/g, "").toUpperCase();

  const [basicRes, fuelRes] = await Promise.all([
    fetch(`${RDW_BASIC_URL}?kenteken=${clean}`),
    fetch(`${RDW_FUEL_URL}?kenteken=${clean}`),
  ]);

  const basicData = await basicRes.json();
  const fuelData = await fuelRes.json();

  return { basic: basicData[0] || null, fuel: fuelData[0] || null };
}

function capitalise(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function mapRDWToCarFields(basic: any, fuel: any): Record<string, any> {
  const f: Record<string, any> = {};

  if (basic) {
    if (basic.merk) f.merk = capitalise(basic.merk);
    if (basic.handelsbenaming) f.model = basic.handelsbenaming;
    if (basic.voertuigsoort) f.voertuig_type = capitalise(basic.voertuigsoort);
    if (basic.eerste_kleur) f.kleur = capitalise(basic.eerste_kleur);
    if (basic.aantal_zitplaatsen)
      f.zitplaatsen = parseInt(basic.aantal_zitplaatsen);
    if (basic.aantal_deuren) f.deuren = parseInt(basic.aantal_deuren);
    if (basic.massa_rijklaar) f.gewicht_kg = parseInt(basic.massa_rijklaar);
    if (basic.datum_eerste_toelating) {
      f.bouwjaar = parseInt(basic.datum_eerste_toelating.substring(0, 4));
    }
  }

  if (fuel) {
    if (fuel.brandstof_omschrijving)
      f.brandstof_type = capitalise(fuel.brandstof_omschrijving);
    if (fuel.cilinderinhoud) f.motor_cc = parseInt(fuel.cilinderinhoud);
    if (fuel.aantal_cilinders)
      f.motor_cilinders = parseInt(fuel.aantal_cilinders);
  }

  return f;
}

async function enrichWithLLM(
  knownFields: Record<string, any>,
  openrouterKey: string
) {
  const carInfo = Object.entries(knownFields)
    .filter(([_, v]) => v !== null && v !== undefined && v !== 0 && v !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const prompt = `Je bent een automotive expert. Op basis van de volgende bekende gegevens van een auto, vul de ontbrekende technische specificaties in. Geef ook een lijst van standaard opties en extra's die dit model typisch heeft.

Bekende gegevens:
${carInfo}

Geef je antwoord ALLEEN als JSON object met de volgende velden (laat velden weg die je niet met zekerheid kunt invullen):
{
  "voertuig_type": "Personenauto", "Bedrijfswagen", "SUV", "MPV", etc.,
  "brandstof_type": "Benzine", "Diesel", "Elektrisch", "Hybride", "LPG", etc.,
  "transmissie": "Automaat" of "Handgeschakeld",
  "vermogen_pk": getal,
  "topsnelheid_kmh": getal,
  "acceleratie_0_100": getal (in seconden, bijv. 8.5),
  "motor_cc": getal (0 voor elektrische auto's, alleen als niet al bekend),
  "motor_cilinders": getal (0 voor elektrische auto's, alleen als niet al bekend),
  "zitplaatsen": getal,
  "deuren": getal,
  "gewicht_kg": getal (rijklaar gewicht),
  "opties": ["optie 1", "optie 2", ...]
}

Belangrijk:
- Vul voertuig_type en brandstof_type ALTIJD in als het merk en model bekend zijn
- Geef alleen opties die standaard of zeer gebruikelijk zijn voor dit specifieke model en uitvoering
- Als je een waarde niet zeker weet, laat die weg
- Geef het antwoord als puur JSON, geen andere tekst`;

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
        temperature: 0.3,
      }),
    }
  );

  if (!response.ok) {
    console.error("OpenRouter error:", await response.text());
    return {};
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("Failed to parse LLM response:", content);
  }

  return {};
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
    console.log("OPENROUTER_API_KEY present:", !!openrouterKey, "length:", openrouterKey?.length);
    if (!openrouterKey) {
      return new Response(
        JSON.stringify({ error: "OpenRouter API key niet geconfigureerd" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { kenteken, merk, model, bouwjaar } = await req.json();
    console.log("Input:", JSON.stringify({ kenteken, merk, model, bouwjaar }));

    let rdwFields: Record<string, any> = {};

    if (kenteken) {
      const { basic, fuel } = await fetchRDWData(kenteken);
      rdwFields = mapRDWToCarFields(basic, fuel);
      console.log("RDW fields:", JSON.stringify(rdwFields));
    }

    // Merge provided fields on top of RDW data
    const knownFields = {
      ...rdwFields,
      ...(merk && { merk }),
      ...(model && { model }),
      ...(bouwjaar && { bouwjaar }),
    };
    console.log("Known fields:", JSON.stringify(knownFields));

    // Enrich with LLM
    const llmFields = await enrichWithLLM(knownFields, openrouterKey);
    console.log("LLM fields:", JSON.stringify(llmFields));

    // RDW data takes priority over LLM guesses
    const result = { ...llmFields, ...knownFields };
    console.log("Final result:", JSON.stringify(result));

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in ai-autofill:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Er ging iets mis" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
