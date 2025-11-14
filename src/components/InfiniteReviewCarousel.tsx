import { Star, ExternalLink } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useCachedReviews } from "@/hooks/useCachedReviews";

const InfiniteReviewCarousel = () => {
  const { reviewsData } = useCachedReviews();
  const scrollRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselHeight, setCarouselHeight] = useState(0);

  // Create an array with multiple copies for seamless infinite scroll
  const allReviews = reviewsData?.reviews || [];
  const duplicatedReviews = allReviews.length > 0 ? [...allReviews, ...allReviews] : [];

  // Update carousel height dynamically
  useEffect(() => {
    if (carouselRef.current && duplicatedReviews.length > 0) {
      const updateHeight = () => {
        const firstCard = carouselRef.current?.querySelector('[data-review-card]');
        if (firstCard) {
          const rect = firstCard.getBoundingClientRect();
          setCarouselHeight(rect.height);
        }
      };

      updateHeight();

      // Update on resize
      const resizeObserver = new ResizeObserver(updateHeight);
      const firstCard = carouselRef.current?.querySelector('[data-review-card]');
      if (firstCard) {
        resizeObserver.observe(firstCard);
      }

      return () => resizeObserver.disconnect();
    }
  }, [duplicatedReviews]);

  // Auto-scroll effect with proper cleanup
  useEffect(() => {
    if (duplicatedReviews.length === 0 || !scrollRef.current) return;

    const scrollContainer = scrollRef.current;
    let scrollPosition = 0;
    let animationFrameId: number;

    const scroll = () => {
      if (!scrollContainer) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        return;
      }

      scrollPosition += 0.5; // Slower scroll speed

      // Reset when we've scrolled through half the content (to create seamless loop)
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }

      scrollContainer.scrollLeft = scrollPosition;
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [duplicatedReviews.length]);

  // Return null if no reviews (after all hooks are called)
  if (!reviewsData?.reviews || reviewsData.reviews.length === 0) {
    return null;
  }

  return (
    <div
      ref={carouselRef}
      className="w-full relative overflow-hidden"
      style={{
        paddingTop: '0', /* No top padding - section handles it */
        paddingBottom: '32px' /* 32px bottom - space to CTA container */
      }}
    >

      
        {/* Scrolling container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide cursor-default"
        style={{
          scrollBehavior: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div
          className="flex items-stretch"
          style={{
            gap: '24px', // 24px between reviews
            width: `${duplicatedReviews.length * 344}px`, // Each card 320px + 24px gap
            paddingLeft: '0',
            paddingRight: '0',
          }}
        >
          {duplicatedReviews.map((review, index) => (
            <div
              key={`${review.author_name}-${index}`}
              data-review-card
              className="flex-shrink-0 border border-[#030303] p-6 transition-all duration-300 cursor-pointer flex flex-col bg-[#F1EFEC]"
              style={{
                width: '320px' // Responsive width for mobile
              }}
              onClick={() => window.open(review.google_review_url, '_blank')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 pr-3">
                  <h3 className="font-semibold text-base text-foreground truncate">
                    {review.author_name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {review.relative_time_description}
                  </p>
                </div>
                <div className="flex flex-shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'fill-current'
                          : 'fill-current opacity-30'
                      }`}
                      style={{ color: 'var(--color-star-filled)' }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex-1 mb-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {review.text}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#030303] border-opacity-20">
                <div className="flex items-center gap-1 text-xs text-[#123458]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="ml-1 font-medium">Google</span>
                </div>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfiniteReviewCarousel;