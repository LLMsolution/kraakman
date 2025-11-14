// SimilarCars component - Displays similar vehicles based on make and model
// Extracted from CarDetail to improve component maintainability

import { Car } from '@/types';
import CarCard from './CarCard';

interface SimilarCarsProps {
  similarCars: Car[] | null;
  loading?: boolean;
}

export const SimilarCars: React.FC<SimilarCarsProps> = ({ similarCars, loading = false }) => {
  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-[var(--color-text-primary)]">
          Vergelijkbare Auto's
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!similarCars || similarCars.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-text-primary)]">
        Vergelijkbare Auto's
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {similarCars.map((car) => (
          <CarCard
            key={car.id}
            id={car.id}
            merk={car.merk}
            model={car.model}
            type={car.type}
            bouwjaar={car.bouwjaar}
            kilometerstand={car.kilometerstand}
            prijs={car.prijs}
            car_images={car.car_images}
            status={car.status}
          />
        ))}
      </div>
    </div>
  );
};