import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  google_review_url?: string;
}

interface GoogleReviewsData {
  name: string;
  rating: number;
  totalReviews: number;
  reviews: Review[];
  filteredCount?: number;
  totalReviewCount?: number;
  note?: string;
  google_review_url?: string;
  lastSync?: string;
  cacheAgeHours?: number;
}

export const useCachedReviews = () => {
  const [reviewsData, setReviewsData] = useState<GoogleReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Optie 1: Direct uit Supabase database voor instant loading
        const placeId = "ChIJeT_9aSNMz0cR6jgTtpMDCqI";

        // Haal summary data direct uit database
        const { data: summary, error: summaryError } = await supabase
          .from('google_reviews_summary')
          .select('*')
          .eq('place_id', placeId)
          .single();

        if (summaryError) {
          // If no data, fallback to Edge Function
          throw new Error('No review data available in database');
        }

        // Haal reviews direct uit database (alleen 4-5 sterren met tekst)
        const { data: reviews, error: reviewsError } = await supabase
          .from('google_reviews')
          .select('*')
          .eq('place_id', placeId)
          .order('original_time', { ascending: false })
          .limit(50);

        if (reviewsError) {
          throw reviewsError;
        }

        // Format reviews naar frontend interface
        const formattedReviews = reviews?.map((review) => ({
          author_name: review.author_name,
          rating: review.rating,
          text: review.text,
          relative_time_description: review.relative_time_description,
          google_review_url: review.google_review_url
        })) || [];

        // Calculate cache age voor notification
        const cacheAge = Date.now() - new Date(summary.updated_at).getTime();
        const cacheAgeHours = Math.round(cacheAge / (1000 * 60 * 60));

        // Show cache notification if data is older than 1 hour
        let note = '';
        if (cacheAgeHours >= 1) {
          note = `Data bijgewerkt ${cacheAgeHours}u geleden om ${new Date(summary.updated_at).toLocaleTimeString('nl-NL', {
            hour: '2-digit',
            minute: '2-digit'
          })}`;
        }

        setReviewsData({
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
        });
        setLoading(false);

      } catch (err) {
        console.warn('Direct database query failed, falling back to Edge Function:', err);

        // Fallback naar Edge Function als database query faalt
        setUsingFallback(true);

        try {
          // Probeer cached reviews via Edge Function
          const { data: cachedData, error: cachedError } = await supabase.functions.invoke('get-cached-reviews');

          if (!cachedError && cachedData && !cachedData.error) {
            setReviewsData(cachedData);
            setLoading(false);
            return;
          }

          // Als cached faalt, probeer direct Google API
          const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke('google-reviews');

          if (fallbackError || fallbackData?.error) {
            throw new Error(fallbackError?.message || fallbackData?.error || 'Kon reviews niet laden');
          }

          setReviewsData({
            ...fallbackData,
            note: (fallbackData.note || '') + ' (Live data - database tijdelijk onbeschikbaar)'
          });
          setLoading(false);

        } catch (fallbackErr) {
          console.error('Error fetching reviews:', fallbackErr);
          setError(fallbackErr instanceof Error ? fallbackErr.message : 'Kon reviews niet laden');
          setLoading(false);
        }
      }
    };

    fetchReviews();
  }, []);

  return { reviewsData, loading, error, usingFallback };
};