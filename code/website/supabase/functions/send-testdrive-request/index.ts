import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sanitize = (s: string): string =>
  s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#x27;" }[c]!));

const MAX_NAME_LENGTH = 100;
const MAX_FIELD_LENGTH = 255;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BRAND_DEFAULTS = {
  name: "Auto Service van der Waals",
  primary: "#123458",
  background: "#F1EFEC",
  from: "Auto Service van der Waals <noreply@autoservicevanderwaals.nl>",
  to: "info@autoservicevanderwaals.nl",
  siteUrl: "https://autoservicevanderwaals.nl",
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
        testdrive_confirm_greeting: tpl.testdrive_confirm_greeting || "Bedankt voor uw aanvraag, {naam}!",
        testdrive_confirm_body: tpl.testdrive_confirm_body || "We hebben uw proefrit aanvraag ontvangen. We nemen zo snel mogelijk contact met u op om een afspraak in te plannen.",
      },
    };
  } catch (_) { /* fallback to defaults */ }
  return {
    ...BRAND_DEFAULTS,
    phone: "06-26 344 965",
    address: "Zuid Zijperweg 66, 1766 HD Wieringerwaard",
    tpl: {
      testdrive_confirm_greeting: "Bedankt voor uw aanvraag, {naam}!",
      testdrive_confirm_body: "We hebben uw proefrit aanvraag ontvangen. We nemen zo snel mogelijk contact met u op om een afspraak in te plannen.",
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

interface TestDriveRequest {
  name: string;
  email: string;
  phone?: string;
  carBrand: string;
  carModel: string;
  carYear?: number;
  carPrice?: number;
  carImage?: string;
  carId?: string;
  turnstileToken?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BRAND = await getBrand();
    const { name, email, phone, carBrand, carModel, carYear, carPrice, carImage, carId, turnstileToken }: TestDriveRequest = await req.json();

    // Turnstile verification
    if (turnstileToken) {
      const valid = await verifyTurnstile(turnstileToken);
      if (!valid) {
        return new Response(
          JSON.stringify({ error: "Beveiligingscontrole mislukt. Probeer het opnieuw." }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else {
      const secret = Deno.env.get('CLOUDFLARE_TURNSTILE_SECRET_KEY');
      if (secret) {
        return new Response(
          JSON.stringify({ error: "Beveiligingstoken ontbreekt." }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Input validation
    const errors: string[] = [];

    if (typeof name !== "string" || !name.trim()) {
      errors.push("Naam is verplicht.");
    } else if (name.length > MAX_NAME_LENGTH) {
      errors.push(`Naam mag maximaal ${MAX_NAME_LENGTH} tekens zijn.`);
    }

    if (typeof email !== "string" || !email.trim()) {
      errors.push("E-mail is verplicht.");
    } else if (email.length > MAX_FIELD_LENGTH) {
      errors.push(`E-mail mag maximaal ${MAX_FIELD_LENGTH} tekens zijn.`);
    } else if (!EMAIL_REGEX.test(email)) {
      errors.push("Ongeldig e-mailadres.");
    }

    if (typeof carBrand !== "string" || !carBrand.trim()) {
      errors.push("Automerk is verplicht.");
    }

    if (typeof carModel !== "string" || !carModel.trim()) {
      errors.push("Automodel is verplicht.");
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ error: errors.join(" ") }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Email service niet beschikbaar' }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const safeName = sanitize(name.trim());
    const safeEmail = sanitize(email.trim());
    const safePhone = phone ? sanitize(phone.trim()) : '';
    const safeCarBrand = sanitize(carBrand.trim());
    const safeCarModel = sanitize(carModel.trim());
    const carTitle = carYear ? `${carYear} ${safeCarBrand} ${safeCarModel}` : `${safeCarBrand} ${safeCarModel}`;
    const carPriceFormatted = carPrice ? `€${carPrice.toLocaleString('nl-NL')}` : '';
    const carUrl = carId ? `${BRAND.siteUrl}/auto/${carId}` : '';

    const carImageBlock = carImage ? `
      <div style="border-radius: 6px; overflow: hidden; margin-bottom: 24px;">
        <img src="${sanitize(carImage)}" alt="${carTitle}" style="width: 100%; height: auto; display: block; max-height: 300px; object-fit: cover;" />
      </div>
    ` : '';

    const carDetailsBlock = `
      <div style="background-color: ${BRAND.background}; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
        <h3 style="color: ${BRAND.primary}; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Auto</h3>
        <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #333;">${carTitle}</p>
        ${carPriceFormatted ? `<p style="margin: 0; font-size: 16px; color: ${BRAND.primary}; font-weight: 600;">${carPriceFormatted}</p>` : ''}
        ${carUrl ? `<p style="margin: 8px 0 0 0;"><a href="${carUrl}" style="color: ${BRAND.primary}; font-size: 14px;">Bekijk op website →</a></p>` : ''}
      </div>
    `;

    // Business notification email
    const businessEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: BRAND.from,
        to: [BRAND.to],
        reply_to: email.trim(),
        subject: `Proefrit aanvraag — ${carTitle}`,
        html: `
          <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${BRAND.background}; padding: 32px;">
            <div style="background: white; border-radius: 8px; overflow: hidden;">
              <div style="background-color: ${BRAND.primary}; padding: 24px 32px;">
                <h2 style="color: white; margin: 0; font-size: 20px;">Nieuwe Proefrit Aanvraag</h2>
              </div>
              <div style="padding: 32px;">
                <p style="color: #333; font-size: 16px; margin: 0 0 24px 0;">
                  <strong>${safeName}</strong> wil graag een proefrit plannen.
                </p>
                ${carImageBlock}
                ${carDetailsBlock}
                <div style="background-color: ${BRAND.background}; padding: 20px; border-radius: 6px;">
                  <h3 style="color: ${BRAND.primary}; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Contactgegevens</h3>
                  <p style="margin: 0 0 6px 0; color: #555;"><strong>Naam:</strong> ${safeName}</p>
                  <p style="margin: 0 0 6px 0; color: #555;"><strong>E-mail:</strong> ${safeEmail}</p>
                  ${safePhone ? `<p style="margin: 0; color: #555;"><strong>Telefoon:</strong> ${safePhone}</p>` : ''}
                </div>
              </div>
              <div style="padding: 16px 32px; border-top: 1px solid #eee;">
                <p style="margin: 0; font-size: 12px; color: #999; text-align: center;">
                  Verzonden via het proefrit formulier · ${new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}
                </p>
              </div>
            </div>
          </div>
        `,
        text: `Nieuwe proefrit aanvraag\n\nAuto: ${carTitle}${carPriceFormatted ? ` — ${carPriceFormatted}` : ''}\n\nNaam: ${safeName}\nE-mail: ${safeEmail}${safePhone ? `\nTelefoon: ${safePhone}` : ''}`,
      }),
    });

    if (!businessEmailResponse.ok) {
      const errText = await businessEmailResponse.text();
      console.error('Business email error:', errText);
      throw new Error('Email versturen mislukt');
    }

    // Customer confirmation email
    const confirmationEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: BRAND.from,
        to: [email.trim()],
        subject: `Bevestiging proefrit aanvraag — ${carTitle}`,
        html: `
          <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${BRAND.background}; padding: 32px;">
            <div style="background: white; border-radius: 8px; overflow: hidden;">
              <div style="background-color: ${BRAND.primary}; padding: 24px 32px;">
                <h2 style="color: white; margin: 0; font-size: 20px;">${BRAND.name}</h2>
              </div>
              <div style="padding: 32px;">
                <h3 style="color: #333; margin: 0 0 16px 0; font-size: 18px;">${BRAND.tpl.testdrive_confirm_greeting.replace(/\{naam\}/g, safeName)}</h3>
                <p style="color: #555; line-height: 1.6; margin: 0 0 24px 0;">
                  ${BRAND.tpl.testdrive_confirm_body}
                </p>
                ${carImageBlock}
                ${carDetailsBlock}
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
        text: `${BRAND.tpl.testdrive_confirm_greeting.replace(/\{naam\}/g, safeName)}\n\n${BRAND.tpl.testdrive_confirm_body}\n\nAuto: ${carTitle}\n\nMet vriendelijke groet,\n${BRAND.name}\n${BRAND.address}`,
      }),
    });

    if (!confirmationEmailResponse.ok) {
      console.error('Confirmation email error:', await confirmationEmailResponse.text());
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Proefrit aanvraag verzonden' }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-testdrive-request:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Er ging iets mis' }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
