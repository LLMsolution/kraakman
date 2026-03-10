import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Car, CarImage } from "@/types";
import { thumbnailUrl } from "@/utils/imageUrl";

interface CarCardProps {
  id: string;
  merk: string;
  model: string;
  voertuig_type?: string;
  bouwjaar: number;
  kilometerstand?: number;
  prijs: number;
  car_images?: CarImage[];
  opties?: string[];
  brandstof_type?: string;
  transmissie?: string;
  binnenkort_beschikbaar?: boolean;
  gereserveerd?: boolean;
  status?: "aanbod" | "verkocht";
  hideButton?: boolean;
}

const CarCard = ({
  id,
  merk,
  model,
  voertuig_type,
  bouwjaar,
  kilometerstand,
  prijs,
  car_images,
  opties,
  brandstof_type,
  transmissie,
  binnenkort_beschikbaar,
  gereserveerd,
  status,
  hideButton = false
}: CarCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const allImages = car_images ?? [];
  const displayImages = allImages.slice(0, 5);
  const hasMoreImages = allImages.length > 5;
  const hasImages = displayImages.length > 0;
  const touchStartX = useRef<number | null>(null);
  const isTouching = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
    }
  };

  // Touch event handlers for swipe functionality
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    isTouching.current = true;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartX.current || !isTouching.current) return;
    const touch = e.touches[0];
    const diff = touch.clientX - touchStartX.current;
    const imageContainer = containerRef.current;

    if (!imageContainer) return;

    const containerWidth = imageContainer.offsetWidth;
    const swipeThreshold = containerWidth * 0.2; // 20% of container width

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
      } else {
        setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
      }
      touchStartX.current = touch.clientX;
    }
  }, [car_images?.length]);

  const handleTouchEnd = useCallback(() => {
    isTouching.current = false;
    touchStartX.current = null;
  }, []);

  // Add touch event listeners
  useEffect(() => {
    const imageContainer = containerRef.current;
    if (!imageContainer) return;

    imageContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    imageContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
    imageContainer.addEventListener('touchend', handleTouchEnd);

    return () => {
      imageContainer.removeEventListener('touchstart', handleTouchStart);
      imageContainer.removeEventListener('touchmove', handleTouchMove);
      imageContainer.removeEventListener('touchend', handleTouchEnd);
    };
  }, [car_images?.length, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const saveScrollAndNavigate = () => {
    sessionStorage.setItem(`scrollY_${window.location.pathname}`, String(window.scrollY));
  };

  const cardContent = (
    <>
      {/* Image Carousel */}
      <div
        ref={containerRef}
        className={`aspect-[4/3] overflow-hidden bg-muted relative group/image-carousel ${!hideButton ? 'cursor-pointer' : ''}`}
        style={{ touchAction: 'pan-y' }}
      >
        {hasImages ? (
          <>
            <div className="relative w-full h-full overflow-hidden">
              {displayImages.map((image, idx) => {
                // Only render current image and its direct neighbors
                const isVisible = idx === currentImageIndex;
                const isAdjacent = Math.abs(idx - currentImageIndex) === 1
                  || (currentImageIndex === 0 && idx === displayImages.length - 1)
                  || (currentImageIndex === displayImages.length - 1 && idx === 0);
                if (!isVisible && !isAdjacent) return null;
                return (
                  <img
                    key={idx}
                    src={thumbnailUrl(image.url)}
                    alt={`${merk} ${model}`}
                    loading={idx === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className={`absolute w-full h-full object-cover transition-transform duration-500 ease-in-out ${
                      idx === currentImageIndex
                        ? 'translate-x-0'
                        : idx < currentImageIndex
                          ? '-translate-x-full'
                          : 'translate-x-full'
                    }`}
                  />
                );
              })}
            </div>

            {binnenkort_beschikbaar && (
              <div
                className="absolute top-0 right-0 px-3 py-1.5 font-medium"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-background)',
                  borderRadius: '0 0 0 4px',
                  fontSize: '14px'
                }}
              >
                Binnenkort beschikbaar
              </div>
            )}

            {gereserveerd && (
              <div
                className="absolute top-0 right-0 px-3 py-1.5 font-medium"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-background)',
                  borderRadius: '0 0 0 4px',
                  fontSize: '14px'
                }}
              >
                Gereserveerd
              </div>
            )}

            {displayImages.length > 1 && (
              <>
                <Button
                  variant="default"
                  size="icon"
                  className="carousel-nav-button absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full hidden lg:flex opacity-0 group-hover/card:opacity-100 transition-all duration-200 z-10"
                  onClick={handlePrevImage}
                  aria-label="Vorige foto"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  className="carousel-nav-button absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full hidden lg:flex opacity-0 group-hover/card:opacity-100 transition-all duration-200 z-10"
                  onClick={handleNextImage}
                  aria-label="Volgende foto"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 items-center">
                  {displayImages.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentImageIndex
                          ? 'w-6 bg-primary'
                          : 'w-1.5 bg-background/60'
                      }`}
                    />
                  ))}
                  {hasMoreImages && (
                    <span className="text-xs text-background/80 ml-1 font-medium">
                      +{allImages.length - 5} foto's
                    </span>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Geen afbeelding
            </div>
            {binnenkort_beschikbaar && (
              <div
                className="absolute top-0 right-0 px-3 py-1.5 font-medium"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-background)',
                  borderRadius: '0 0 0 4px',
                  fontSize: '14px'
                }}
              >
                Binnenkort beschikbaar
              </div>
            )}
            {gereserveerd && (
              <div
                className="absolute top-0 right-0 px-3 py-1.5 font-medium"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-background)',
                  borderRadius: '0 0 0 4px',
                  fontSize: '14px'
                }}
              >
                Gereserveerd
              </div>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Different layout for verkocht status */}
        {status === 'verkocht' ? (
          <>
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold mb-1">
                {merk} {model}
              </h3>
              {voertuig_type && (
                <p className="text-sm text-muted-foreground">
                  {voertuig_type}
                </p>
              )}
            </div>

            <div className="hidden sm:flex items-center justify-between text-xs text-muted-foreground/70">
              {[
                brandstof_type,
                transmissie,
                bouwjaar,
                kilometerstand ? `${kilometerstand.toLocaleString('nl-NL')} km` : null,
              ].filter(Boolean).map((spec, i, arr) => (
                <span key={i} className="contents">
                  {i > 0 && <span className="w-px h-3 bg-primary shrink-0" />}
                  <span>{spec}</span>
                </span>
              ))}
            </div>
            <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground/70 sm:hidden">
              {[
                brandstof_type,
                transmissie,
                bouwjaar,
                kilometerstand ? `${kilometerstand.toLocaleString('nl-NL')} km` : null,
              ].filter(Boolean).map((spec, i) => (
                <span key={i}>{spec}</span>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-semibold mb-1 min-w-0">
                  {merk} {model}
                </h3>
                <p className="text-lg font-medium text-muted-foreground whitespace-nowrap shrink-0">
                  € {prijs.toLocaleString('nl-NL')}
                </p>
              </div>
              {voertuig_type && (
                <p className="text-sm text-muted-foreground">
                  {voertuig_type}
                </p>
              )}
            </div>

            <div className="hidden sm:flex items-center justify-between text-xs text-muted-foreground/70 mb-4">
              {[
                brandstof_type,
                transmissie,
                bouwjaar,
                kilometerstand ? `${kilometerstand.toLocaleString('nl-NL')} km` : null,
              ].filter(Boolean).map((spec, i, arr) => (
                <span key={i} className="contents">
                  {i > 0 && <span className="w-px h-3 bg-primary shrink-0" />}
                  <span>{spec}</span>
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground/70 mb-4 sm:hidden">
              {[
                brandstof_type,
                transmissie,
                bouwjaar,
                kilometerstand ? `${kilometerstand.toLocaleString('nl-NL')} km` : null,
              ].filter(Boolean).map((spec, i) => (
                <span key={i}>{spec}</span>
              ))}
            </div>
          </>
        )}

        {!hideButton && (
          <div className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-normal border transition-colors duration-300 h-10 px-4 py-2 bg-primary text-primary-foreground border-primary lg:bg-background lg:text-muted-foreground lg:border-border/30 group-hover/card:bg-primary group-hover/card:text-primary-foreground group-hover/card:border-primary" style={{ borderRadius: 'var(--radius-button)' }}>
            Bekijk
            <ArrowRight className="h-4 w-4 lg:group-hover/card:translate-x-1 transition-transform duration-300" />
          </div>
        )}
      </div>
    </>
  );

  if (!hideButton) {
    return (
      <Link
        to={`/auto/${id}`}
        onClick={saveScrollAndNavigate}
        className="group/card bg-card overflow-hidden shadow-sm transition-all duration-300 block"
        style={{ borderRadius: 'var(--radius-card)' }}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className="group/card bg-card overflow-hidden shadow-sm transition-all duration-300" style={{ borderRadius: 'var(--radius-card)' }}>
      {cardContent}
    </div>
  );
};

export default CarCard;
