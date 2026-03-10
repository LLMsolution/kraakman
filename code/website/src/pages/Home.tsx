import React from "react";
import { Timeline } from "@/components/ui/timeline";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useCachedReviews } from "@/hooks/useCachedReviews";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { DEFAULT_HOMEPAGE_TIMELINE } from "@/data/contentDefaults";
import type { TimelineCard } from "@/services/siteSettingsService";
import heroImage from "@/assets/hero-home.jpg";
import autoserviceLogo from "@/assets/autoservice-van-der-waals.png";
import wkLogo from "@/assets/wk-auto-selectie.png";
import SEO, { buildAutoDealerSchema, buildFAQSchema } from "@/components/SEO";
import { BUSINESS } from "@/config/business";

function buildTimelineData(cards: TimelineCard[]) {
  return cards.map((card) => ({
    title: card.title,
    content: (
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          {card.subtitle}
        </h3>
        {card.description.split('\n\n').map((paragraph, pIdx) => (
          <p key={pIdx} className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {paragraph}
          </p>
        ))}

        {card.features.length > 0 && (
          <div className="space-y-4 mt-8">
            {card.features.map((feature, fIdx) => (
              <div key={fIdx} className="flex items-start gap-3">
                <CheckCircle2
                  className="h-6 w-6 flex-shrink-0 mt-0.5"
                  style={{ color: 'var(--color-primary)' }}
                />
                <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                  <strong className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{feature.bold}</strong> {feature.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
  }));
}

export default function TimelinePage() {
  const { reviewsData, loading } = useCachedReviews();
  const { hero, reviewsSection, homepageTimeline, footerSettings } = useSiteSettings();

  const timelineCards = homepageTimeline?.cards ?? DEFAULT_HOMEPAGE_TIMELINE.cards;
  const timelineSubtitle = homepageTimeline?.section_subtitle ?? DEFAULT_HOMEPAGE_TIMELINE.section_subtitle;
  const data = buildTimelineData(timelineCards);

  // Helper function to render stars
  const renderStars = (rating: number) => {
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

  const dealerSchema = buildAutoDealerSchema(
    reviewsData?.rating,
    reviewsData?.totalReviews
  );
  const faqAddress = footerSettings?.address_line1 && footerSettings?.address_line2
    ? `${footerSettings.address_line1}, ${footerSettings.address_line2}`
    : `${BUSINESS.ADDRESS_STREET}, ${BUSINESS.ADDRESS_POSTAL} ${BUSINESS.ADDRESS_CITY}`;
  const faqPhone = footerSettings?.phone || BUSINESS.PHONE;
  const faqSchema = buildFAQSchema([
    {
      question: "Wat voor diensten biedt Auto Service van der Waals?",
      answer: "Wij zijn gespecialiseerd in auto onderhoud, reparatie, APK, LPG installaties en de verkoop van kwalitatieve occasions. Met meer dan 30 jaar ervaring staan wij voor u klaar.",
    },
    {
      question: "Waar is Auto Service van der Waals gevestigd?",
      answer: `Wij zijn gevestigd aan de ${faqAddress}. Wij zijn geopend van ${footerSettings?.opening_days || "maandag t/m vrijdag"} van ${footerSettings?.opening_hours || "08:00 tot 17:00 uur"}, ${footerSettings?.opening_note || "op afspraak"}.`,
    },
    {
      question: "Kan ik een proefrit maken?",
      answer: `Ja, u kunt via onze website of telefonisch (${faqPhone}) een proefrit aanvragen. Wij plannen graag een afspraak op een tijdstip dat u uitkomt.`,
    },
    {
      question: "Biedt Auto Service van der Waals LPG installaties aan?",
      answer: "Ja, wij zijn specialist in LPG installaties. Wij adviseren u graag over de mogelijkheden en voordelen van rijden op LPG.",
    },
  ]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <SEO
        title="Auto Service van der Waals - Specialist in Onderhoud, LPG & Occasions"
        description="Auto Service van der Waals in Wieringerwaard. Specialist in auto onderhoud, reparatie, LPG installaties en occasions. 30+ jaar ervaring. Bekijk ons aanbod!"
        path="/"
        schema={[dealerSchema, faqSchema]}
      />
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <picture>
          {hero?.image_url_mobile && (
            <source media="(max-width: 767px)" srcSet={hero.image_url_mobile} />
          )}
          <img
            src={hero?.image_url || heroImage}
            alt="Auto Service van der Waals"
            className="w-full h-full object-cover"
            fetchPriority="high"
          />
        </picture>
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white px-4 py-16 md:px-8 md:py-12 lg:px-16 lg:py-16">
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-6">
              {hero?.title || "Auto Service van der Waals"}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              {hero?.subtitle || "Specialist in auto onderhoud, reparatie en LPG installaties. Meer dan 30 jaar ervaring in Wieringerwaard."}
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
            <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>{reviewsSection?.title || "Kies voor zekerheid"}</h2>

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
                {reviewsSection?.subtitle || "bij ons geen verrassingen – volledige transparantie, altijd"}
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
        <Timeline
          data={data}
          sectionTitle={hero?.wie_zijn_wij_title}
          sectionSubtitle={timelineSubtitle}
          logos={[
            { src: autoserviceLogo, alt: "Autoservice van der Waals" },
            { src: wkLogo, alt: "WK Auto Selectie" },
          ]}
        />

        {/* CTA Section */}
        <section className="py-16 md:py-12 lg:py-16" style={{ backgroundColor: 'var(--color-primary)' }}>
          <div className="px-4 md:px-8 lg:px-16 container-wide text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-inverse)' }}>
              {hero?.cta_title || "Klaar voor uw volgende auto-ervaring?"}
            </h2>
            <p className="text-lg mb-8" style={{ color: 'var(--color-text-inverse)', opacity: 0.9 }}>
              {hero?.cta_subtitle || "Neem contact op voor een vrijblijvend advies of maak direct een afspraak"}
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
