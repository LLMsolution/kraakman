// Custom hook for CarDetail component data fetching and state management
// Uses TanStack Query for automatic caching, deduplication, and refetching

import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { carService } from "@/services/carService";
import { logger } from "@/utils/logger";

export const useCarDetail = () => {
  const { id } = useParams<{ id: string }>();

  const carQuery = useQuery({
    queryKey: ["car", id],
    queryFn: async () => {
      logger.userAction("view_car_detail", { carId: id });
      const { data, error } = await carService.getCarById(id!);
      if (error) throw error;
      if (!data) throw new Error("Car not found");
      return data;
    },
    enabled: !!id,
  });

  const similarQuery = useQuery({
    queryKey: ["similar-cars", carQuery.data?.merk, id],
    queryFn: async () => {
      const { data, error } = await carService.getSimilarCars(
        id!,
        carQuery.data!.merk,
        4
      );
      if (error) {
        logger.warn("Failed to fetch similar cars", {
          carId: id,
          merk: carQuery.data?.merk,
          error: error.message,
        });
        throw error;
      }
      return data;
    },
    enabled: !!carQuery.data?.merk,
  });

  return {
    car: carQuery.data ?? null,
    similarCars: similarQuery.data ?? null,
    loading: carQuery.isLoading,
    error: carQuery.error?.message ?? null,
  };
};
