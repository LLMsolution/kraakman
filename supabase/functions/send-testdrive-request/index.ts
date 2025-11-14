import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestDriveRequest {
  name: string;
  email: string;
  carBrand: string;
  carModel: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, carBrand, carModel }: TestDriveRequest = await req.json();

    console.log("Processing test drive request:", { name, email, carBrand, carModel });

    // Send email to business using Resend API
    const businessEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Auto Service van der Waals <onboarding@resend.dev>",
        to: ["info@autoservicevanderwaals.nl"],
        subject: `Proefrit aanvraag - ${carBrand} ${carModel}`,
        html: `
          <h2>Nieuwe proefrit aanvraag</h2>
          <p><strong>${name}</strong> wil graag een proefrit plannen met <strong>${carBrand} ${carModel}</strong></p>
          <h3>Contactgegevens:</h3>
          <ul>
            <li><strong>Naam:</strong> ${name}</li>
            <li><strong>E-mail:</strong> ${email}</li>
          </ul>
          <p>Neem zo snel mogelijk contact op met de klant.</p>
        `,
      }),
    });

    const businessEmailData = await businessEmailResponse.json();
    console.log("Business email sent:", businessEmailData);

    if (!businessEmailResponse.ok) {
      throw new Error(`Failed to send business email: ${JSON.stringify(businessEmailData)}`);
    }

    // Send confirmation email to customer
    const confirmationEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Auto Service van der Waals <onboarding@resend.dev>",
        to: [email],
        subject: "Bevestiging proefrit aanvraag",
        html: `
          <h2>Bedankt voor je aanvraag, ${name}!</h2>
          <p>We hebben je aanvraag voor een proefrit met de <strong>${carBrand} ${carModel}</strong> ontvangen.</p>
          <p>We nemen zo snel mogelijk contact met je op om een afspraak in te plannen.</p>
          <br>
          <p>Met vriendelijke groet,<br>Auto Service van der Waals</p>
        `,
      }),
    });

    const confirmationEmailData = await confirmationEmailResponse.json();
    console.log("Confirmation email sent:", confirmationEmailData);

    if (!confirmationEmailResponse.ok) {
      throw new Error(`Failed to send confirmation email: ${JSON.stringify(confirmationEmailData)}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        businessEmail: businessEmailData,
        confirmationEmail: confirmationEmailData 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-testdrive-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
