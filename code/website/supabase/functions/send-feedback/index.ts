import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://wkautoselectie.nl",
  "https://www.wkautoselectie.nl",
  "https://autoservicevanderwaals.nl",
  "https://www.autoservicevanderwaals.nl",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

const sanitize = (s: string): string =>
  s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#x27;" }[c]!));

const MAX_FEEDBACK_LENGTH = 2000;

const BRAND_DEFAULTS = {
  name: "Auto Service van der Waals",
  primary: "#123458",
  background: "#F1EFEC",
  from: "Auto Service van der Waals <noreply@wkautoselectie.nl>",
  to: "info@wkautoselectie.nl",
};

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = Deno.env.get('CLOUDFLARE_TURNSTILE_SECRET_KEY');
  if (!secret) return true;

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });

    if (!response.ok) {
      console.error(`Turnstile API returned status ${response.status}`);
      return false;
    }

    const data = await response.json();
    return data.success === true;
  } catch (e) {
    console.error('Turnstile verification request failed:', e);
    return false;
  }
}

async function getBrand() {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['colors', 'footer']);

    const settings: Record<string, any> = {};
    for (const row of data || []) settings[row.key] = row.value;

    const colors = settings.colors || {};
    const footer = settings.footer || {};

    return {
      ...BRAND_DEFAULTS,
      name: footer.company_name || BRAND_DEFAULTS.name,
      primary: colors.primary || BRAND_DEFAULTS.primary,
      background: colors.background || BRAND_DEFAULTS.background,
    };
  } catch (e) { console.error('getBrand() failed:', e); }
  return BRAND_DEFAULTS;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const BRAND = await getBrand();
    const { rating, feedback, timestamp, turnstileToken } = await req.json();

    // Turnstile verification
    if (turnstileToken) {
      const valid = await verifyTurnstile(turnstileToken);
      if (!valid) {
        return new Response(
          JSON.stringify({ error: 'Beveiligingscontrole mislukt. Probeer het opnieuw.' }),
          { status: 403, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
        );
      }
    } else {
      const secret = Deno.env.get('CLOUDFLARE_TURNSTILE_SECRET_KEY');
      if (secret) {
        return new Response(
          JSON.stringify({ error: 'Beveiligingstoken ontbreekt.' }),
          { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
        );
      }
    }

    // Input validation
    const errors: string[] = [];

    if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      errors.push("Rating moet een geheel getal tussen 1 en 5 zijn.");
    }

    if (rating < 5 && (typeof feedback !== "string" || !feedback.trim())) {
      errors.push("Feedback tekst is verplicht bij een rating lager dan 5.");
    }

    if (feedback && typeof feedback === "string" && feedback.length > MAX_FEEDBACK_LENGTH) {
      errors.push(`Feedback mag maximaal ${MAX_FEEDBACK_LENGTH} tekens zijn.`);
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ error: errors.join(" ") }),
        { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Email service niet beschikbaar' }),
        { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    const safeFeedback = feedback ? sanitize(feedback.trim()) : '';
    const stars = '⭐'.repeat(rating);

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: BRAND.from,
        to: [BRAND.to],
        subject: `Nieuwe feedback ontvangen (${rating}/5 sterren)`,
        html: `
          <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${BRAND.background}; padding: 32px;">
            <div style="background: white; border-radius: 8px; overflow: hidden;">
              <div style="background-color: ${BRAND.primary}; padding: 24px 32px;">
                <h2 style="color: white; margin: 0; font-size: 20px;">Nieuwe Feedback Ontvangen</h2>
              </div>
              <div style="padding: 32px;">
                <div style="background-color: ${BRAND.background}; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
                  <p style="margin: 0; font-size: 24px; text-align: center;">${stars}</p>
                  <p style="margin: 8px 0 0 0; text-align: center; color: #555; font-size: 16px; font-weight: 600;">${rating} van 5 sterren</p>
                </div>
                ${safeFeedback ? `
                <div style="background-color: ${BRAND.background}; padding: 20px; border-radius: 6px;">
                  <h3 style="color: ${BRAND.primary}; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Feedback</h3>
                  <p style="margin: 0; line-height: 1.6; color: #333; white-space: pre-wrap;">${safeFeedback}</p>
                </div>
                ` : `
                <div style="background-color: #e8f5e9; padding: 16px 20px; border-radius: 6px; border-left: 4px solid ${BRAND.primary};">
                  <p style="margin: 0; color: #333;">Positieve review — klant gaf 5 sterren zonder aanvullende feedback.</p>
                </div>
                `}
              </div>
              <div style="padding: 16px 32px; border-top: 1px solid #eee;">
                <p style="margin: 0; font-size: 12px; color: #999; text-align: center;">
                  Verzonden via de review popup op de website · ${new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}
                </p>
              </div>
            </div>
          </div>
        `,
        text: `Nieuwe feedback ontvangen\n\nRating: ${rating}/5 sterren\n\n${safeFeedback ? `Feedback:\n${safeFeedback}` : 'Positieve review zonder aanvullende feedback.'}`,
      }),
    });

    if (!emailResponse.ok) {
      const errText = await emailResponse.text();
      console.error('Email send error:', errText);
      throw new Error('Email versturen mislukt');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Feedback succesvol verzonden' }),
      { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-feedback:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Er ging iets mis' }),
      { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }
});
