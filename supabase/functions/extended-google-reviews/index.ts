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
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      throw new Error('Google Places API key not configured');
    }

    const placeId = "ChIJeT_9aSNMz0cR6jgTtpMDCqI";

    // Try multiple API approaches to get more reviews
    const allReviews = [];

    // Method 1: Standard Place Details API
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&key=${apiKey}&language=nl&reviews_no_translations=true&reviews_sort=newest`;

    const response1 = await fetch(detailsUrl);
    const data1 = await response1.json();

    if (data1.status === 'OK' && data1.result?.reviews) {
      allReviews.push(...data1.result.reviews);
    }

    // Method 2: Try to find nearby places that might be the same business
    const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=52.876985,5.0075017&radius=100&type=car_repair&key=${apiKey}&language=nl`;

    const response2 = await fetch(nearbyUrl);
    const data2 = await response2.json();

    if (data2.status === 'OK' && data2.results) {
      for (const place of data2.results) {
        if (place.name?.toLowerCase().includes('van der waals') ||
            place.name?.toLowerCase().includes('wk auto')) {

          const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,user_ratings_total,reviews&key=${apiKey}&language=nl&reviews_no_translations=true&reviews_sort=newest`;

          const response3 = await fetch(placeDetailsUrl);
          const data3 = await response3.json();

          if (data3.status === 'OK' && data3.result?.reviews) {
            allReviews.push(...data3.result.reviews);
          }
        }
      }
    }

    // Method 3: Text search for the business
    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=Autoservice%20van%20der%20Waals%20Wieringerwaard&key=${apiKey}&language=nl`;

    const response4 = await fetch(textSearchUrl);
    const data4 = await response4.json();

    if (data4.status === 'OK' && data4.results) {
      for (const place of data4.results) {
        const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,user_ratings_total,reviews&key=${apiKey}&language=nl&reviews_no_translations=true&reviews_sort=newest`;

        const response5 = await fetch(placeDetailsUrl);
        const data5 = await response5.json();

        if (data5.status === 'OK' && data5.result?.reviews) {
          allReviews.push(...data5.result.reviews);
        }
      }
    }

    // Remove duplicates based on time and author
    const uniqueReviews = allReviews.filter((review, index, self) =>
      index === self.findIndex((r) =>
        r.time === review.time &&
        r.author_name === review.author_name
      )
    );

    // Filter for 4-5 star reviews with text
    const filteredReviews = uniqueReviews.filter(review =>
      (review.rating === 4 || review.rating === 5) &&
      review.text &&
      review.text.trim().length > 0
    );

    return new Response(
      JSON.stringify({
        success: true,
        total_reviews_found: uniqueReviews.length,
        filtered_4_5_star_reviews: filteredReviews.length,
        original_google_total: data1.result?.user_ratings_total || 30,
        methods_tried: 3,
        reviews: filteredReviews.map(review => ({
          author_name: review.author_name,
          rating: review.rating,
          text: review.text,
          relative_time_description: review.relative_time_description,
          time: review.time,
          profile_photo_url: review.profile_photo_url
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});