// Shared hook for car list pages (Aanbod and Verkocht)
// Uses TanStack Query for data fetching with local filtering/sorting state

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { carService } from "@/services/carService";
import { logger } from "@/utils/logger";
import {
  filterAndSortCars,
  deriveFilterOptions,
  type CarListFilters,
  type DynamicFilterOptions,
} from "@/utils/carFilters";
import type { Car } from "@/types";

interface UseCarListPageReturn {
  cars: Car[];
  filteredCars: Car[];
  loading: boolean;
  handleFilterChange: (filters: CarListFilters) => void;
  filterOptions: DynamicFilterOptions;
}

const emptyFilterOptions: DynamicFilterOptions = {
  merken: [],
  minPrijs: 0,
  maxPrijs: 0,
  minBouwjaar: 0,
  maxBouwjaar: 0,
  brandstofTypes: [],
  transmissieTypes: [],
};

export function useCarListPage(status: 'aanbod' | 'verkocht'): UseCarListPageReturn {
  const [filters, setFilters] = useState<CarListFilters | null>(null);

  const { data: cars = [], isLoading: loading } = useQuery({
    queryKey: ["cars", status],
    queryFn: async () => {
      logger.userAction(`view_${status}_page`);
      const { data, error } = await carService.getCarsByStatus(status);
      if (error) throw error;
      const carsData = data ?? [];
      logger.info(`Fetched ${carsData.length} ${status} cars`);
      return carsData;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for car inventory
  });

  const filterOptions = useMemo(() => {
    if (cars.length > 0) {
      return deriveFilterOptions(cars);
    }
    return emptyFilterOptions;
  }, [cars]);

  const filteredCars = useMemo(() => {
    if (filters) {
      return filterAndSortCars(cars, filters);
    }
    return cars;
  }, [cars, filters]);

  const handleFilterChange = (newFilters: CarListFilters) => {
    setFilters(newFilters);
  };

  return { cars, filteredCars, loading, handleFilterChange, filterOptions };
}
