import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Google Places API key niet geconfigureerd',
          message: 'Voeg de GOOGLE_PLACES_API_KEY toe in de secrets instellingen'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const placeId = "ChIJeT_9aSNMz0cR6jgTtpMDCqI";

    // Get place details including reviews - request more reviews
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&key=${apiKey}&language=nl&reviews_no_translations=true&reviews_sort=newest`;

    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    if (detailsData.status !== 'OK') {
      return new Response(
        JSON.stringify({ error: 'Kon reviews niet ophalen', details: detailsData }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const result = detailsData.result;

    // Filter for 5-star reviews with text content
    let allReviews = result.reviews || [];

    // Sort reviews by newest first to get most recent
    allReviews.sort((a, b) => new Date(b.time) - new Date(a.time));

    const goodReviewsWithText = allReviews.filter(review =>
      (review.rating === 3 || review.rating === 4 || review.rating === 5) &&
      review.text &&
      review.text.trim().length > 0
    );

    console.log(`Found ${allReviews.length} total reviews, ${goodReviewsWithText.length} are 3-5 star with text`);
  
    return new Response(
      JSON.stringify({
        name: result.name,
        rating: result.rating,
        totalReviews: result.user_ratings_total,
        reviews: goodReviewsWithText,
        filteredCount: goodReviewsWithText.length,
        totalReviewCount: (result.reviews || []).length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Er ging iets mis' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
