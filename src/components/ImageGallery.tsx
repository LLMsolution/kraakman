// ImageGallery component - Handles car image display and navigation
// Extracted from CarDetail to improve component maintainability

import { useState } from 'react';
import { CarImage } from '@/types';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImageGalleryProps {
  images: CarImage[];
  carName: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, carName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="kraakman-image-container flex items-center justify-center bg-gray-200">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];

  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group">
        <div className="kraakman-image-container">
          <img
            src={currentImage.url}
            alt={`${carName} - Image ${currentImageIndex + 1}`}
            className="kraakman-image cursor-pointer"
            onClick={openFullscreen}
            loading="lazy"
          />
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity kraakman-carousel-button"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity kraakman-carousel-button"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto py-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden transition-all ${
                index === currentImageIndex
                  ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20'
                  : 'border-[var(--color-border-primary)] hover:border-[var(--color-primary)]'
              }`}
              aria-label={`Go to image ${index + 1}`}
            >
              <img
                src={image.url}
                alt={`${carName} - Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/90">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              aria-label="Close fullscreen"
            >
              <X className="h-6 w-6" />
            </button>

            <img
              src={currentImage.url}
              alt={`${carName} - Fullscreen Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Fullscreen Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};