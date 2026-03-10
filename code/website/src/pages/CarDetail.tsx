import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowLeft, CheckCircle2, AlertCircle, Share2, Copy, Check } from "lucide-react";
import CarCard from "@/components/CarCard";
import { useCarDetail } from "@/hooks/useCarDetail";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { BUSINESS } from "@/config/business";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { galleryUrl, thumbnailUrl, lightboxUrl } from "@/utils/imageUrl";
import type { CarImage } from "@/types";
import SEO, { buildCarSchema, buildBreadcrumbSchema } from "@/components/SEO";

// Standardized input styling
const inputClass = "h-12 border border-secondary bg-background focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-secondary hover:border-secondary transition-none leading-6 px-4 py-3";

const CarDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { car, similarCars: hookSimilarCars, loading, error } = useCarDetail();
  const { footerSettings } = useSiteSettings();
  const similarCars = (hookSimilarCars || []).slice(0, 3);

  // Scroll to top when navigating to a different car (e.g. via similar cars)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxDirection, setLightboxDirection] = useState<'next' | 'prev'>('next');
  const [activeTab, setActiveTab] = useState('omschrijving');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllOptions, setShowAllOptions] = useState(false);
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg'>('lg');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  // Detect current breakpoint for responsive "Zie meer" logic (debounced)
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const updateBreakpoint = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const width = window.innerWidth;
        if (width < 768) setBreakpoint('sm');
        else if (width < 1024) setBreakpoint('md');
        else setBreakpoint('lg');
      }, 150);
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateBreakpoint);
    };
  }, []);

  // Reset showAllOptions when tab changes
  useEffect(() => {
    setShowAllOptions(false);
  }, [activeTab]);

  // Proefrit form state
  const [formData, setFormData] = useState({
    naam: '',
    email: '',
    telefoon: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard navigation when lightbox is open
      if (!lightboxOpen) return;

      // Get current images from the car state
      const images = car?.car_images || [];
      if (images.length <= 1) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault(); // Prevent default browser behavior
          setLightboxDirection('prev');
          setLightboxIndex((prev: number) => (prev - 1 + images.length) % images.length);
          break;
        case 'ArrowRight':
          event.preventDefault(); // Prevent default browser behavior
          setLightboxDirection('next');
          setLightboxIndex((prev: number) => (prev + 1) % images.length);
          break;
        case 'Escape':
          event.preventDefault(); // Close lightbox on Escape
          setLightboxOpen(false);
          break;
      }
    };

    // Add event listener when component mounts
    window.addEventListener('keydown', handleKeyDown);

    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxOpen, car?.car_images]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="section-padding section-spacing-lg">
          <div className="container-wide">
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="section-padding section-spacing-lg">
          <div className="container-wide text-center">
            <h1 className="text-2xl">{error || 'Auto niet gevonden'}</h1>
          </div>
        </div>
      </div>
    );
  }

  // Split images: first 3 large, rest small
  const largeImages = car.car_images?.slice(0, 3) || [];
  const smallImages = car.car_images?.slice(3) || [];
  const allImages = car.car_images || [];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxDirection('next');
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setLightboxDirection('next');
    setLightboxIndex((prev: number) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setLightboxDirection('prev');
    setLightboxIndex((prev: number) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Form handling functions
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.naam.trim()) {
      errors.naam = 'Naam is verplicht';
    }

    if (!formData.email.trim()) {
      errors.email = 'E-mailadres is verplicht';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Voer een geldig e-mailadres in';
    }

    if (formData.telefoon && !/^[\d\s\-+()]+$/.test(formData.telefoon)) {
      errors.telefoon = 'Voer een geldig telefoonnummer in';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace('proefrit-', '');

    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear error for this field when user starts typing
    setFormErrors(prev => {
      if (prev[fieldName]) {
        return { ...prev, [fieldName]: '' };
      }
      return prev;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      // Call the Supabase Edge Function for test drive requests
      const { error: submitError } = await supabase.functions.invoke('send-testdrive-request', {
        body: {
          name: formData.naam,
          email: formData.email,
          phone: formData.telefoon,
          carBrand: car.merk,
          carModel: car.model,
          carYear: car.bouwjaar,
          carPrice: car.prijs,
          carImage: car.car_images?.[0]?.url || null,
          carId: car.id,
        }
      });

      if (submitError) {
        throw submitError;
      }

      setSubmitStatus('success');
      setSubmitMessage('Uw proefrit aanvraag is succesvol verzonden! We nemen zo snel mogelijk contact met u op.');

      // Reset form
      setFormData({ naam: '', telefoon: '', email: '' });
      setFormErrors({});

    } catch (err) {
      logger.error('Error submitting test drive request', {
        error: err instanceof Error ? err.message : 'Unknown error',
        carId: car.id,
        carMerk: car.merk,
        carModel: car.model
      });
      setSubmitStatus('error');
      setSubmitMessage('Er is een fout opgetreden bij het verzenden van uw aanvraag. Probeer het opnieuw of neem rechtstreeks contact met ons op.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const carTitle = `${car.bouwjaar} ${car.merk} ${car.model}${car.type ? ` ${car.type}` : ""}`;
  const carDescription = car.omschrijving
    ? car.omschrijving.substring(0, 155).replace(/\s+\S*$/, "...")
    : `${carTitle} te koop bij Auto Service van der Waals voor €${car.prijs?.toLocaleString("nl-NL")}. ${car.kilometerstand ? `${car.kilometerstand.toLocaleString("nl-NL")} km.` : ""} Bekijk details en vraag een proefrit aan.`;
  const carImage = car.car_images?.[0]?.url;

  const carSchema = buildCarSchema(car);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Aanbod", path: "/aanbod" },
    { name: carTitle, path: `/auto/${car.id}` },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${carTitle} kopen`}
        description={carDescription}
        path={`/auto/${car.id}`}
        image={carImage}
        imageAlt={carTitle}
        type="product"
        schema={[carSchema, breadcrumbSchema]}
      />
      <Navigation />

      {/* Binnenkort Beschikbaar Banner - Full-width bovenaan */}
      {car.binnenkort_beschikbaar && (
        <div
          className="w-full"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-text-inverse)'
          }}
        >
          <div className="section-padding">
            <div className="container-wide">
              <div
                className="flex items-center justify-center py-4 px-6 text-center"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--color-text-inverse)' }}
                  />
                  <span className="font-medium">Binnenkort beschikbaar</span>
                  <span className="text-sm opacity-90">Neem contact op voor meer informatie</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gereserveerd Banner - Full-width bovenaan */}
      {car.gereserveerd && (
        <div
          className="w-full"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-text-inverse)'
          }}
        >
          <div className="section-padding">
            <div className="container-wide">
              <div
                className="flex items-center justify-center py-4 px-6 text-center"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--color-text-inverse)' }}
                  />
                  <span className="font-medium">Gereserveerd</span>
                  <span className="text-sm opacity-90">Neem contact op voor de mogelijkheden</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="section-padding section-spacing-lg">
        <div className="container-wide">
          {/* Back Button, Share, and Car Title */}
          <div className="mb-8">
            {/* Back Button + Share */}
            <div className="mb-6 flex items-center justify-between">
              <Button asChild className="w-auto">
                <Link to="/aanbod" className="group">
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  Terug
                </Link>
              </Button>

              {/* Share Button */}
              <div className="relative">
                <Button
                  variant="default"
                  className="w-auto"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: carTitle,
                        text: `Bekijk deze ${carTitle} bij ${footerSettings?.company_name || BUSINESS.NAME}! €${car.prijs?.toLocaleString("nl-NL")}`,
                        url: window.location.href,
                      }).catch(() => {});
                    } else {
                      setShowShareMenu(!showShareMenu);
                    }
                  }}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Delen
                </Button>

                {/* Share Dropdown (desktop fallback) */}
                {showShareMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50 bg-background border border-border rounded-lg shadow-lg p-2 min-w-[200px]">
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md hover:bg-muted transition-colors text-left"
                        onClick={() => {
                          const text = `Bekijk deze ${carTitle} bij ${footerSettings?.company_name || BUSINESS.NAME}! €${car.prijs?.toLocaleString("nl-NL")}\n${window.location.href}`;
                          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                          setShowShareMenu(false);
                        }}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#25D366">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                      </button>
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md hover:bg-muted transition-colors text-left"
                        onClick={() => {
                          const subject = encodeURIComponent(carTitle);
                          const body = encodeURIComponent(`Bekijk deze ${carTitle} bij ${footerSettings?.company_name || BUSINESS.NAME}!\n\n€${car.prijs?.toLocaleString("nl-NL")}\n\n${window.location.href}`);
                          window.open(`mailto:?subject=${subject}&body=${body}`);
                          setShowShareMenu(false);
                        }}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="16" x="2" y="4" rx="2"/>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                        </svg>
                        E-mail
                      </button>
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md hover:bg-muted transition-colors text-left"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                          setShowShareMenu(false);
                        }}
                      >
                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Gekopieerd!" : "Link kopiëren"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Car Title */}
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold"
              style={{
                marginBottom: 'var(--spacing-component-sm)',
                color: 'var(--color-text-primary)'
              }}
            >
              {car.merk} {car.model}
            </h1>
            {car.type && (
              <p
                className="text-xl text-muted-foreground"
                style={{ marginBottom: 'var(--spacing-content-paragraph)' }}
              >
                {car.type}
              </p>
            )}
          </div>

          {/* Image Gallery */}
          <div className="mb-12">

            {/* Images Grid */}
            <div style={{ marginBottom: 'var(--spacing-component-md)' }}>
              {/* Large Images - First 3 */}
              {largeImages.length > 0 && (
                <div
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4"
                  style={{ gap: 'var(--spacing-grid-gap)' }}
                >
                  {largeImages.map((image: CarImage, index: number) => (
                    <div
                      key={`large-${index}`}
                      onClick={() => openLightbox(index)}
                      className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
                      style={{ borderRadius: 'var(--radius-card)' }}
                    >
                      <img
                        src={galleryUrl(image.url)}
                        alt={`${car.merk} ${car.model} - foto ${index + 1}`}
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Small Images - Rest */}
              {smallImages.length > 0 && (
                <div className="flex gap-1 overflow-x-auto py-2" style={{ gap: '4px' }}>
                  {smallImages.map((image: CarImage, index: number) => (
                    <div
                      key={`small-${index}`}
                      onClick={() => openLightbox(index + 3)} // Correct index for lightbox
                      className="flex-shrink-0 relative w-24 h-20 sm:w-20 sm:h-16 overflow-hidden rounded cursor-pointer"
                      style={{ borderRadius: '4px' }}
                    >
                      <img
                        src={thumbnailUrl(image.url)}
                        alt={`${car.merk} ${car.model} - foto ${index + 4}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Prijs en Specificaties - Onder afbeeldingen */}
          <div className="mb-8">
            {/* Prijs */}
            <div className="mb-8">
              <p
                className="text-3xl font-bold"
                style={{
                  color: 'var(--color-text-primary)'
                }}
              >
                {"\u20AC"} {car.prijs.toLocaleString('nl-NL')}
              </p>
            </div>

            {/* Specificaties */}
            <div className="flex gap-4 mb-4">
              <div style={{ paddingLeft: '0', paddingRight: '0', margin: '0', whiteSpace: 'nowrap' }}>
                <div style={{ color: 'var(--color-text-secondary)', marginBottom: '1px', fontSize: '14px', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', fontWeight: '700', paddingLeft: '0', paddingRight: '0', margin: '0' }}>Bouwjaar</div>
                <div style={{ color: 'var(--color-text-secondary)', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', paddingLeft: '0', paddingRight: '0', margin: '0' }}>
                  {car.bouwjaar}
                </div>
              </div>
              {car.kilometerstand && (
                <div style={{ paddingLeft: '0', paddingRight: '0', margin: '0', whiteSpace: 'nowrap' }}>
                  <div style={{ color: 'var(--color-text-secondary)', marginBottom: '1px', fontSize: '14px', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', fontWeight: '700', paddingLeft: '0', paddingRight: '0', margin: '0' }}>Kilometerstand</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', paddingLeft: '0', paddingRight: '0', margin: '0' }}>
                    {car.kilometerstand.toLocaleString('nl-NL')} km
                  </div>
                </div>
              )}
              {car.transmissie && (
                <div style={{ paddingLeft: '0', paddingRight: '0', margin: '0', whiteSpace: 'nowrap' }}>
                  <div style={{ color: 'var(--color-text-secondary)', marginBottom: '1px', fontSize: '14px', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', fontWeight: '700', paddingLeft: '0', paddingRight: '0', margin: '0' }}>Transmissie</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', paddingLeft: '0', paddingRight: '0', margin: '0' }}>
                    {car.transmissie}
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp CTA */}
            <div className="mb-8">
              <a
                href={`https://wa.me/${footerSettings?.whatsapp_number || BUSINESS.WHATSAPP_NUMBER}?text=${encodeURIComponent(`${footerSettings?.whatsapp_default_message || 'Hi Kees, ik heb wat vragen over'} de ${car.merk} ${car.model}:`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3"
              >
                <span
                  className="flex items-center justify-center w-10 h-10 rounded-full transition-opacity hover:opacity-80"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </span>
                <span
                  className="text-sm text-muted-foreground"
                  style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}
                >
                  Stel eenvoudig en vrijblijvend een vraag
                </span>
              </a>
            </div>
          </div>


        {/* Car Info */}
          <div style={{ marginBottom: 'var(--spacing-section-xl)' }}>
            <div style={{ marginTop: '24px' }}>
              {/* Simple Tab Navigation */}
              <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 mb-6 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0">
                <Button
                  variant="default"
                  className="w-full sm:w-auto"
                  style={{
                    backgroundColor: activeTab === 'omschrijving' || hoveredTab === 'omschrijving' ? 'var(--color-primary)' : 'var(--color-background)',
                    color: activeTab === 'omschrijving' || hoveredTab === 'omschrijving' ? 'var(--color-background)' : 'var(--color-secondary)',
                    borderColor: activeTab === 'omschrijving' || hoveredTab === 'omschrijving' ? 'var(--color-primary)' : 'var(--color-secondary)',
                  }}
                  onClick={() => setActiveTab('omschrijving')}
                  onMouseEnter={() => {
                    if (activeTab !== 'omschrijving') setHoveredTab('omschrijving');
                  }}
                  onMouseLeave={() => setHoveredTab(null)}
                >
                  Omschrijving
                </Button>
                <Button
                  variant="default"
                  className="w-full sm:w-auto"
                  style={{
                    backgroundColor: activeTab === 'opties' || hoveredTab === 'opties' ? 'var(--color-primary)' : 'var(--color-background)',
                    color: activeTab === 'opties' || hoveredTab === 'opties' ? 'var(--color-background)' : 'var(--color-secondary)',
                    borderColor: activeTab === 'opties' || hoveredTab === 'opties' ? 'var(--color-primary)' : 'var(--color-secondary)',
                  }}
                  onClick={() => setActiveTab('opties')}
                  onMouseEnter={() => {
                    if (activeTab !== 'opties') setHoveredTab('opties');
                  }}
                  onMouseLeave={() => setHoveredTab(null)}
                >
                  Opties en extra's
                </Button>
                <Button
                  variant="default"
                  className="w-full sm:w-auto"
                  style={{
                    backgroundColor: activeTab === 'techniek' || hoveredTab === 'techniek' ? 'var(--color-primary)' : 'var(--color-background)',
                    color: activeTab === 'techniek' || hoveredTab === 'techniek' ? 'var(--color-background)' : 'var(--color-secondary)',
                    borderColor: activeTab === 'techniek' || hoveredTab === 'techniek' ? 'var(--color-primary)' : 'var(--color-secondary)',
                  }}
                  onClick={() => setActiveTab('techniek')}
                  onMouseEnter={() => {
                    if (activeTab !== 'techniek') setHoveredTab('techniek');
                  }}
                  onMouseLeave={() => setHoveredTab(null)}
                >
                  Techniek
                </Button>
              </div>

              {/* Tab Content */}
              <div className="prose prose-sm max-w-none">
                {activeTab === 'omschrijving' && (
                  <div>
                    <div
                      className="relative"
                      style={{
                        position: 'relative'
                      }}
                    >
                      <div
                        className="whitespace-pre-wrap leading-relaxed"
                        style={{
                          color: 'var(--color-text-secondary)',
                          display: showFullDescription ? 'block' : '-webkit-box',
                          WebkitLineClamp: showFullDescription ? 'unset' : 7,
                          WebkitBoxOrient: 'vertical',
                          overflow: showFullDescription ? 'visible' : 'hidden',
                          margin: '0',
                          lineHeight: '1.6'
                        }}
                      >
                        {car.omschrijving}
                      </div>
                      {!showFullDescription && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '-20px',
                            left: 0,
                            right: 0,
                            height: '80px',
                            background: `linear-gradient(to bottom,
                              transparent 0%,
                              transparent 30%,
                              var(--color-background) 70%)`,
                              pointerEvents: 'none'
                          }}
                        />
                      )}
                    </div>
                    {car.omschrijving && car.omschrijving.length > 200 && (
                      <div className="flex justify-center mt-8">
                        <Button
                          className="btn-secondary flex items-center gap-2"
                          onClick={() => setShowFullDescription(!showFullDescription)}
                        >
                          {showFullDescription ? (
                            <>
                              <span>Lees minder</span>
                              <ChevronUp className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              <span>Lees meer</span>
                              <ChevronDown className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'opties' && (
                  <div>
                    {car.opties && car.opties.length > 0 ? (
                      <>
                        <div
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                          style={{
                            gap: '16px'
                          }}
                        >
                          {car.opties.map((optie: string, index: number) => {
                            // Bereken items per rij op basis van huidige breakpoint
                            const itemsPerRow = breakpoint === 'sm' ? 1 : breakpoint === 'md' ? 2 : 3;
                            const rowIndex = Math.floor(index / itemsPerRow);
                            const shouldShow = showAllOptions || rowIndex < 3;

                            return (
                              <div
                                key={index}
                                className="flex items-start gap-3 transition-all duration-300"
                                style={{
                                  gap: '12px',
                                  display: shouldShow ? 'flex' : 'none'
                                }}
                              >
                                <CheckCircle2
                                  className="h-6 w-6 flex-shrink-0 mt-0.5"
                                  style={{ color: 'var(--color-primary)' }}
                                />
                                <span
                                  className="leading-relaxed text-sm"
                                  style={{
                                    color: 'var(--color-text-secondary)',
                                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
                                  }}
                                >
                                  {optie}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Toon "Zie meer/Lees minder" knop als er meer dan 3 rijen zijn */}
                        {(() => {
                          const itemsPerRow = breakpoint === 'sm' ? 1 : breakpoint === 'md' ? 2 : 3;
                          const maxVisibleItems = 3 * itemsPerRow; // 3 rijen x items per rij
                          return car.opties!.length > maxVisibleItems;
                        })() && (
                          <div className="flex justify-center mt-8">
                            <Button
                              className="btn-secondary flex items-center gap-2"
                              onClick={() => setShowAllOptions(!showAllOptions)}
                            >
                              {showAllOptions ? (
                                <>
                                  <span>Zie minder</span>
                                  <ChevronUp className="h-4 w-4" />
                                </>
                              ) : (
                                <>
                                  <span>Zie meer</span>
                                  <ChevronDown className="h-4 w-4" />
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <p style={{ color: 'var(--color-text-secondary)' }}>
                        Geen opties beschikbaar.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'techniek' && (
                  <div>
                    {/* Twee kolommen met categorieen */}
                    <div
                      className="grid grid-cols-1 md:grid-cols-2 gap-8"
                      style={{ gap: '32px' }}
                    >
                      {/* Basis Specificaties */}
                      <div>
                        <p
                          className="text-xl text-muted-foreground mb-4"
                          style={{
                            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
                          }}
                        >
                          Basis Specificaties
                        </p>

                        <div
                          className="space-y-2"
                          style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}
                        >
                          {[
                            { label: "Merk", value: car.merk },
                            { label: "Model", value: car.model },
                            { label: "Type", value: car.type },
                            { label: "Voertuig Type", value: car.voertuig_type },
                            { label: "Bouwjaar", value: car.bouwjaar },
                            { label: "Kilometerstand", value: car.kilometerstand ? `${car.kilometerstand.toLocaleString('nl-NL')} km` : null },
                            { label: "Kleur", value: car.kleur },
                            { label: "Zitplaatsen", value: car.zitplaatsen ? `${car.zitplaatsen} personen` : null },
                            { label: "Deuren", value: car.deuren ? `${car.deuren} deuren` : null },
                            { label: "BTW auto", value: car.btw_auto ? "BTW verlaagd" : "BTW volledig" }
                          ].filter(item => item.value).map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center py-2 border-b"
                              style={{
                                borderColor: 'var(--color-border-primary)',
                                color: 'var(--color-text-secondary)',
                                fontSize: '14px',
                                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
                                fontWeight: '500'
                              }}
                            >
                              <span>{item.label}</span>
                              <span style={{ color: 'var(--color-text-primary)', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Prestaties & Motor */}
                      <div>
                        <p
                          className="text-xl text-muted-foreground mb-4"
                          style={{
                            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
                          }}
                        >
                          Prestaties & Motor
                        </p>

                        <div
                          className="space-y-2"
                          style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}
                        >
                          {[
                            { label: "Transmissie", value: car.transmissie },
                            { label: "Brandstof Type", value: car.brandstof_type },
                            { label: "Motor (cc)", value: car.motor_cc },
                            { label: "Cilinders", value: car.motor_cilinders },
                            { label: "Vermogen", value: car.vermogen_pk ? `${car.vermogen_pk} PK` : null },
                            { label: "Gewicht", value: car.gewicht_kg ? `${car.gewicht_kg.toLocaleString('nl-NL')} kg` : null },
                            { label: "Topsnelheid", value: car.topsnelheid_kmh ? `${car.topsnelheid_kmh} km/h` : null },
                            { label: "Acceleratie 0-100 km/h", value: car.acceleratie_0_100 ? `${car.acceleratie_0_100} sec` : null }
                          ].filter(item => item.value).map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center py-2 border-b"
                              style={{
                                borderColor: 'var(--color-border-primary)',
                                color: 'var(--color-text-secondary)',
                                fontSize: '14px',
                                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
                                fontWeight: '500'
                              }}
                            >
                              <span>{item.label}</span>
                              <span style={{ color: 'var(--color-text-primary)', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Legacy techniek field */}
                    {car.techniek && (
                      <div>
                        <p
                          className="text-xl text-muted-foreground mb-6"
                          style={{
                            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
                          }}
                        >
                          Extra Technische Informatie
                        </p>
                        <div
                          className="p-6 rounded-lg"
                          style={{
                            backgroundColor: 'var(--color-accent)',
                            border: '1px solid rgba(18, 52, 88, 0.1)'
                          }}
                        >
                          <p
                            className="whitespace-pre-wrap leading-relaxed"
                            style={{
                              color: 'var(--color-text-secondary)',
                              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
                            }}
                          >
                            {car.techniek}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Similar Cars Section */}
          {similarCars.length > 0 && (
            <div
              className="border-t border-border"
              style={{
                borderTopColor: 'var(--color-border-primary)',
                marginTop: 'var(--spacing-section-2xl)',
                paddingTop: 'var(--spacing-section-xl)'
              }}
            >
              <h2
                className="text-3xl font-bold mb-8"
                style={{
                  marginBottom: 'var(--spacing-section-md)',
                  color: 'var(--color-text-primary)'
                }}
              >
                Vergelijkbare auto's
              </h2>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                style={{ gap: 'var(--spacing-card-gap)' }}
              >
                {similarCars.map((similarCar) => (
                  <CarCard
                    key={similarCar.id}
                    id={similarCar.id}
                    merk={similarCar.merk}
                    model={similarCar.model}

                    bouwjaar={similarCar.bouwjaar}
                    kilometerstand={similarCar.kilometerstand || undefined}
                    prijs={similarCar.prijs}
                    car_images={similarCar.car_images}
                    opties={similarCar.opties || undefined}
                    brandstof_type={similarCar.brandstof_type || undefined}
                    transmissie={similarCar.transmissie || undefined}
                    binnenkort_beschikbaar={similarCar.binnenkort_beschikbaar || undefined}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

                {/* Lightbox Modal */}
          <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
            <DialogContent className="max-w-full w-full h-[100vh] p-0 bg-black border-0" style={{ borderRadius: '0' }} hideCloseButton={true}>
              {/* Accessibility components - completely hidden */}
              <DialogTitle className="sr-only">Afbeeldingen van {car.merk} {car.model}</DialogTitle>
              <DialogDescription className="sr-only">
                Gallerij met foto's van de {car.merk} {car.model}. Gebruik de pijltoetsen om door de afbeeldingen te navigeren.
              </DialogDescription>

              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute sm:top-4 sm:right-4 z-50 flex items-center justify-center rounded-full transition-all duration-200"
                style={{
                  cursor: 'pointer',
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-secondary)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  padding: 'var(--spacing-micro)',
                  margin: 'var(--spacing-micro)',
                  outline: 'none',
                  boxShadow: 'none',
                  top: 'var(--spacing-component-md)',
                  right: 'var(--spacing-component-md)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                  e.currentTarget.style.border = '1px solid var(--color-primary)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.querySelector('svg')!.style.color = 'var(--color-text-inverse)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-background)';
                  e.currentTarget.style.border = '1px solid var(--color-secondary)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.querySelector('svg')!.style.color = 'var(--color-text-primary)';
                }}
              >
                <X className="h-6 w-6" style={{ color: 'var(--color-text-primary)', transition: 'color 0.2s ease' }} />
              </button>

              <div className="relative w-full h-screen flex items-center justify-center">
                <button
                  onClick={prevImage}
                  className="absolute left-4 z-40 flex items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-secondary)',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    padding: 'var(--spacing-micro)',
                    margin: 'var(--spacing-micro)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    e.currentTarget.style.border = '1px solid var(--color-primary)';
                    e.currentTarget.querySelector('svg')!.style.color = 'var(--color-text-inverse)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-background)';
                    e.currentTarget.style.border = '1px solid var(--color-secondary)';
                    e.currentTarget.querySelector('svg')!.style.color = 'var(--color-text-primary)';
                  }}
                >
                  <ChevronLeft className="h-6 w-6" style={{ color: 'var(--color-text-primary)', transition: 'color 0.2s ease' }} />
                </button>

                <div className="relative w-full h-full">
                  {allImages?.map((image, idx) => {
                    const isVisible = idx === lightboxIndex;
                    const isAdjacent = Math.abs(idx - lightboxIndex) <= 1
                      || (lightboxIndex === 0 && idx === allImages.length - 1)
                      || (lightboxIndex === allImages.length - 1 && idx === 0);
                    if (!isVisible && !isAdjacent) return null;
                    return (
                      <img
                        key={idx}
                        src={lightboxUrl(image.url)}
                        alt={`${car.merk} ${car.model}`}
                        className={`absolute w-full h-full object-contain transition-transform duration-500 ease-in-out ${
                          idx === lightboxIndex
                            ? 'translate-x-0'
                            : lightboxDirection === 'next'
                              ? (idx < lightboxIndex ? '-translate-x-full' : 'translate-x-full')
                              : (idx > lightboxIndex ? 'translate-x-full' : '-translate-x-full')
                        }`}
                        style={{ maxWidth: '100vw', maxHeight: '100vh' }}
                      />
                    );
                  })}
                </div>

                <button
                  onClick={nextImage}
                  className="absolute right-4 z-40 flex items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-secondary)',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    padding: 'var(--spacing-micro)',
                    margin: 'var(--spacing-micro)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    e.currentTarget.style.border = '1px solid var(--color-primary)';
                    e.currentTarget.querySelector('svg')!.style.color = 'var(--color-text-inverse)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-background)';
                    e.currentTarget.style.border = '1px solid var(--color-secondary)';
                    e.currentTarget.querySelector('svg')!.style.color = 'var(--color-text-primary)';
                  }}
                >
                  <ChevronRight className="h-6 w-6" style={{ color: 'var(--color-text-primary)', transition: 'color 0.2s ease' }} />
                </button>

                <div
                  className="absolute left-1/2 -translate-x-1/2 sm:bottom-4 text-white text-sm px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    padding: 'var(--spacing-component-sm) var(--spacing-component-md)',
                    borderRadius: '20px',
                    color: 'var(--color-text-primary)',
                    bottom: 'var(--spacing-component-md)'
                  }}
                >
                  {lightboxIndex + 1} / {allImages.length}
                </div>
              </div>
            </DialogContent>
          </Dialog>

      {/* Proefrit Aanvraag Sectie - Volledige breedte boven footer */}
      <div
        className="w-full relative overflow-hidden"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-text-inverse)'
        }}
      >
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:min-h-[500px] min-h-[auto]">

            {/* Links: Formulier Sectie - Volledige breedte op mobiel */}
            <div className="flex flex-col justify-center items-center py-12 px-4 sm:px-8 md:px-16 lg:px-24">
            <div className="w-full max-w-lg mx-auto lg:max-w-none">
              <div className="mb-6 text-center">
                <h2
                  className="text-xl sm:text-2xl md:text-3xl font-bold"
                  style={{
                    color: 'var(--color-text-inverse)',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
                  }}
                >
                  Boek een proefrit
                </h2>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Naam en E-mail onder elkaar op mobiel, naast elkaar op desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Volledige naam */}
                  <div>
                    <Label
                      htmlFor="proefrit-naam"
                      className="text-base font-semibold mb-3 block"
                      style={{ color: 'var(--color-text-inverse)' }}
                    >
                      Volledige naam *
                    </Label>
                    <Input
                      id="proefrit-naam"
                      type="text"
                      value={formData.naam}
                      onChange={handleInputChange}
                      className={`${inputClass} ${formErrors.naam ? 'border-red-500' : ''}`}
                      placeholder="Uw volledige naam"
                      style={{
                        color: 'var(--color-secondary)',
                        backgroundColor: 'var(--color-background)',
                        lineHeight: '24px'
                      }}
                    />
                    {formErrors.naam && (
                      <div className="flex items-center gap-2 mt-2">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        <span className="text-sm text-red-400">{formErrors.naam}</span>
                      </div>
                    )}
                  </div>

                  {/* E-mailadres */}
                  <div>
                    <Label
                      htmlFor="proefrit-email"
                      className="text-base font-semibold mb-3 block"
                      style={{ color: 'var(--color-text-inverse)' }}
                    >
                      E-mailadres *
                    </Label>
                    <Input
                      id="proefrit-email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`${inputClass} ${formErrors.email ? 'border-red-500' : ''}`}
                      placeholder="uw.email@voorbeeld.nl"
                      style={{
                        color: 'var(--color-secondary)',
                        backgroundColor: 'var(--color-background)',
                        lineHeight: '24px'
                      }}
                    />
                    {formErrors.email && (
                      <div className="flex items-center gap-2 mt-2">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        <span className="text-sm text-red-400">{formErrors.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Telefoonnummer - Full width */}
                <div>
                  <Label
                    htmlFor="proefrit-telefoon"
                    className="text-base font-semibold mb-3 block"
                    style={{ color: 'var(--color-text-inverse)' }}
                  >
                    Telefoonnummer
                  </Label>
                  <Input
                    id="proefrit-telefoon"
                    type="tel"
                    value={formData.telefoon}
                    onChange={handleInputChange}
                    className={`${inputClass} ${formErrors.telefoon ? 'border-red-500' : ''}`}
                    placeholder="06-12345678"
                    style={{
                      color: 'var(--color-secondary)',
                      backgroundColor: 'var(--color-background)',
                      lineHeight: '24px'
                    }}
                  />
                  {formErrors.telefoon && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-red-400">{formErrors.telefoon}</span>
                    </div>
                  )}
                </div>

                {/* Success/Error Messages */}
                {submitStatus !== 'idle' && submitMessage && (
                  <div className={`p-4 rounded-lg flex items-center gap-3 ${
                    submitStatus === 'success'
                      ? 'bg-green-100 border border-green-300'
                      : 'bg-red-100 border border-red-300'
                  }`}>
                    {submitStatus === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${
                      submitStatus === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {submitMessage}
                    </span>
                  </div>
                )}

                {/* Submit Button - Exact same styling as Google button */}
                <Button
                  type="submit"
                  className="w-full font-semibold transition-all duration-200"
                  disabled={isSubmitting}
                  style={{
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Bezig met verzenden...
                    </>
                  ) : (
                    'Proefrit aanvragen'
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Rechts: Afbeelding Sectie - Alleen desktop */}
          <div className="relative h-auto lg:h-auto overflow-hidden hidden lg:block" style={{
            clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)'
          }}>
            {/* Desktop: Schuine overlap */}
            <div className="absolute inset-0 w-full h-full">
            {/* Afbeelding met object positioning voor framing */}
            <img
              src={largeImages[0]?.url || car.car_images?.[0]?.url}
              alt={`${car.merk} ${car.model}`}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                objectPosition: 'center 60%', // Verplaatst afbeelding naar boven (40% vanaf top)
                transform: 'scale(1.1)' // Light zoom voor betere framing
              }}
            />
            </div>
          </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CarDetail;
