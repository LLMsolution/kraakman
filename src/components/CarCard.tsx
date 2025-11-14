import { Link } from "react-router-dom";
import { Button } from "@/components/ui";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Car, CarImage } from "@/types";

interface CarCardProps {
  id: string;
  merk: string;
  model: string;
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
  const [hasImages] = useState(car_images && car_images.length > 0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isTouching, setIsTouching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev === 0 ? car_images!.length - 1 : prev - 1));
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev === car_images!.length - 1 ? 0 : prev + 1));
    }
  };

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setIsTouching(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX || !isTouching) return;
    const touch = e.touches[0];
    const diff = touch.clientX - touchStartX;
    const imageContainer = containerRef.current;

    if (!imageContainer) return;

    const containerWidth = imageContainer.offsetWidth;
    const swipeThreshold = containerWidth * 0.2; // 20% of container width

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - show next image
        handleNextImage(e as any);
      } else {
        // Swipe right - show previous image
        handlePrevImage(e as any);
      }
      setTouchStartX(touch.clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
    setTouchStartX(null);
  };

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
  }, [hasImages, car_images, currentImageIndex, touchStartX, isTouching]);

  return (
    <div className="bg-card border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image Carousel */}
      <div
        ref={containerRef}
        className="aspect-[4/3] overflow-hidden bg-muted relative group/image-carousel cursor-pointer"
        style={{ touchAction: 'pan-y' }}
      >
        {hasImages ? (
          <>
            <div className="relative w-full h-full">
              {car_images?.map((image, idx) => (
                <img
                  key={idx}
                  src={image.url}
                  alt={`${merk} ${model}`}
                  className={`absolute w-full h-full object-cover transition-transform duration-500 ease-in-out ${
                    idx === currentImageIndex
                      ? 'translate-x-0'
                      : idx < currentImageIndex
                        ? '-translate-x-full'
                        : 'translate-x-full'
                  }`}
                  style={{
                    objectPosition: 'center',
                    objectFit: 'cover'
                  }}
                />
              ))}
            </div>

            {/* Binnenkort Beschikbaar Banner - Overlay on Image */}
            {binnenkort_beschikbaar && (
              <div
                className="absolute top-0 right-0 px-3 py-1.5 font-medium"
                style={{
                  backgroundColor: '#123458',
                  color: '#F1EFEC',
                  borderRadius: '0 0 0 4px',
                  fontSize: '14px'
                }}
              >
                Binnenkort beschikbaar
              </div>
            )}

            {/* Gereserveerd Banner - Overlay on Image */}
            {gereserveerd && (
              <div
                className="absolute top-0 right-0 px-3 py-1.5 font-medium"
                style={{
                  backgroundColor: '#123458',
                  color: '#F1EFEC',
                  borderRadius: '0 0 0 4px',
                  fontSize: '14px'
                }}
              >
                Gereserveerd
              </div>
            )}

            {car_images && car_images.length > 1 && (
              <>
                <div
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full opacity-0 group-hover/image-carousel:opacity-100 transition-all duration-200 z-10 flex items-center justify-center"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    padding: '0',
                    margin: '0',
                    cursor: 'pointer',
                    backgroundColor: '#F1EFEC',
                    border: '1px solid #030303'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#123458';
                    e.currentTarget.style.border = '1px solid #123458';
                    e.currentTarget.querySelector('svg').style.color = '#F1EFEC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F1EFEC';
                    e.currentTarget.style.border = '1px solid #030303';
                    e.currentTarget.querySelector('svg').style.color = '#030303';
                  }}
                  onClick={handlePrevImage}
                  role="button"
                  aria-label="Vorige foto"
                  tabIndex={0}
                >
                  <ChevronLeft className="h-5 w-5" style={{ color: '#030303', transition: 'color 0.2s ease' }} />
                </div>
                <div
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full opacity-0 group-hover/image-carousel:opacity-100 transition-all duration-200 z-10 flex items-center justify-center"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    padding: '0',
                    margin: '0',
                    cursor: 'pointer',
                    backgroundColor: '#F1EFEC',
                    border: '1px solid #030303'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#123458';
                    e.currentTarget.style.border = '1px solid #123458';
                    e.currentTarget.querySelector('svg').style.color = '#F1EFEC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F1EFEC';
                    e.currentTarget.style.border = '1px solid #030303';
                    e.currentTarget.querySelector('svg').style.color = '#030303';
                  }}
                  onClick={handleNextImage}
                  role="button"
                  aria-label="Volgende foto"
                  tabIndex={0}
                >
                  <ChevronRight className="h-5 w-5" style={{ color: '#030303', transition: 'color 0.2s ease' }} />
                </div>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {car_images?.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentImageIndex
                          ? 'w-6 bg-primary'
                          : 'w-1.5 bg-background/60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Geen afbeelding
            </div>
            {/* Binnenkort Beschikbaar Banner - Even without image */}
            {binnenkort_beschikbaar && (
              <div
                className="absolute top-0 right-0 px-3 py-1.5 font-medium"
                style={{
                  backgroundColor: '#123458',
                  color: '#F1EFEC',
                  borderRadius: '0 0 0 4px',
                  fontSize: '14px'
                }}
              >
                Binnenkort beschikbaar
              </div>
            )}
            {/* Gereserveerd Banner - Even without image */}
            {gereserveerd && (
              <div
                className="absolute top-0 right-0 px-3 py-1.5 font-medium"
                style={{
                  backgroundColor: '#123458',
                  color: '#F1EFEC',
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
            </div>

            {(brandstof_type || transmissie || bouwjaar || kilometerstand) && (
              <div className="flex justify-between items-center px-6 -mx-6">
                {brandstof_type && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {brandstof_type}
                  </div>
                )}
                {transmissie && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {transmissie}
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  {bouwjaar}
                </div>
                {kilometerstand && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {kilometerstand.toLocaleString('nl-NL')} km
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">
                  {merk} {model}
                </h3>
              </div>
              <p className="text-xl font-semibold">
                € {prijs.toLocaleString('nl-NL')}
              </p>
            </div>

            {(brandstof_type || transmissie || bouwjaar || kilometerstand) && (
              <div className="flex justify-between items-center px-6 -mx-6 mb-4">
                {brandstof_type && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {brandstof_type}
                  </div>
                )}
                {transmissie && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {transmissie}
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  {bouwjaar}
                </div>
                {kilometerstand && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {kilometerstand.toLocaleString('nl-NL')} km
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!hideButton && (
          <Button asChild className="w-full">
            <Link to={`/auto/${id}`} className="group">
              Bekijk
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default CarCard;
