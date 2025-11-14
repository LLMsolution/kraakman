// Custom hook for CarDetail component data fetching and state management
// Encapsulates all car-related data operations for the detail page

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Car } from '@/types';
import { carService } from '@/services/carService';
import { logger } from '@/utils/logger';

interface UseCarDetailReturn {
  car: Car | null;
  similarCars: Car[] | null;
  loading: boolean;
  error: string | null;
  refreshData: () => void;
}

export const useCarDetail = (): UseCarDetailReturn => {
  const { id } = useParams<string>();
  const [car, setCar] = useState<Car | null>(null);
  const [similarCars, setSimilarCars] = useState<Car[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCarData = async () => {
    if (!id) {
      setError('No car ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      logger.userAction('view_car_detail', { carId: id });

      // Fetch car details
      const { data: carData, error: carError } = await carService.getCarById(id);

      if (carError) {
        setError(carError.message);
        logger.error('Failed to fetch car details', { carId: id, error: carError.message });
        return;
      }

      if (!carData) {
        setError('Car not found');
        logger.warn('Car not found', { carId: id });
        return;
      }

      setCar(carData);

      // Fetch similar cars
      if (carData.merk) {
        const { data: similarData, error: similarError } = await carService.getSimilarCars(
          id,
          carData.merk,
          4
        );

        if (similarError) {
          logger.warn('Failed to fetch similar cars', {
            carId: id,
            merk: carData.merk,
            error: similarError.message
          });
          // Don't set error for similar cars failure, just log it
        } else {
          setSimilarCars(similarData);
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      logger.error('Unexpected error in useCarDetail', { carId: id, error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarData();
  }, [id]);

  const refreshData = () => {
    logger.userAction('refresh_car_detail', { carId: id });
    fetchCarData();
  };

  return {
    car,
    similarCars,
    loading,
    error,
    refreshData
  };
};