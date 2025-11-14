import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Star, AlertCircle, RefreshCw, Clock } from "lucide-react";
import { useState } from "react";
import { useCachedReviews } from "@/hooks/useCachedReviews";
import { Button } from "@/components/ui";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReviewPopup from "@/components/ReviewPopup";
import InfiniteReviewCarousel from "@/components/InfiniteReviewCarousel";

const Reviews = () => {
  const [isReviewPopupOpen, setIsReviewPopupOpen] = useState(false);
  const { reviewsData, loading, error, usingFallback } = useCachedReviews();

  const averageRating = reviewsData?.rating;
  const totalReviews = reviewsData?.totalReviews;
  const reviews = reviewsData?.reviews || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* API Key Warning */}
      {error && (
        <div className="section-padding py-6 bg-muted">
          <div className="container-wide">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Reviews konden niet worden geladen:</strong> {error}<br/>
                {usingFallback
                  ? "Er wordt momenteel gebruik gemaakt van een live verbinding met Google."
                  : "Probeer de pagina opnieuw te laden of neem contact op."
                }
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

  
      {/* Fallback Mode Notification */}
      {usingFallback && !error && (
        <div className="section-padding py-4 bg-amber-50 dark:bg-amber-950/20">
          <div className="container-wide">
            <div className="flex items-center justify-center gap-2 text-sm text-amber-800 dark:text-amber-200">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Live data wordt gebruikt - gecachte data is tijdelijk onbeschikbaar</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section
        className="section-padding bg-primary text-primary-foreground"
        style={{
          paddingTop: 'var(--spacing-hero-padding)',    /* 96px top */
          paddingBottom: 'var(--spacing-hero-padding)' /* 96px bottom - equal to top */
        }}
      >
        <div className="container-wide text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">Klantbeoordelingen</h1>
          <p className="text-lg sm:text-xl opacity-90 mb-4">
            Wat onze klanten over ons zeggen
          </p>
              <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
              ))}
            </div>
            {!loading && reviewsData?.rating && (
              <span className="text-2xl sm:text-3xl font-bold">{reviewsData.rating.toFixed(1)}</span>
            )}
          </div>
          {!loading && reviewsData?.totalReviews && (
            <p className="text-lg opacity-80">
              Gebaseerd op {reviewsData.totalReviews} Google beoordelingen
            </p>
          )}
        </div>
      </section>

      {/* Combined Reviews Section */}
      <section
        style={{
          backgroundColor: '#d4c9bf4d',
          paddingTop: 'var(--spacing-section-xl)',      /* 64px top - larger section padding */
          paddingBottom: 'var(--spacing-section-xl)'   /* 64px bottom - matches top */
        }}
      >
        {/* Infinite Review Carousel - Full Width */}
        <InfiniteReviewCarousel />

        <div className="container-wide">
          {/* CTA Section */}
          <div
            className="text-center max-w-4xl mx-auto px-4 sm:px-0"
            style={{ marginTop: 'var(--spacing-section-lg)' }} /* 48px - larger section spacing */
          >
            <h2
              className="text-3xl font-bold"
              style={{
                color: 'var(--color-secondary)',
                marginBottom: 'var(--spacing-content-paragraph)' /* 24px - after paragraph */
              }}
            >
              Ook een ervaring delen?
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{
                color: 'var(--color-secondary)', /* Correct color variable */
                marginBottom: 'var(--spacing-content-paragraph)' /* 24px - after paragraph */
              }}
            >
              Wij stellen uw feedback zeer op prijs. Laat een review achter op Google
              en help anderen bij het maken van de juiste keuze.
            </p>
            <div
              className="flex flex-col sm:flex-row justify-center items-center"
              style={{ gap: 'var(--spacing-button-gap)' }} /* 16px - button gap */
            >
              <Button onClick={() => setIsReviewPopupOpen(true)}>
                Review achterlaten
              </Button>
              <Button
                variant="secondary"
                asChild
                className="group"
              >
                <a
                  href="https://www.google.com/search?sa=X&sca_esv=3f626f5782a50780&hl=nl&authuser=0&tbm=lcl&sxsrf=AE3TifMdUhU3Vh9hgJGPllQKh7hSdFKIvw:1762799438903&q=Autoservice+van+der+Waals+%26+WK+Auto+Selectie+Reviews&rflfq=1&num=20&stick=H4sIAAAAAAAAAONgkxIxNDQzNzM0sbA0NLMwMzQyMjSwtNjAyPiK0cSxtCS_OLWoLDM5VaEsMU8hJbVIITwxMadYQU0h3FsBJK0QnJqTmlySmaoQlFqWmVpevIiVLG0ApNFuAIkAAAA&rldimm=11676148916861221098&ved=2ahUKEwjqyfbSm-iQAxUF-QIHHXQQHSoQ9fQKegQIUxAF&biw=1430&bih=771&dpr=2#lkt=LocalPoiReviews"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Bekijk alle reviews op Google
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Review Popup */}
      <ReviewPopup
        isOpen={isReviewPopupOpen}
        onClose={() => setIsReviewPopupOpen(false)}
      />
    </div>
  );
};

export default Reviews;
