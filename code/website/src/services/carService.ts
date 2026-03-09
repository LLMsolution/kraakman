// Car Service - Centralized data access layer for vehicle operations
// Handles all Supabase database operations for cars and related data

import { supabase } from '@/integrations/supabase/client';
import { Car, CarFormData, CarFilters } from '@/types';
import { logger } from '@/utils/logger';

function sortCarImages(cars: Car[]): Car[];
function sortCarImages(car: Car): Car;
function sortCarImages(input: Car | Car[]): Car | Car[] {
  const sortImages = (car: Car): Car => ({
    ...car,
    car_images: car.car_images?.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
  });
  return Array.isArray(input) ? input.map(sortImages) : sortImages(input);
}

export class CarService {
  /**
   * Fetch all cars with optional filtering
   */
  async getCars(filters?: CarFilters): Promise<{ data: Car[] | null; error: Error | null }> {
    try {
      logger.apiCall('GET', '/cars', { filters });

      let query = supabase
        .from('cars')
        .select(`
          *,
          car_images (url, display_order)
        `);

      // Apply filters if provided
      if (filters) {
        if (filters.search) {
          query = query.or(`merk.ilike.%${filters.search}%,model.ilike.%${filters.search}%,omschrijving.ilike.%${filters.search}%`);
        }

        if (filters.merk) {
          query = query.eq('merk', filters.merk);
        }

        if (filters.minPrijs) {
          query = query.gte('prijs', filters.minPrijs);
        }

        if (filters.maxPrijs) {
          query = query.lte('prijs', filters.maxPrijs);
        }

        if (filters.minBouwjaar) {
          query = query.gte('bouwjaar', filters.minBouwjaar);
        }

        if (filters.maxBouwjaar) {
          query = query.lte('bouwjaar', filters.maxBouwjaar);
        }

        if (filters.transmissie) {
          query = query.eq('transmissie', filters.transmissie);
        }

        if (filters.brandstof) {
          query = query.eq('brandstof_type', filters.brandstof);
        }

        if (filters.voertuig_type) {
          query = query.eq('voertuig_type', filters.voertuig_type);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        logger.apiError('GET', '/cars', error, { filters });
        return { data: null, error: new Error(error.message) };
      }

      logger.info(`Fetched ${data?.length || 0} cars`, { filters });
      return { data: data ? sortCarImages(data) : null, error: null };

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error fetching cars');
      logger.apiError('GET', '/cars', error);
      return { data: null, error };
    }
  }

  /**
   * Fetch cars by status (aanbod/verkocht)
   */
  async getCarsByStatus(status: 'aanbod' | 'verkocht'): Promise<{ data: Car[] | null; error: Error | null }> {
    try {
      logger.apiCall('GET', `/cars?status=${status}`);

      const { data, error } = await supabase
        .from('cars')
        .select(`
          *,
          car_images (url, display_order)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        logger.apiError('GET', `/cars?status=${status}`, error);
        return { data: null, error: new Error(error.message) };
      }

      logger.info(`Fetched ${data?.length || 0} cars with status: ${status}`);
      return { data: data ? sortCarImages(data) : null, error: null };

    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Unknown error fetching ${status} cars`);
      logger.apiError('GET', `/cars?status=${status}`, error);
      return { data: null, error };
    }
  }

  /**
   * Fetch a single car by ID with images
   */
  async getCarById(id: string): Promise<{ data: Car | null; error: Error | null }> {
    try {
      logger.apiCall('GET', `/cars/${id}`);

      const { data, error } = await supabase
        .from('cars')
        .select(`
          *,
          car_images (url, display_order)
        `)
        .eq('id', id)
        .single();

      if (error) {
        logger.apiError('GET', `/cars/${id}`, error);
        return { data: null, error: new Error(error.message) };
      }

      logger.info(`Fetched car: ${data?.merk} ${data?.model}`);
      return { data: data ? sortCarImages(data) : null, error: null };

    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Unknown error fetching car ${id}`);
      logger.apiError('GET', `/cars/${id}`, error);
      return { data: null, error };
    }
  }

  /**
   * Create a new car
   */
  async createCar(carData: CarFormData): Promise<{ data: Car | null; error: Error | null }> {
    try {
      logger.apiCall('POST', '/cars', { carData });

      const { data, error } = await supabase
        .from('cars')
        .insert(carData)
        .select()
        .single();

      if (error) {
        logger.apiError('POST', '/cars', error, { carData });
        return { data: null, error: new Error(error.message) };
      }

      logger.info(`Created car: ${data?.merk} ${data?.model}`);
      return { data, error: null };

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error creating car');
      logger.apiError('POST', '/cars', error, { carData });
      return { data: null, error };
    }
  }

  /**
   * Update an existing car
   */
  async updateCar(id: string, carData: Partial<CarFormData>): Promise<{ data: Car | null; error: Error | null }> {
    try {
      logger.apiCall('PUT', `/cars/${id}`, { carData });

      const { data, error } = await supabase
        .from('cars')
        .update(carData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.apiError('PUT', `/cars/${id}`, error, { carData });
        return { data: null, error: new Error(error.message) };
      }

      logger.info(`Updated car: ${data?.merk} ${data?.model}`);
      return { data, error: null };

    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Unknown error updating car ${id}`);
      logger.apiError('PUT', `/cars/${id}`, error, { carData });
      return { data: null, error };
    }
  }

  /**
   * Delete a car
   */
  async deleteCar(id: string): Promise<{ error: Error | null }> {
    try {
      logger.apiCall('DELETE', `/cars/${id}`);

      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', id);

      if (error) {
        logger.apiError('DELETE', `/cars/${id}`, error);
        return { error: new Error(error.message) };
      }

      logger.info(`Deleted car with ID: ${id}`);
      return { error: null };

    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Unknown error deleting car ${id}`);
      logger.apiError('DELETE', `/cars/${id}`, error);
      return { error };
    }
  }

  /**
   * Get similar cars based on make, falling back to other aanbod cars if needed
   */
  async getSimilarCars(carId: string, merk: string, limit: number = 4): Promise<{ data: Car[] | null; error: Error | null }> {
    try {
      logger.apiCall('GET', `/cars/${carId}/similar`, { merk, limit });

      const { data: sameBrand, error: error1 } = await supabase
        .from('cars')
        .select(`
          *,
          car_images (url, display_order)
        `)
        .eq('merk', merk)
        .eq('status', 'aanbod')
        .neq('id', carId)
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error1) {
        logger.apiError('GET', `/cars/${carId}/similar`, error1);
        return { data: null, error: new Error(error1.message) };
      }

      let results = sameBrand || [];

      // Fill up with other aanbod cars if not enough of same brand
      if (results.length < limit) {
        const excludeIds = [carId, ...results.map(c => c.id)];
        const remaining = limit - results.length;

        const { data: otherCars, error: error2 } = await supabase
          .from('cars')
          .select(`
            *,
            car_images (url, display_order)
          `)
          .eq('status', 'aanbod')
          .not('id', 'in', `(${excludeIds.join(',')})`)
          .limit(remaining)
          .order('created_at', { ascending: false });

        if (error2) {
          logger.apiError('GET', `/cars/${carId}/similar (fallback)`, error2);
        }
        if (otherCars) {
          results = [...results, ...otherCars];
        }
      }

      logger.info(`Found ${results.length} similar cars for ${merk}`);
      return { data: sortCarImages(results), error: null };

    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Unknown error fetching similar cars for ${carId}`);
      logger.apiError('GET', `/cars/${carId}/similar`, error);
      return { data: null, error };
    }
  }
}

// Export singleton instance
export const carService = new CarService();