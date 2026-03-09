import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import CarFilters from "@/components/CarFilters";
import { Loader2 } from "lucide-react";
import { useCarListPage } from "@/hooks/useCarListPage";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import SEO from "@/components/SEO";

const Verkocht = () => {
  const { cars, filteredCars, loading, handleFilterChange, filterOptions } = useCarListPage('verkocht');
  const { pageHeaders } = useSiteSettings();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-accent)' }}>
      <SEO
        title="Verkochte auto's"
        description="Overzicht van recent verkochte voertuigen bij Auto Service van der Waals. Bekijk welke auto's wij eerder hebben verkocht."
        path="/verkocht"
      />
      <Navigation />

      <section className="section-padding py-20 bg-primary text-primary-foreground">
        <div className="container-wide text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {pageHeaders?.verkocht_title || "Verkochte Auto's"}
          </h1>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            {pageHeaders?.verkocht_subtitle || "Een overzicht van onze recent verkochte voertuigen"}
          </p>
        </div>
      </section>

      <div className="section-padding py-16" style={{ backgroundColor: 'var(--color-accent)' }}>
        <div className="container-wide">

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">
                Er zijn nog geen verkochte auto's om te tonen.
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
                      voertuig_type={car.voertuig_type || undefined}
                      bouwjaar={car.bouwjaar}
                      kilometerstand={car.kilometerstand || undefined}
                      prijs={car.prijs}
                      car_images={car.car_images}
                      opties={car.opties || undefined}
                      brandstof_type={car.brandstof_type}
                      transmissie={car.transmissie}
                      status="verkocht"
                      hideButton={true}
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

export default Verkocht;
