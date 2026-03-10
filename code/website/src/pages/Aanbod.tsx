import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import CarFilters from "@/components/CarFilters";
import { Loader2 } from "lucide-react";
import { useCarListPage } from "@/hooks/useCarListPage";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import SEO, { buildBreadcrumbSchema } from "@/components/SEO";

const Aanbod = () => {
  const { cars, filteredCars, loading, handleFilterChange, filterOptions } = useCarListPage('aanbod');
  const { pageHeaders } = useSiteSettings();

  // Restore scroll position when returning from car detail page
  useEffect(() => {
    if (!loading && filteredCars.length > 0) {
      const savedY = sessionStorage.getItem('scrollY_/aanbod');
      if (savedY) {
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedY));
          sessionStorage.removeItem('scrollY_/aanbod');
        });
      }
    }
  }, [loading, filteredCars.length]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-accent)' }}>
      <SEO
        title="Occasions te koop - Ons autoaanbod"
        description={`Bekijk ${filteredCars.length > 0 ? filteredCars.length : 'onze'} beschikbare occasions bij Auto Service van der Waals in Wieringerwaard. Kwalitatieve tweedehands auto's met garantie.`}
        path="/aanbod"
        schema={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Aanbod", path: "/aanbod" },
        ])}
      />
      <Navigation />

      <section className="section-padding py-20 bg-primary text-primary-foreground">
        <div className="container-wide text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {pageHeaders?.aanbod_title || "Ons Aanbod"}
          </h1>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            {pageHeaders?.aanbod_subtitle || "Heeft u vragen over ons aanbod, onderhoud of LPG installaties? Wij staan voor u klaar met persoonlijk advies en professionele service."}
          </p>
        </div>
      </section>

      <div className="section-padding py-16" style={{ backgroundColor: 'var(--color-accent)' }}>
        <div className="container-wide">

          {loading ? (
            <div className="flex justify-center items-center py-20" style={{ minHeight: '60vh' }}>
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
