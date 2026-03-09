import { Helmet } from "react-helmet-async";
import { BUSINESS } from "@/config/business";

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article" | "product";
  schema?: object | object[];
  noindex?: boolean;
}

const SEO = ({
  title,
  description,
  path = "",
  image,
  imageAlt,
  type = "website",
  schema,
  noindex = false,
}: SEOProps) => {
  const url = `${BUSINESS.SITE_URL}${path}`;
  const ogImage = image?.startsWith("http")
    ? image
    : `${BUSINESS.SITE_URL}${image || "/og-image.jpg"}`;
  const fullTitle = title.includes(BUSINESS.NAME)
    ? title
    : `${title} | ${BUSINESS.NAME}`;

  const schemas = schema
    ? Array.isArray(schema)
      ? schema
      : [schema]
    : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="nl_NL" />
      <meta property="og:site_name" content={BUSINESS.NAME} />
      <meta property="og:image" content={ogImage} />
      {imageAlt && <meta property="og:image:alt" content={imageAlt} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;

// --- Reusable Schema Builders ---

export function buildAutoDealerSchema(reviewRating?: number, reviewCount?: number) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: BUSINESS.NAME,
    url: BUSINESS.SITE_URL,
    logo: `${BUSINESS.SITE_URL}/wk-logo.png`,
    image: `${BUSINESS.SITE_URL}/og-image.jpg`,
    description:
      "Auto Service van der Waals in Wieringerwaard. Specialist in auto onderhoud, reparatie, LPG installaties en import/export. 30+ jaar ervaring.",
    telephone: BUSINESS.PHONE_HREF,
    email: BUSINESS.EMAIL,
    priceRange: "$$",
    currenciesAccepted: "EUR",
    paymentAccepted: "Contant, Bankoverboeking, Financiering",
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.ADDRESS_STREET,
      addressLocality: BUSINESS.ADDRESS_CITY,
      postalCode: BUSINESS.ADDRESS_POSTAL,
      addressCountry: BUSINESS.ADDRESS_COUNTRY,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.GEO_LAT,
      longitude: BUSINESS.GEO_LNG,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "17:00",
      },
    ],
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: BUSINESS.GEO_LAT,
        longitude: BUSINESS.GEO_LNG,
      },
      geoRadius: "50000",
    },
    hasMap: `https://www.google.com/maps/place/?q=place_id:${BUSINESS.GOOGLE_PLACE_ID}`,
  };

  if (reviewRating && reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviewRating.toFixed(1),
      reviewCount: reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }

  return schema;
}

export function buildCarSchema(car: {
  id: string;
  merk: string;
  model: string;
  type?: string | null;
  bouwjaar: number;
  kilometerstand?: number | null;
  prijs: number;
  omschrijving?: string | null;
  brandstof_type?: string | null;
  transmissie?: string | null;
  kleur?: string | null;
  vermogen_pk?: number | null;
  status: string;
  car_images?: { url: string }[];
}) {
  const images = car.car_images?.map((img) => img.url) || [];
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${car.bouwjaar} ${car.merk} ${car.model}${car.type ? ` ${car.type}` : ""}`,
    brand: { "@type": "Brand", name: car.merk },
    model: car.model,
    vehicleModelDate: car.bouwjaar.toString(),
    description:
      car.omschrijving ||
      `${car.merk} ${car.model} uit ${car.bouwjaar} te koop bij ${BUSINESS.NAME}`,
    url: `${BUSINESS.SITE_URL}/auto/${car.id}`,
    image: images,
    offers: {
      "@type": "Offer",
      price: car.prijs,
      priceCurrency: "EUR",
      availability:
        car.status === "aanbod"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      itemCondition: "https://schema.org/UsedCondition",
      seller: {
        "@type": "AutoDealer",
        name: BUSINESS.NAME,
        url: BUSINESS.SITE_URL,
      },
    },
  };

  if (car.kilometerstand) {
    schema.mileageFromOdometer = {
      "@type": "QuantitativeValue",
      value: car.kilometerstand,
      unitCode: "KMT",
    };
  }
  if (car.kleur) schema.color = car.kleur;
  if (car.brandstof_type) schema.fuelType = car.brandstof_type;
  if (car.transmissie) schema.vehicleTransmission = car.transmissie;
  if (car.vermogen_pk) {
    schema.vehicleEngine = {
      "@type": "EngineSpecification",
      enginePower: {
        "@type": "QuantitativeValue",
        value: car.vermogen_pk,
        unitCode: "BHP",
      },
    };
  }

  return schema;
}

export function buildBreadcrumbSchema(
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BUSINESS.SITE_URL}${item.path}`,
    })),
  };
}

export function buildFAQSchema(
  questions: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}
