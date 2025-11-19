import React from "react";
import { Timeline } from "@/components/ui/timeline";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useCachedReviews } from "@/hooks/useCachedReviews";
import heroImage from "@/assets/hero-home.jpg";

export default function TimelinePage() {
  const { reviewsData, loading } = useCachedReviews();

  // Helper function to render stars
  const renderStars = (rating: number) => {
    // Show 5 stars if rating is 4.5 or higher, otherwise show floor(rating) stars
    const starsToShow = rating >= 4.5 ? 5 : Math.floor(rating);

    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill={i < starsToShow ? "var(--color-star-filled)" : "var(--color-star-empty)"}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ));
  };

  const data = [
    {
      title: "Stefan van der Waals",
      content: (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Technische Expertise
          </h3>
          <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Stefan is vanaf zijn 16e werkzaam in de automotive branche en is in 2007 Autoservice van der Waals gestart uit pure liefhebberij. Diverse opleidingen en meer dan 30 jaar ervaring hebben ervoor gezorgd dat Autoservice van der Waals allround is. De werkplaats in Wieringerwaard is voorzien van alle mogelijke benodigdheden voor onderhoud, modificatie en reparatie aan uw auto.
          </p>

          <div className="space-y-4 mt-8">
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="h-6 w-6 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--color-primary)' }}
              />
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Meer dan 30 jaar ervaring:</strong> Actief in de automotive branche sinds 16e
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="h-6 w-6 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--color-primary)' }}
              />
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Allround dienstverlening:</strong> Onderhoud, modificatie en reparatie
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="h-6 w-6 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--color-primary)' }}
              />
              <div className="flex flex-col">
                <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                  <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Werkplaats in Wieringerwaard:</strong> Volledig uitgeruste werkplaats
                </p>

              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Kees Kraakman",
      content: (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Commerciële Kracht
          </h3>
          <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Waar Kees eerst als tevreden klant over de vloer kwam bij Autoservice van der Waals, is dit vanuit daar uitgegroeid tot een goede vriendschap en uiteindelijk de grondlegging geweest voor WK Auto Selectie. Kees, die zelf ook opgeleid is aan de IVA en een automotive achtergrond heeft, is dus absoluut niet onbekend op dit terrein.
          </p>

          <div className="space-y-4 mt-8">
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="h-6 w-6 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--color-primary)' }}
              />
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>IVA opgeleid:</strong> Professionele automotive achtergrond
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="h-6 w-6 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--color-primary)' }}
              />
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Commercieel inzicht:</strong> Klantgericht ondernemerschap
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="h-6 w-6 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--color-primary)' }}
              />
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Goede vriendschap:</strong> Basis voor succesvolle samenwerking
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "De Ideale Match",
      content: (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Technische en Commerciële Synergie
          </h3>
          <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            De combinatie van de technische achtergrond van Stefan met de commerciële achtergrond van Kees zijn de ideale match en zo wordt WK Auto Selectie gestart in 2022.
          </p>
          <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Aangezien service en kwaliteit hoog in het vaandel staan, worden de auto's bij WK Auto Selectie, die in het assortiment beschikbaar zijn, door ons zelf opgehaald. Op deze manier worden de auto's persoonlijk gecontroleerd, zodat zij aan de hoge kwaliteitseisen voldoen. Hierbij is een sluitende onderhoudshistorie een absolute must.
          </p>
          <div className="space-y-4 mt-6">
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="h-6 w-6 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--color-primary)' }}
              />
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Persoonlijke selectie:</strong> Alle auto's worden door ons zelf opgehaald en gecontroleerd
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="h-6 w-6 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--color-primary)' }}
              />
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Hoge kwaliteitseisen:</strong> Alleen auto's die voldoen aan onze strikte eisen
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="h-6 w-6 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--color-primary)' }}
              />
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Sluitende historie:</strong> Volledige onderhoudsgeschiedenis is vereist
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Kwaliteit & Service",
      content: (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Hoogste Kwaliteitsstandaarden
          </h3>
          <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Aangezien service en kwaliteit hoog in het vaandel staan, worden de auto's bij WK Auto Selectie, die in het assortiment beschikbaar zijn, door ons zelf opgehaald. Op deze manier worden de auto's persoonlijk gecontroleerd, zodat zij aan de hoge kwaliteitseisen voldoen. Hierbij is een sluitende onderhoudshistorie een absolute must.
          </p>
          <div className="space-y-4 mt-6">
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="h-6 w-6 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--color-primary)' }}
              />
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Persoonlijke selectie:</strong> Alle auto's worden door ons zelf opgehaald en gecontroleerd
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="h-6 w-6 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--color-primary)' }}
              />
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Hoge kwaliteitseisen:</strong> Alleen auto's die voldoen aan onze strikte eisen
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="h-6 w-6 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--color-primary)' }}
              />
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Sluitende historie:</strong> Volledige onderhoudsgeschiedenis is vereist
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Maatwerk & Service",
      content: (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Uw Wens, Onze Service
          </h3>
          <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Maatwerk nodig? Bel ons! Met aandacht voor de klant en een luisterend oor betreffende de wensen, gaan wij voor u persoonlijk op zoek naar datgene dat volledig bij uw wensen aansluit. Van brommer tot bedrijfsbus, wij zijn uw adres!
          </p>
          <div className="space-y-4 mt-6">
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="h-6 w-6 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--color-primary)' }}
              />
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Persoonlijke benadering:</strong> Met aandacht voor de klant en een luisterend oor voor uw wensen
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="h-6 w-6 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--color-primary)' }}
              />
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Technische expertise:</strong> Deskundig advies en professionele uitvoering
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="h-6 w-6 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--color-primary)' }}
              />
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Van brommer tot bedrijfsbus:</strong> Alle typen voertuigen welkom
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="h-6 w-6 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--color-primary)' }}
              />
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Maatwerk oplossingen:</strong> Zoeken naar het perfecte voertuig dat bij uw wensen aansluit
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <img
          src={heroImage}
          alt="Auto Service van der Waals"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white px-4 py-16 md:px-8 md:py-12 lg:px-16 lg:py-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Auto Service van der Waals
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Specialist in auto onderhoud, reparatie en LPG installaties.
              Meer dan 30 jaar ervaring in Wieringerwaard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Button asChild>
                <Link to="/aanbod">
                  Bekijk ons aanbod
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/contact">
                  Maak afspraak
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 md:py-12 lg:py-16" style={{ backgroundColor: 'var(--color-accent)' }}>
        <div className="px-4 md:px-8 lg:px-16 container-wide">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Kies voor zekerheid</h2>

            <div className="flex flex-col items-center">
              {/* Google Logo */}
              <div className="mb-6">
                <svg className="w-12 h-12" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>

              {/* Rating Display */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {!loading && reviewsData?.rating ? (
                  <>
                    <div className="flex gap-1">
                      {renderStars(reviewsData.rating)}
                    </div>
                    <span className="text-3xl font-bold ml-2" style={{ color: 'var(--color-text-primary)' }}>
                      {reviewsData.rating.toFixed(1)}
                    </span>
                  </>
                ) : (
                  <div className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>Laden...</div>
                )}
              </div>

              {/* Trust Message */}
              <div className="text-lg mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                bij ons geen verrassingen – volledige transparantie, altijd
              </div>

              {/* CTA Button */}
              <Button asChild className="group">
                <Link to="/reviews" className="flex items-center gap-2">
                  Zie reviews
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main>
        <Timeline data={data} />

        {/* CTA Section */}
        <section className="py-16 md:py-12 lg:py-16" style={{ backgroundColor: 'var(--color-primary)' }}>
          <div className="px-4 md:px-8 lg:px-16 container-wide text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-inverse)' }}>
              Klaar voor uw volgende auto-ervaring?
            </h2>
            <p className="text-lg mb-8" style={{ color: 'var(--color-text-inverse)', opacity: 0.9 }}>
              Neem contact op voor een vrijblijvend advies of maak direct een afspraak
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Button asChild>
                <Link to="/contact">
                  Neem contact op
                </Link>
              </Button>
              <Button asChild>
                <Link to="/aanbod">
                  Bekijk occasions
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}