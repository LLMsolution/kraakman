import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import CarFilters from "@/components/CarFilters";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Car } from "@/types";
import { carService } from "@/services/carService";
import { logger } from "@/utils/logger";

const Aanbod = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    merken: [] as string[],
    minPrijs: 0,
    maxPrijs: 0,
    minBouwjaar: 0,
    maxBouwjaar: 0,
    brandstofTypes: [] as string[],
    transmissieTypes: [] as string[],
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      logger.userAction('view_aanbod_page');
      const { data, error } = await carService.getCarsByStatus('aanbod');

      if (error) throw error;

      const carsData = data || [];
      setCars(carsData);
      logger.info(`Fetched ${carsData.length} aanbod cars`);
      setFilteredCars(carsData);

      // Calculate dynamic filter options
      if (carsData.length > 0) {
        const merken = Array.from(new Set(carsData.map(car => car.merk))).sort();
        const prijzen = carsData.map(car => car.prijs);
        const bouwjaren = carsData.map(car => car.bouwjaar);
        const brandstofTypes = Array.from(new Set(
          carsData.map(car => car.brandstof_type).filter(Boolean)
        )).sort();
        const transmissieTypes = Array.from(new Set(
          carsData.map(car => car.transmissie).filter(Boolean)
        )).sort();

        setFilterOptions({
          merken,
          minPrijs: Math.min(...prijzen),
          maxPrijs: Math.max(...prijzen),
          minBouwjaar: Math.min(...bouwjaren),
          maxBouwjaar: Math.max(...bouwjaren),
          brandstofTypes,
          transmissieTypes,
        });
      }
    } catch (error) {
      logger.error('Error fetching aanbod cars', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: {
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
  }) => {
    let filtered = [...cars];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (car) =>
          car.merk.toLowerCase().includes(searchLower) ||
          car.model.toLowerCase().includes(searchLower) ||
          car.type?.toLowerCase().includes(searchLower)
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

    // Sortering
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

    setFilteredCars(filtered);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#d4c9bf4d' }}>
      <Navigation />

      <section className="section-padding py-20 bg-primary text-primary-foreground">
        <div className="container-wide text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Ons Aanbod
          </h1>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Heeft u vragen over ons aanbod, onderhoud of LPG installaties?
            Wij staan voor u klaar met persoonlijk advies en professionele service.
          </p>
        </div>
      </section>

      <div className="section-padding py-16" style={{ backgroundColor: '#d4c9bf4d' }}>
        <div className="container-wide">

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">
                Er zijn momenteel geen auto's beschikbaar in ons aanbod.
              </p>
            </div>
          ) : (
            <>
              <CarFilters
                options={filterOptions}
                onFilterChange={handleFilterChange}
              />

              {filteredCars.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-lg text-muted-foreground">
                    Geen auto's gevonden met de geselecteerde filters.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCars.map((car) => (
                    <CarCard
                      key={car.id}
                      id={car.id}
                      merk={car.merk}
                      model={car.model}
                      type={car.type || undefined}
                      voertuig_type={car.voertuig_type || undefined}
                      bouwjaar={car.bouwjaar}
                      kilometerstand={car.kilometerstand || undefined}
                      prijs={car.prijs}
                      car_images={car.car_images}
                      opties={car.opties || undefined}
                      brandstof_type={car.brandstof_type || undefined}
                      transmissie={car.transmissie || undefined}
                      binnenkort_beschikbaar={car.binnenkort_beschikbaar || undefined}
                      gereserveerd={car.gereserveerd || undefined}
                      status="aanbod"
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Aanbod;
