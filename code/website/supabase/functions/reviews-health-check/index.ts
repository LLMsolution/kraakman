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

  // Verify admin authentication
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
    authHeader.replace("Bearer ", "")
  );
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  const { data: isAdmin } = await supabaseAuth.rpc("is_admin", { user_id: user.id });
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Check last successful sync
    const { data: lastSync, error: syncError } = await supabase
      .from('google_review_sync_log')
      .select('*')
      .eq('sync_status', 'success')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Check cached data freshness
    const { data: summary, error: summaryError } = await supabase
      .from('google_reviews_summary')
      .select('updated_at,total_reviews,average_rating')
      .single();

    const lastSyncTime = lastSync?.created_at;
    const cacheAge = summary ? Date.now() - new Date(summary.updated_at).getTime() : Infinity;
    const cacheAgeHours = Math.round(cacheAge / (1000 * 60 * 60));

    // System is healthy if cache is less than 48 hours old
    const isHealthy = cacheAge < 48 * 60 * 60 * 1000;

    // Get review count from cache
    const { data: reviewsCount } = await supabase
      .from('google_reviews')
      .select('id', { count: 'exact', head: true })
      .eq('place_id', 'ChIJeT_9aSNMz0cR6jgTtpMDCqI');

    // Build recommendations based on system state
    const recommendations = [];

    if (cacheAge > 48 * 60 * 60 * 1000) {
      recommendations.push('Cache is oud, overweeg handmatige sync');
    }

    if (!lastSync) {
      recommendations.push('Geen succesvolle syncs ooit vastgelegd');
    }

    if (!summary) {
      recommendations.push('Geen gecachte data beschikbaar');
    }

    return new Response(
      JSON.stringify({
        healthy: isHealthy,
        lastSync: lastSyncTime,
        cacheAgeHours,
        reviewsInCache: reviewsCount?.length || 0,
        averageRating: summary?.average_rating || 0,
        totalReviews: summary?.total_reviews || 0,
        lastUpdated: summary?.updated_at,
        recommendations,
        status: isHealthy ? 'Healthy' : 'Attention needed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        healthy: false,
        error: error.message,
        status: 'Error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});