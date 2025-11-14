// Car Service - Centralized data access layer for vehicle operations
// Handles all Supabase database operations for cars and related data

import { supabase } from '@/integrations/supabase/client';
import { Car, CarFormData, CarFilters } from '@/types';
import { logger } from '@/utils/logger';

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
          car_images (url)
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
      return { data, error: null };

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
          car_images (url)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        logger.apiError('GET', `/cars?status=${status}`, error);
        return { data: null, error: new Error(error.message) };
      }

      logger.info(`Fetched ${data?.length || 0} cars with status: ${status}`);
      return { data, error: null };

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
          car_images (url)
        `)
        .eq('id', id)
        .single();

      if (error) {
        logger.apiError('GET', `/cars/${id}`, error);
        return { data: null, error: new Error(error.message) };
      }

      logger.info(`Fetched car: ${data?.merk} ${data?.model}`);
      return { data, error: null };

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
   * Get filter options for dropdowns
   */
  async getFilterOptions(): Promise<{
    data: { merken: string[]; transmissies: string[]; brandstoffen: string[]; voertuig_types: string[] } | null;
    error: Error | null
  }> {
    try {
      logger.apiCall('GET', '/cars/filter-options');

      // Get distinct values for each filter
      const [merkResult, transmissieResult, brandstofResult, voertuigTypeResult] = await Promise.all([
        supabase.from('cars').select('merk').not('merk', 'is', null),
        supabase.from('cars').select('transmissie').not('transmissie', 'is', null),
        supabase.from('cars').select('brandstof_type').not('brandstof_type', 'is', null),
        supabase.from('cars').select('voertuig_type').not('voertuig_type', 'is', null)
      ]);

      if (merkResult.error || transmissieResult.error || brandstofResult.error || voertuigTypeResult.error) {
        const errors = [
          merkResult.error?.message,
          transmissieResult.error?.message,
          brandstofResult.error?.message,
          voertuigTypeResult.error?.message
        ].filter(Boolean);

        logger.apiError('GET', '/cars/filter-options', new Error(errors.join(', ')));
        return { data: null, error: new Error('Failed to fetch filter options') };
      }

      const data = {
        merken: [...new Set(merkResult.data?.map(item => item.merk))].sort(),
        transmissies: [...new Set(transmissieResult.data?.map(item => item.transmissie).filter(Boolean))].sort(),
        brandstoffen: [...new Set(brandstofResult.data?.map(item => item.brandstof_type).filter(Boolean))].sort(),
        voertuig_types: [...new Set(voertuigTypeResult.data?.map(item => item.voertuig_type).filter(Boolean))].sort()
      };

      logger.info('Fetched filter options');
      return { data, error: null };

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error fetching filter options');
      logger.apiError('GET', '/cars/filter-options', error);
      return { data: null, error };
    }
  }

  /**
   * Get similar cars based on make and model
   */
  async getSimilarCars(carId: string, merk: string, limit: number = 4): Promise<{ data: Car[] | null; error: Error | null }> {
    try {
      logger.apiCall('GET', `/cars/${carId}/similar`, { merk, limit });

      const { data, error } = await supabase
        .from('cars')
        .select(`
          *,
          car_images (url)
        `)
        .eq('merk', merk)
        .eq('status', 'aanbod')
        .neq('id', carId)
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) {
        logger.apiError('GET', `/cars/${carId}/similar`, error);
        return { data: null, error: new Error(error.message) };
      }

      logger.info(`Found ${data?.length || 0} similar cars for ${merk}`);
      return { data, error: null };

    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Unknown error fetching similar cars for ${carId}`);
      logger.apiError('GET', `/cars/${carId}/similar`, error);
      return { data: null, error };
    }
  }
}

// Export singleton instance
export const carService = new CarService();