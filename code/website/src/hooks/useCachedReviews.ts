import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BUSINESS } from "@/config/business";

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

interface ReviewsResult {
  data: GoogleReviewsData;
  usingFallback: boolean;
}

async function fetchReviewsFromDB(placeId: string): Promise<GoogleReviewsData> {
  // Task 6: Parallelize sequential DB calls with Promise.all
  const [summaryResult, reviewsResult] = await Promise.all([
    supabase
      .from("google_reviews_summary")
      .select("*")
      .eq("place_id", placeId)
      .single(),
    supabase
      .from("google_reviews")
      .select("*")
      .eq("place_id", placeId)
      .order("original_time", { ascending: false })
      .limit(50),
  ]);

  if (summaryResult.error) {
    throw new Error("No review data available in database");
  }

  if (reviewsResult.error) {
    throw reviewsResult.error;
  }

  const summary = summaryResult.data;
  const reviews = reviewsResult.data;

  // Format reviews naar frontend interface
  const formattedReviews =
    reviews?.map((review) => ({
      author_name: review.author_name,
      rating: review.rating,
      text: review.text,
      relative_time_description: review.relative_time_description,
      google_review_url: review.google_review_url,
    })) || [];

  // Calculate cache age voor notification
  const cacheAge = Date.now() - new Date(summary.updated_at).getTime();
  const cacheAgeHours = Math.round(cacheAge / (1000 * 60 * 60));

  // Show cache notification if data is older than 1 hour
  let note = "";
  if (cacheAgeHours >= 1) {
    note = `Data bijgewerkt ${cacheAgeHours}u geleden om ${new Date(
      summary.updated_at
    ).toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return {
    name: summary.place_name,
    rating: parseFloat(summary.average_rating),
    totalReviews: parseInt(summary.total_reviews),
    reviews: formattedReviews,
    filteredCount: formattedReviews.length,
    totalReviewCount: formattedReviews.length,
    note,
    google_review_url: `https://search.google.com/local/reviews?placeid=${placeId}`,
    lastSync: summary.updated_at,
    cacheAgeHours,
  };
}

async function fetchReviewsWithFallback(): Promise<ReviewsResult> {
  const placeId = BUSINESS.GOOGLE_PLACE_ID;

  // Tier 1: Direct uit Supabase database voor instant loading
  try {
    const data = await fetchReviewsFromDB(placeId);
    return { data, usingFallback: false };
  } catch (err) {
    console.warn(
      "Direct database query failed, falling back to Edge Function:",
      err
    );
  }

  // Tier 2: Cached reviews via Edge Function
  try {
    const { data: cachedData, error: cachedError } =
      await supabase.functions.invoke("get-cached-reviews");

    if (!cachedError && cachedData && !cachedData.error) {
      return { data: cachedData, usingFallback: true };
    }
  } catch (tier2Error) {
    console.warn('Tier 2 (Edge Function cached reviews) failed, falling back to Tier 3:', tier2Error);
  }

  // Tier 3: Direct Google API via Edge Function
  const { data: fallbackData, error: fallbackError } =
    await supabase.functions.invoke("google-reviews");

  if (fallbackError || fallbackData?.error) {
    throw new Error(
      fallbackError?.message ||
        fallbackData?.error ||
        "Kon reviews niet laden"
    );
  }

  return {
    data: {
      ...fallbackData,
      note:
        (fallbackData.note || "") +
        " (Live data - database tijdelijk onbeschikbaar)",
    },
    usingFallback: true,
  };
}

export const useCachedReviews = () => {
  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["reviews"],
    queryFn: fetchReviewsWithFallback,
    staleTime: 5 * 60 * 1000, // 5 minutes for reviews
  });

  return {
    reviewsData: data?.data ?? null,
    loading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    usingFallback: data?.usingFallback ?? false,
  };
};
