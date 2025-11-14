import { useState, useEffect, useRef } from 'react';
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

// --- Data for the LPG feature cards (text + checklist combinations) ---
const lpgFeatures = [
  {
    title: "Waarom Auto Service van der Waals?",
    description: "Bij ons staat de klant centraal. We nemen de tijd om uw wensen te begrijpen en adviseren u over de beste LPG-oplossing voor uw specifieke situatie. Geen standaard verhalen, maar maatwerk.\n\nKeurige Installaties: We staan bekend om onze nette en professionele inbouw. Alle leidingen worden vakkundig weggewerkt en de installatie wordt zo onzichtbaar mogelijk gemaakt. Kwaliteit en esthetiek gaan bij ons hand in hand.\n\nErvaring en Expertise: Met meer dan 30 jaar ervaring in de automotive hebben we duizenden LPG-installaties uitgevoerd. Van moderne directe inspuit motoren tot klassieke carburateur systemen - wij kennen ze allemaal.",
    features: [
      "Meer dan 30 jaar ervaring",
      "Duizenden tevreden klanten",
      "Persoonlijke benadering",
      "Vakkundige en nette afwerking",
      "Transparante prijzen",
      "Garantie op onze werkzaamheden"
    ],
    checklistTitle: "Onze Garanties"
  },
  {
    title: "Waarom kiezen voor LPG?",
    description: "LPG (Liquid Petroleum Gas) is een schone en voordelige brandstof voor uw auto. Met onze expertise in zowel moderne G3-systemen als klassieke installaties, zorgen wij voor een professionele inbouw die perfect bij uw voertuig past.",
    features: [
      "Schone en voordelige brandstof",
      "Minder CO2 uitstoot dan benzine",
      "Bespaar tot 40% op brandstofkosten",
      "Professionele inbouw gegarandeerd",
      "Beschikbaar voor moderne en klassieke auto's"
    ],
    checklistTitle: "LPG Voordelen"
  },
  {
    title: "Moderne G3 Systemen",
    description: "De nieuwste generatie LPG installaties bieden superieure prestaties en betrouwbaarheid. Volledig geïntegreerd met moderne motorelektronica en behoud van fabrieksgarantie.",
    features: [
      "Nieuwste generatie LPG installaties",
      "Optimale prestaties en verbruik",
      "Geschikt voor moderne motoren",
      "Fabrieksgarantie behouden",
      "Volledige software integratie",
      "Langere levensduur en betrouwbaarheid"
    ],
    checklistTitle: "G3 Kenmerken"
  },
  {
    title: "Klassieke Auto's & Oldtimers",
    description: "Specialist in LPG voor oldtimers en youngtimers. Wij respecteren de originaliteit van uw klassieker en zorgen voor vakkundige inbouw zonder beschadiging van historische onderdelen.",
    features: [
      "Specialist in oldtimers en youngtimers",
      "Respect voor originaliteit",
      "Vakkundige inbouw zonder beschadiging",
      "Kennis van historische systemen",
      "Onderhoud bestaande installaties",
      "Advies op maat voor uw klassieker"
    ],
    checklistTitle: "Specialisatie"
  },
  {
    title: "Tanks & Systemen",
    description: "Groot assortiment vulsystemen en diverse tankformaten beschikbaar. Van cilindrische tot toroïdale tanks met installatie in reservewiel ruimte voor optimale ruimtebenutting.",
    features: [
      "Groot assortiment vulsystemen",
      "Diverse tankformaten beschikbaar",
      "Cilindrische en toroïdale tanks",
      "Advies over optimale tankkeuze",
      "Installatie in reservewiel ruimte",
      "Kofferbak-vriendelijke oplossingen"
    ],
    checklistTitle: "Systemen"
  },
  {
    title: "Service & Onderhoud",
    description: "Periodiek onderhoud van LPG installaties met professionele diagnose en reparatie. Wij zorgen ervoor dat uw LPG-systeem altijd perfect functioneert volgens de laatste normen.",
    features: [
      "Periodiek onderhoud installaties",
      "Diagnose en reparatie",
      "Tuning voor optimale prestaties",
      "Herkeuring en certificering",
      "Troubleshooting en probleemoplossing",
      "Upgrades en verbeteringen"
    ],
    checklistTitle: "Diensten"
  }
];

// --- Custom Hook for Scroll Animation ---
const useScrollAnimation = () => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, inView] as const;
};

