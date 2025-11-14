import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeedbackRequest {
  rating: number;
  feedback: string;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { rating, feedback, timestamp }: FeedbackRequest = await req.json();

    if (!rating || (rating < 5 && !feedback?.trim())) {
      return new Response(
        JSON.stringify({ error: 'Ongeldige data' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'Email service niet beschikbaar' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create email content
    const emailSubject = `Nieuwe feedback ontvangen (${rating}/5 sterren)`;

    const emailContent = `
Nieuwe feedback ontvangen van een klant:

⭐ Rating: ${rating}/5 sterren
📅 Datum: ${new Date(timestamp).toLocaleString('nl-NL')}

💬 Feedback:
${feedback || 'Geen tekstuele feedback (5 sterren rating)'}

---
Deze feedback is verzonden via de review popup op de website.
    `.trim();

    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@autoservicevanderwaals.nl',
        to: ['info@autoservicevanderwaals.nl'],
        subject: emailSubject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #3B82F6; padding-bottom: 10px;">
              📝 Nieuwe Feedback Ontvangen
            </h2>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px;">
                <strong>Rating:</strong> ${'⭐'.repeat(rating)} ${rating}/5 sterren
              </p>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
                <strong>Datum:</strong> ${new Date(timestamp).toLocaleString('nl-NL')}
              </p>
            </div>

            ${feedback ? `
            <div style="background-color: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">💬 Feedback:</h3>
              <p style="margin: 0; line-height: 1.6; color: #555; white-space: pre-wrap;">${feedback}</p>
            </div>
            ` : `
            <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <p style="margin: 0; color: #155724;">
                <strong>Positieve review!</strong> Klant gaf 5 sterren zonder aanvullende feedback.
              </p>
            </div>
            `}

            <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px;">
              <p style="margin: 0; font-size: 12px; color: #999; text-align: center;">
                Deze feedback is verzonden via de review popup op de website.<br>
                Tijdstip van verzending: ${new Date().toLocaleString('nl-NL')}
              </p>
            </div>
          </div>
        `,
        text: emailContent,
      }),
    });

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();
      console.error('Email send error:', emailError);
      throw new Error(`Email versturen mislukt: ${emailError}`);
    }

    const emailResult = await emailResponse.json();
    console.log('Email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Feedback succesvol verzonden',
        emailId: emailResult.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in send-feedback function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Er ging iets mis'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});