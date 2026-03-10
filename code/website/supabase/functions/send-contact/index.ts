import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const sanitize = (s: string): string =>
  s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#x27;" }[c]!));

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_MESSAGE_LENGTH = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BRAND_DEFAULTS = {
  name: "Auto Service van der Waals",
  primary: "#123458",
  background: "#F1EFEC",
  from: "Auto Service van der Waals <noreply@wkautoselectie.nl>",
  to: "info@wkautoselectie.nl",
};

async function getBrand() {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['colors', 'footer', 'email_templates']);

    const settings: Record<string, any> = {};
    for (const row of data || []) settings[row.key] = row.value;

    const colors = settings.colors || {};
    const footer = settings.footer || {};

    const tpl = settings.email_templates || {};

    return {
      ...BRAND_DEFAULTS,
      name: footer.company_name || BRAND_DEFAULTS.name,
      primary: colors.primary || BRAND_DEFAULTS.primary,
      background: colors.background || BRAND_DEFAULTS.background,
      phone: footer.phone || "06-26 344 965",
      address: footer.address_line1 && footer.address_line2
        ? `${footer.address_line1}, ${footer.address_line2}`
        : "Zuid Zijperweg 66, 1766 HD Wieringerwaard",
      tpl: {
        contact_confirm_greeting: tpl.contact_confirm_greeting || "Bedankt voor uw bericht, {naam}!",
        contact_confirm_body: tpl.contact_confirm_body || "We hebben uw bericht in goede orde ontvangen. We streven ernaar om zo snel mogelijk te reageren, meestal binnen 1 werkdag.",
        contact_confirm_urgent: tpl.contact_confirm_urgent || "Heeft u een dringende vraag? Bel ons gerust op {telefoon}.",
      },
    };
  } catch (_) { /* fallback to defaults */ }
  return {
    ...BRAND_DEFAULTS,
    phone: "06-26 344 965",
    address: "Zuid Zijperweg 66, 1766 HD Wieringerwaard",
    tpl: {
      contact_confirm_greeting: "Bedankt voor uw bericht, {naam}!",
      contact_confirm_body: "We hebben uw bericht in goede orde ontvangen. We streven ernaar om zo snel mogelijk te reageren, meestal binnen 1 werkdag.",
      contact_confirm_urgent: "Heeft u een dringende vraag? Bel ons gerust op {telefoon}.",
    },
  };
}

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = Deno.env.get('CLOUDFLARE_TURNSTILE_SECRET_KEY');
  if (!secret) return true;

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
  });

  const data = await response.json();
  return data.success === true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const BRAND = await getBrand();
    const { naam, email, bericht, turnstileToken } = await req.json();

    // Turnstile verification
    if (turnstileToken) {
      const valid = await verifyTurnstile(turnstileToken);
      if (!valid) {
        return new Response(
          JSON.stringify({ error: 'Beveiligingscontrole mislukt. Probeer het opnieuw.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      const secret = Deno.env.get('CLOUDFLARE_TURNSTILE_SECRET_KEY');
      if (secret) {
        return new Response(
          JSON.stringify({ error: 'Beveiligingstoken ontbreekt.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Input validation
    const errors: string[] = [];

    if (typeof naam !== "string" || !naam.trim()) {
      errors.push("Naam is verplicht.");
    } else if (naam.length > MAX_NAME_LENGTH) {
      errors.push(`Naam mag maximaal ${MAX_NAME_LENGTH} tekens zijn.`);
    }

    if (typeof email !== "string" || !email.trim()) {
      errors.push("E-mail is verplicht.");
    } else if (email.length > MAX_EMAIL_LENGTH) {
      errors.push(`E-mail mag maximaal ${MAX_EMAIL_LENGTH} tekens zijn.`);
    } else if (!EMAIL_REGEX.test(email)) {
      errors.push("Ongeldig e-mailadres.");
    }

    if (typeof bericht !== "string" || !bericht.trim()) {
      errors.push("Bericht is verplicht.");
    } else if (bericht.length > MAX_MESSAGE_LENGTH) {
      errors.push(`Bericht mag maximaal ${MAX_MESSAGE_LENGTH} tekens zijn.`);
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ error: errors.join(" ") }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Email service niet beschikbaar' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const safeName = sanitize(naam.trim());
    const safeEmail = sanitize(email.trim());
    const safeMessage = sanitize(bericht.trim());

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: BRAND.from,
        to: [BRAND.to],
        reply_to: email.trim(),
        subject: `Nieuw contactbericht van ${safeName}`,
        html: `
          <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${BRAND.background}; padding: 32px;">
            <div style="background: white; border-radius: 8px; overflow: hidden;">
              <div style="background-color: ${BRAND.primary}; padding: 24px 32px;">
                <h2 style="color: white; margin: 0; font-size: 20px;">Nieuw Contactbericht</h2>
              </div>
              <div style="padding: 32px;">
                <div style="background-color: ${BRAND.background}; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
                  <h3 style="color: ${BRAND.primary}; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Afzender</h3>
                  <p style="margin: 0 0 6px 0; color: #555;"><strong>Naam:</strong> ${safeName}</p>
                  <p style="margin: 0; color: #555;"><strong>E-mail:</strong> ${safeEmail}</p>
                </div>
                <div style="background-color: ${BRAND.background}; padding: 20px; border-radius: 6px;">
                  <h3 style="color: ${BRAND.primary}; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Bericht</h3>
                  <p style="margin: 0; line-height: 1.6; color: #333; white-space: pre-wrap;">${safeMessage}</p>
                </div>
              </div>
              <div style="padding: 16px 32px; border-top: 1px solid #eee;">
                <p style="margin: 0; font-size: 12px; color: #999; text-align: center;">
                  Verzonden via het contactformulier op de website · ${new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}
                </p>
              </div>
            </div>
          </div>
        `,
        text: `Nieuw contactbericht\n\nNaam: ${safeName}\nE-mail: ${safeEmail}\n\nBericht:\n${safeMessage}`,
      }),
    });

    if (!emailResponse.ok) {
      const errText = await emailResponse.text();
      console.error('Email send error:', errText);
      throw new Error('Email versturen mislukt');
    }

    // Customer confirmation email
    const confirmationResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: BRAND.from,
        to: [email.trim()],
        reply_to: BRAND.to,
        subject: `Bevestiging: we hebben uw bericht ontvangen`,
        html: `
          <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${BRAND.background}; padding: 32px;">
            <div style="background: white; border-radius: 8px; overflow: hidden;">
              <div style="background-color: ${BRAND.primary}; padding: 24px 32px;">
                <h2 style="color: white; margin: 0; font-size: 20px;">${BRAND.name}</h2>
              </div>
              <div style="padding: 32px;">
                <h3 style="color: #333; margin: 0 0 16px 0; font-size: 18px;">${BRAND.tpl.contact_confirm_greeting.replace(/\{naam\}/g, safeName)}</h3>
                <p style="color: #555; line-height: 1.6; margin: 0 0 16px 0;">
                  ${BRAND.tpl.contact_confirm_body}
                </p>
                <div style="background-color: ${BRAND.background}; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
                  <h3 style="color: ${BRAND.primary}; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Uw bericht</h3>
                  <p style="margin: 0; line-height: 1.6; color: #333; white-space: pre-wrap; font-style: italic;">${safeMessage}</p>
                </div>
                <p style="color: #555; line-height: 1.6; margin: 0 0 24px 0;">
                  ${BRAND.tpl.contact_confirm_urgent.replace(/\{telefoon\}/g, `<strong>${BRAND.phone}</strong>`)}
                </p>
                <div style="border-top: 1px solid #eee; padding-top: 20px;">
                  <p style="color: #555; margin: 0; line-height: 1.6;">
                    Met vriendelijke groet,<br>
                    <strong>${BRAND.name}</strong><br>
                    <span style="font-size: 14px; color: #999;">${BRAND.address}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        `,
        text: `${BRAND.tpl.contact_confirm_greeting.replace(/\{naam\}/g, safeName)}\n\n${BRAND.tpl.contact_confirm_body}\n\nUw bericht:\n${safeMessage}\n\n${BRAND.tpl.contact_confirm_urgent.replace(/\{telefoon\}/g, BRAND.phone)}\n\nMet vriendelijke groet,\n${BRAND.name}\n${BRAND.address}`,
      }),
    });

    if (!confirmationResponse.ok) {
      console.error('Confirmation email error:', await confirmationResponse.text());
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Bericht succesvol verzonden' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-contact:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Er ging iets mis' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