// --- Header Component ---
const AnimatedHeader = () => {
    const [headerRef, headerInView] = useScrollAnimation();
    const [pRef, pInView] = useScrollAnimation();

    return (
        <div className="text-center max-w-4xl mx-auto section-padding">
            <h2
                ref={headerRef}
                className={cn(
                    "text-3xl md:text-5xl font-bold mb-8 transition-all duration-700 ease-out",
                    headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                )}
                style={{
                  transformStyle: 'preserve-3d',
                  color: 'var(--color-secondary)',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}
            >
                Onze LPG Diensten
            </h2>
            <p
                ref={pRef}
                className={cn(
                    "text-lg md:text-xl transition-all duration-700 ease-out delay-200 leading-relaxed",
                    pInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                )}
                style={{
                  transformStyle: 'preserve-3d',
                  color: 'var(--color-text-muted)',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}
            >
                Professionele LPG installaties met jarenlange ervaring
            </p>
        </div>
    );
};

// --- Text Content Component with "Lees meer" functionality ---
const TextContent = ({ text, showFullText = false }: { text: string; showFullText?: boolean }) => {
  const processText = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Check if this line looks like a header (contains colon at the end)
      const isHeader = line.includes(':') && line.length < 50;

      if (isHeader) {
        return (
          <h4 key={index} className="text-base sm:text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)', fontFamily: "'Inter', -piemacemTailwindCSSFont, 'Segoe UI', sans-serif" }}>
            {line.trim()}
          </h4>
        );
      }

      // Truncate or show full text based on showFullText prop
      const maxTextLength = 120; // Shorter text for mobile
      const textToDisplay = line.trim();
      const shouldTruncate = !showFullText && textToDisplay.length > maxTextLength;
      const truncatedText = shouldTruncate ? textToDisplay.substring(0, maxTextLength) + '...' : textToDisplay;

      return (
        <p key={index} className="mb-3 leading-relaxed text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)', fontFamily: "'Inter', -piemacemTailwindCSSFont, 'Segoe UI', sans-serif" }}>
          {truncatedText}
        </p>
      );
    });
  };

  return (
    <div>
      {processText(text)}
    </div>
  );
};

// This is the main component that orchestrates everything.
export function StickyLPGSection() {
  const [expandedTexts, setExpandedTexts] = useState<{ [key: number]: boolean }>({});
  const toggleTextExpansion = (index: number) => {
    setExpandedTexts(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };


  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section - same style as Contact page */}
      <section
        className="section-padding bg-primary text-primary-foreground"
        style={{
          paddingTop: 'var(--spacing-hero-padding)',    /* 96px top */
          paddingBottom: 'var(--spacing-hero-padding)' /* 96px bottom - equal to top */
        }}
      >
        <div className="container-wide text-center">
          <h1
            className="text-5xl font-bold mb-6"
            style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
          >
            Onze LPG Diensten
          </h1>
          <p
            className="text-xl opacity-90 leading-relaxed"
            style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
          >
            Professionele LPG installaties met jarenlange ervaring
          </p>
        </div>
      </section>

      {/* The main section for the LPG features */}
      <section
        className="section-padding py-32 flex flex-col items-center"
        style={{ backgroundColor: '#d4c9bf4d' }}
      >
        <div className="container-wide max-w-6xl">

          {/* The container for the sticky cards */}
          <div className="w-full" style={{ paddingBottom: '0px' }}>
            {lpgFeatures.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "mb-12 sm:mb-16 sticky overflow-hidden",
                  "grid grid-cols-1 lg:grid-cols-2 items-start gap-6 sm:gap-8 p-6 sm:p-8 lg:p-12"
                )}
                style={{
                  top: '200px', // Start sticky animation when entire hero section is behind the navbar
                  backgroundColor: '#F1EFEC',
                  border: `1px solid var(--color-border-primary)`,
                  borderRadius: '0',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  minHeight: '400px sm:min-h-[500px]' // Responsive minimum height
                }}
              >
                {/* Text Column */}
                <div className={cn(
                  "flex flex-col justify-start",
                  index % 2 === 1 ? "lg:order-2" : "lg:order-1"
                )}>
                  <h3
                    className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4 sm:mb-6 tracking-tight"
                    style={{ color: 'var(--color-text-primary)', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
                  >
                    {feature.title}
                  </h3>

                  {feature.description && (
                    <div className="space-y-3">
                      <TextContent 
                        text={feature.description} 
                        showFullText={expandedTexts[index]}
                      />
                      {feature.description.length > 120 && (
                        <button
                          onClick={() => toggleTextExpansion(index)}
                          className="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          {expandedTexts[index] ? (
                            <>
                              <span>Lees minder</span>
                            </>
                          ) : (
                            <>
                              <span>Lees meer</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Checklist Column */}
                <div className={cn(
                  "flex flex-col justify-start",
                  index % 2 === 1 ? "lg:order-1" : "lg:order-2"
                )}>
                  <div className="h-full">
                    <h3
                      className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4 sm:mb-6 tracking-tight"
                      style={{ color: 'var(--color-text-primary)', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
                    >
                      {feature.checklistTitle}
                    </h3>

                    {feature.features && feature.features.length > 0 && (
                      <ul className="space-y-2 sm:space-y-3">
                        {feature.features.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2 sm:gap-3">
                            <CheckCircle2
                              className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 mt-0.5"
                              style={{ color: 'var(--color-primary)' }}
                            />
                            <span
                              className="leading-relaxed text-sm sm:text-base"
                              style={{
                                color: 'var(--color-text-muted)',
                                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                              }}
                            >
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - same as LPG page */}
      <section className="section-padding py-20 bg-primary text-primary-foreground">
        <div className="container-wide text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            Interesse in een LPG-installatie?
          </h2>
          <p className="text-lg mb-8 opacity-90" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            Neem contact met ons op voor een vrijblijvend adviesgesprek
          </p>
          <div className="flex justify-center">
          <Button asChild>
            <a href="/contact" style={{ textDecoration: 'none' }}>
              Neem contact op
            </a>
          </Button>
        </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Export the original name for backward compatibility
export { StickyLPGSection as StickyFeatureSection };