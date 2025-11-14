import { useCachedReviews } from "@/hooks/useCachedReviews";
import { Star } from "lucide-react";
import { Button } from "@/components/ui";

const Footer = () => {
  const { reviewsData, loading } = useCachedReviews();

  const renderStars = (rating: number) => {
    // Show 5 stars if rating is 4.5 or higher, otherwise show floor(rating) stars
    const starsToShow = rating >= 4.5 ? 5 : Math.floor(rating);

    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < starsToShow
            ? 'fill-current'
            : 'fill-current opacity-30'
        }`}
        style={{ color: 'var(--color-star-filled)' }}
      />
    ));
  };

  return (
    <footer
      className="section-padding py-12 border-t border-border"
      style={{ backgroundColor: 'var(--color-footer-bg)' }}
    >
      <div className="container-wide">
        <div className="grid md:grid-cols-4 gap-8 text-center md:text-left mb-8">
          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-sm text-muted-foreground">
              info@autoservicevanderwaals.nl<br/>
              06-26 344 965
            </p>
          </div>

          {/* Adres */}
          <div>
            <h4 className="font-semibold mb-4">Adres</h4>
            <p className="text-sm text-muted-foreground">
              Zuid Zijperweg 66<br/>
              1766 HD Wieringerwaard
            </p>
          </div>

          {/* Openingstijden */}
          <div>
            <h4 className="font-semibold mb-4">Openingstijden</h4>
            <p className="text-sm text-muted-foreground">
              Maandag - Vrijdag<br/>
              08:00 - 17:00 uur<br/>
              <span className="text-xs">(Op afspraak)</span>
            </p>
          </div>

          {/* Google Reviews */}
          <div>
            <h4 className="font-semibold mb-4">Google Reviews</h4>
            <div className="flex flex-col items-center md:items-start">
              {loading ? (
                <div className="text-sm text-muted-foreground">Laden...</div>
              ) : reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
                <>
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(reviewsData.rating || 0)}
                    <span className="ml-1 font-semibold text-lg">
                      {reviewsData.rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {reviewsData.totalReviews || 0} reviews
                  </div>
                  <Button
                    asChild
                    className="text-sm"
                  >
                    <a
                      href={reviewsData.google_review_url || "https://www.google.com/maps/place//data=!4m8!1m2!2m3!1sChIJeT_9aSNMz0cR6jgTtpMDCqI!2s0x0:0x0!3m2!1sen!2snl!5m2!1sChIJeT_9aSNMz0cR6jgTtpMDCqI!2e0"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {/* Google Logo */}
                      <svg
                        className="w-4 h-4 mr-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Bekijk op Google
                    </a>
                  </Button>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Geen reviews beschikbaar
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Auto Service van der Waals. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;