import { StickyFeatureSection } from "@/components/ui/sticky-scroll-cards-section";
import SEO, { buildBreadcrumbSchema } from "@/components/SEO";

export default function DemoOne() {
  return (
    <div className="w-full">
      <SEO
        title="LPG Installaties - Bespaar op brandstofkosten"
        description="Specialist in LPG installaties bij Auto Service van der Waals. Bespaar tot 50% op brandstofkosten. Professionele installatie, keuring en onderhoud van LPG systemen in Wieringerwaard."
        path="/lpg"
        schema={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "LPG Installaties", path: "/lpg" },
        ])}
      />
      <StickyFeatureSection />
    </div>
  );
}
