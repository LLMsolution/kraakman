import { useState, useEffect } from "react";
import { Star, X, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui";

interface ReviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReviewPopup = ({ isOpen, onClose }: ReviewPopupProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Reset state when popup closes
  useEffect(() => {
    if (!isOpen) {
      setRating(null);
      setHoveredStar(null);
      setReview("");
      setSubmitted(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handleStarClick = (starRating: number) => {
    if (starRating === 5) {
      // Directly open Google review for 5 stars
      window.open("https://g.page/r/Ceo4E7aTAwqiEBM/review", "_blank");
      // Close popup after opening
      setTimeout(() => {
        setRating(null);
        setReview("");
        onClose();
      }, 500);
    } else {
      setRating(starRating);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating || (!review && rating < 5)) {
      return;
    }

    setLoading(true);

    // If 5 stars, open Google review
    if (rating === 5) {
      window.open("https://g.page/r/Ceo4E7aTAwqiEBM/review", "_blank");
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setRating(null);
        setReview("");
        onClose();
      }, 3000);
    } else {
      // Send email for 1-4 stars
      const emailContent = `
Aantal sterren: ${rating}
Feedback: ${review}
      `;

      // Simulate email sending (in real app, send to backend)
      setTimeout(() => {
        setSubmitted(true);
        setLoading(false);
        setTimeout(() => {
          setSubmitted(false);
          setRating(null);
          setReview("");
          onClose();
        }, 3000);
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className="bg-card rounded-lg shadow-card max-w-md w-full relative border border-border"
        style={{
          padding: 'var(--spacing-modal-padding)' /* 32px - modal padding */
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute bg-transparent hover:bg-muted transition-all duration-300 border-none outline-none"
          aria-label="Sluiten"
          style={{
            borderRadius: '50%',
            padding: '0',
            margin: '0',
            top: 'var(--spacing-modal-close-offset)', /* 16px - close button offset */
            right: 'var(--spacing-modal-close-offset)'
          }}
        >
          <X className="w-5 h-5" />
        </Button>

        {!submitted ? (
          <>
            <div
              className="text-center"
              style={{ marginBottom: 'var(--spacing-modal-gap)' }} /* 24px - modal gap */
            >
              <svg
                className="w-10 h-10 mx-auto"
                viewBox="0 0 24 24"
                style={{ marginBottom: 'var(--spacing-component-sm)' }} /* 12px - component small */
              >
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <h2
                className="text-3xl font-semibold tracking-tight text-foreground"
                style={{ marginBottom: 'var(--spacing-component-sm)' }} /* 12px - component small */
              >
                Deel je ervaring
              </h2>
              <p className="text-muted-foreground text-lg">Hoe beoordeel je onze service?</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div
                className="text-center"
                style={{ marginBottom: 'var(--spacing-form-gap)' }} /* 24px - form gap */
              >
                <div
                  className="flex justify-center"
                  style={{ gap: 'var(--spacing-star-gap)' }} /* 4px - star gap */
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="relative">
                      <Star
                        className={`w-10 h-10 transition-colors duration-200 cursor-pointer stroke-primary stroke-2 ${
                          (hoveredStar !== null && star <= hoveredStar) ||
                          (rating !== null && star <= rating)
                            ? "fill-primary text-primary"
                            : "fill-transparent text-muted-foreground"
                        }`}
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(null)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Show form fields only after rating is selected */}
              {rating && rating < 5 && (
                <>
                  <div className="text-center mb-4">
                    <p className="text-muted-foreground mb-4">
                      Bedankt voor je feedback. We willen graag van je leren hoe we kunnen verbeteren.
                    </p>
                  </div>
                  <div className="mb-4">
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-input rounded-md bg-background resize-none outline-none"
                      placeholder="Wat kunnen we beter doen?"
                      required
                      style={{
                        boxShadow: 'none',
                        border: '1px solid hsl(var(--border))'
                      }}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? "Verzenden..." : "Verstuur review"}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-10 h-10 text-primary fill-current" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-foreground mb-3">
              Bedankt voor je feedback!
            </h3>
            <p className="text-muted-foreground text-lg">
              We waarderen je input en gebruiken het om onze service te verbeteren.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPopup;