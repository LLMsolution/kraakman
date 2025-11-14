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

  const startTime = Date.now();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const placeId = "ChIJeT_9aSNMz0cR6jgTtpMDCqI"; // Kraakman Place ID

  try {
    // Initialize sync log
    const { data: syncLog, error: logError } = await supabase
      .from('google_review_sync_log')
      .insert({
        sync_type: 'scheduled',
        sync_status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (logError) throw logError;

    // Fetch data from Google API
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      throw new Error('Google Places API key not configured');
    }

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&key=${apiKey}&language=nl&reviews_no_translations=true&reviews_sort=newest`;

    const response = await fetch(detailsUrl);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google API error: ${data.status}`);
    }

    const result = data.result;
    let totalReviewsFetched = result.reviews?.length || 0;
    let newReviewsAdded = 0;
    let reviewsUpdated = 0;
    let reviewsDeleted = 0;

    // Update summary
    await supabase
      .from('google_reviews_summary')
      .upsert({
        place_id: placeId,
        place_name: result.name,
        average_rating: result.rating,
        total_reviews: result.user_ratings_total,
        updated_at: new Date().toISOString()
      });

    // Process individual reviews (4-5 star with text as per requirements)
    const allReviews = result.reviews || [];
    const filteredReviews = allReviews.filter(review =>
      (review.rating === 4 || review.rating === 5) &&
      review.text &&
      review.text.trim().length > 0
    );

    for (const review of filteredReviews) {
      const reviewData = {
        place_id: placeId,
        google_review_id: review.time.toString(),
        author_name: review.author_name,
        rating: review.rating,
        text: review.text || null,
        relative_time_description: review.relative_time_description,
        original_time: new Date(review.time * 1000).toISOString(),
        google_review_url: `https://search.google.com/local/reviews?placeid=${placeId}`,
        profile_photo_url: review.profile_photo_url || null,
        updated_at: new Date().toISOString()
      };

      const { error: upsertError } = await supabase
        .from('google_reviews')
        .upsert(reviewData, {
          onConflict: 'place_id,google_review_id',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error('Error upserting review:', upsertError);
      } else {
        // Check if this was a new or updated review
        const { data: existing } = await supabase
          .from('google_reviews')
          .select('created_at')
          .eq('place_id', placeId)
          .eq('google_review_id', reviewData.google_review_id)
          .single();

        if (!existing) {
          newReviewsAdded++;
        } else if (new Date(existing.created_at).getTime() < new Date().getTime() - 1000) {
          reviewsUpdated++;
        }
      }
    }

    // Clean up old reviews that are no longer returned by Google (optional)
    const currentGoogleReviewIds = filteredReviews.map(r => r.time.toString());
    if (currentGoogleReviewIds.length > 0) {
      const { data: deletedReviews } = await supabase
        .from('google_reviews')
        .delete()
        .eq('place_id', placeId)
        .not('google_review_id', 'in', `(${currentGoogleReviewIds.join(',')})`);

      reviewsDeleted = deletedReviews?.length || 0;
    }

    const duration = Date.now() - startTime;

    // Update sync log with success
    await supabase
      .from('google_review_sync_log')
      .update({
        total_reviews_fetched: totalReviewsFetched,
        new_reviews_added: newReviewsAdded,
        reviews_updated: reviewsUpdated,
        reviews_deleted: reviewsDeleted,
        sync_status: 'success',
        sync_duration_ms: duration,
        finished_at: new Date().toISOString()
      })
      .eq('id', syncLog.id);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          totalReviewsFetched,
          newReviewsAdded,
          reviewsUpdated,
          reviewsDeleted,
          duration: `${duration}ms`,
          averageRating: result.rating,
          totalGoogleReviews: result.user_ratings_total,
          cachedReviews: filteredReviews.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('Sync error:', error);

    // Update sync log with error
    await supabase
      .from('google_review_sync_log')
      .update({
        sync_status: 'error',
        error_message: error.message,
        sync_duration_ms: duration,
        finished_at: new Date().toISOString()
      })
      .eq('id', syncLog?.id);

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