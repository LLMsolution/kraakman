// Shared car filtering and sorting utilities
// Used by useCarListPage hook and any component that needs to filter/sort cars

import type { Car } from "@/types";

export interface CarListFilters {
  search: string;
  merk: string;
  minPrijs: number;
  maxPrijs: number;
  minBouwjaar: number;
  maxBouwjaar: number;
  brandstofType: string;
  transmissie: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface DynamicFilterOptions {
  merken: string[];
  minPrijs: number;
  maxPrijs: number;
  minBouwjaar: number;
  maxBouwjaar: number;
  brandstofTypes: string[];
  transmissieTypes: string[];
}

/**
 * Derive dynamic filter options from a list of cars.
 * Computes unique brands, fuel types, transmission types, and min/max ranges.
 */
export function deriveFilterOptions(cars: Car[]): DynamicFilterOptions {
  if (cars.length === 0) {
    return {
      merken: [],
      minPrijs: 0,
      maxPrijs: 0,
      minBouwjaar: 0,
      maxBouwjaar: 0,
      brandstofTypes: [],
      transmissieTypes: [],
    };
  }

  const merken = Array.from(new Set(cars.map(car => car.merk))).sort();
  const prijzen = cars.map(car => car.prijs);
  const bouwjaren = cars.map(car => car.bouwjaar);
  const brandstofTypes = Array.from(
    new Set(cars.map(car => car.brandstof_type).filter(Boolean))
  ).sort() as string[];
  const transmissieTypes = Array.from(
    new Set(cars.map(car => car.transmissie).filter(Boolean))
  ).sort() as string[];

  return {
    merken,
    minPrijs: Math.min(...prijzen),
    maxPrijs: Math.max(...prijzen),
    minBouwjaar: Math.min(...bouwjaren),
    maxBouwjaar: Math.max(...bouwjaren),
    brandstofTypes,
    transmissieTypes,
  };
}

/**
 * Filter and sort a list of cars based on the provided filters.
 * Returns a new array (does not mutate the input).
 */
export function filterAndSortCars(cars: Car[], filters: CarListFilters): Car[] {
  let filtered = [...cars];

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (car) =>
        car.merk.toLowerCase().includes(searchLower) ||
        car.model.toLowerCase().includes(searchLower) ||
        car.voertuig_type?.toLowerCase().includes(searchLower)
    );
  }

  // Merk filter
  if (filters.merk) {
    filtered = filtered.filter((car) => car.merk === filters.merk);
  }

  // Prijs filter
  filtered = filtered.filter(
    (car) => car.prijs >= filters.minPrijs && car.prijs <= filters.maxPrijs
  );

  // Bouwjaar filter
  filtered = filtered.filter(
    (car) =>
      car.bouwjaar >= filters.minBouwjaar &&
      car.bouwjaar <= filters.maxBouwjaar
  );

  // Brandstof filter
  if (filters.brandstofType) {
    filtered = filtered.filter((car) => car.brandstof_type === filters.brandstofType);
  }

  // Transmissie filter
  if (filters.transmissie) {
    filtered = filtered.filter((car) => car.transmissie === filters.transmissie);
  }

  // Sorting
  filtered.sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (filters.sortBy) {
      case 'prijs':
        aValue = a.prijs;
        bValue = b.prijs;
        break;
      case 'bouwjaar':
        aValue = a.bouwjaar;
        bValue = b.bouwjaar;
        break;
      case 'kilometerstand':
        aValue = a.kilometerstand || 0;
        bValue = b.kilometerstand || 0;
        break;
      case 'created_at':
      default:
        aValue = new Date(a.created_at || 0).getTime();
        bValue = new Date(b.created_at || 0).getTime();
        break;
    }

    if (filters.sortOrder === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  return filtered;
}
