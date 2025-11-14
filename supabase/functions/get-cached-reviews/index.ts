import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const placeId = "ChIJeT_9aSNMz0cR6jgTtpMDCqI";

    // Get summary data
    const { data: summary, error: summaryError } = await supabase
      .from('google_reviews_summary')
      .select('*')
      .eq('place_id', placeId)
      .single();

    if (summaryError) {
      // If no cached data, return error to trigger fallback
      return new Response(
        JSON.stringify({
          error: 'No cached review data available',
          fallbackRequired: true
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get reviews (only 4-5 star filtered in database)
    const { data: reviews, error: reviewsError } = await supabase
      .from('google_reviews')
      .select('*')
      .eq('place_id', placeId)
      .order('original_time', { ascending: false })
      .limit(50); // Limit for performance

    if (reviewsError) {
      throw reviewsError;
    }

    // Format response to match existing frontend interface
    const formattedReviews = reviews?.map(review => ({
      author_name: review.author_name,
      rating: review.rating,
      text: review.text,
      relative_time_description: review.relative_time_description,
      google_review_url: review.google_review_url
    })) || [];

    // Calculate cache age for notification
    const cacheAge = Date.now() - new Date(summary.updated_at).getTime();
    const cacheAgeHours = Math.round(cacheAge / (1000 * 60 * 60));

    // Only show cache notification if cache is older than 1 hour
    let note = '';
    if (cacheAgeHours >= 1) {
      note = `Data cached ${cacheAgeHours}u geleden om ${new Date(summary.updated_at).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return new Response(
      JSON.stringify({
        name: summary.place_name,
        rating: parseFloat(summary.average_rating),
        totalReviews: parseInt(summary.total_reviews),
        reviews: formattedReviews,
        filteredCount: formattedReviews.length,
        totalReviewCount: formattedReviews.length,
        note,
        google_review_url: `https://search.google.com/local/reviews?placeid=${placeId}`,
        lastSync: summary.updated_at,
        cacheAgeHours
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        fallbackRequired: true
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});