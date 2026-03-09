import { useState, useEffect, useRef } from 'react';
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { DEFAULT_LPG_FEATURES } from "@/data/contentDefaults";

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

// --- Text Content Component ---
const TextContent = ({ text }: { text: string }) => {
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

      return (
        <p key={index} className="mb-3 leading-relaxed text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)', fontFamily: "'Inter', -piemacemTailwindCSSFont, 'Segoe UI', sans-serif" }}>
          {line.trim()}
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
  const { pageHeaders, lpgFeatures: lpgFeaturesData } = useSiteSettings();
  const lpgFeatures = lpgFeaturesData?.cards ?? DEFAULT_LPG_FEATURES.cards;

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
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
            style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
          >
            {pageHeaders?.lpg_title || "Onze LPG Diensten"}
          </h1>
          <p
            className="text-xl opacity-90 leading-relaxed"
            style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
          >
            {pageHeaders?.lpg_subtitle || "Professionele LPG installaties met jarenlange ervaring"}
          </p>
        </div>
      </section>

      {/* The main section for the LPG features - Mobile First Design */}
      <section
        className="section-padding py-16 lg:py-32"
        style={{ backgroundColor: 'var(--color-accent)' }}
      >
        <div className="container-wide max-w-6xl">
          {/* Mobile Layout - Default, visible on mobile and tablet */}
          <div className="lg:hidden w-full space-y-6">
            {lpgFeatures.map((feature, index) => (
              <div
                key={index}
                className="w-full bg-background border border-[var(--color-border-primary)] rounded-lg p-5 sm:p-6 shadow-sm"
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}
              >
                {/* Service Title */}
                <h3
                  className="text-lg sm:text-xl font-semibold mb-4 tracking-tight leading-tight"
                  style={{
                    color: 'var(--color-text-primary)',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                  }}
                >
                  {feature.title}
                </h3>

                {/* Service Description */}
                {feature.description && (
                  <div className="mb-6">
                    <TextContent text={feature.description} />
                  </div>
                )}

                {/* Service Features */}
                {feature.features && feature.features.length > 0 && (
                  <div>
                    <h4
                      className="text-base sm:text-lg font-semibold mb-3"
                      style={{
                        color: 'var(--color-text-primary)',
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                      }}
                    >
                      {feature.checklistTitle}
                    </h4>
                    <ul className="space-y-3 sm:space-y-2.5">
                      {feature.features.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3 sm:gap-2.5">
                          <CheckCircle2
                            className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5"
                            style={{ color: 'var(--color-primary)' }}
                          />
                          <span
                            className="text-xs sm:text-sm leading-relaxed"
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
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Layout - Original sticky cards, hidden on mobile/tablet */}
          <div className="hidden lg:block w-full" style={{ paddingBottom: '0px' }}>
            {lpgFeatures.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "mb-12 sm:mb-16 sticky overflow-hidden",
                  "grid grid-cols-1 lg:grid-cols-2 items-start gap-6 sm:gap-8 p-6 sm:p-8 lg:p-12"
                )}
                style={{
                  top: '200px', // Start sticky animation when entire hero section is behind the navbar
                  backgroundColor: 'var(--color-background)',
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
                      />
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
            {pageHeaders?.lpg_cta_title || "Interesse in een LPG-installatie?"}
          </h2>
          <p className="text-lg mb-8 opacity-90" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            {pageHeaders?.lpg_cta_subtitle || "Neem contact met ons op voor een vrijblijvend adviesgesprek"}
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