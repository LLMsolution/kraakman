import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, X, ChevronLeft, ChevronRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import CarCard from "@/components/CarCard";

// Custom styling voor consistente input velden zonder focus/hover effects
const inputClass = "h-12 border border-black bg-[#F1EFEC] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-black hover:border-black transition-none leading-6 px-4 py-3";

// Define proper TypeScript interfaces
interface CarImage {
  url: string;
}

interface Car {
  id: string;
  merk: string;
  model: string;
  type?: string;
  bouwjaar: number;
  kilometerstand?: number;
  prijs: number;
  omschrijving?: string;
  opties?: string[];
  techniek?: string;
  voertuig_type?: string;
  transmissie?: string;
  kleur?: string;
  zitplaatsen?: number;
  deuren?: number;
  brandstof_type?: string;
  btw_auto?: boolean;
  motor_cc?: number;
  motor_cilinders?: number;
  vermogen_pk?: number;
  gewicht_kg?: number;
  topsnelheid_kmh?: number;
  acceleratie_0_100?: number;
  binnenkort_beschikbaar?: boolean;
  car_images: CarImage[];
}

const CarDetail = () => {
  const { id } = useParams<string>();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [similarCars, setSimilarCars] = useState<Car[]>([]);
  const [activeTab, setActiveTab] = useState('omschrijving');
  const [showFullDescription, setShowFullDescription] = useState(false);

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

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const { data, error } = await supabase
          .from('cars')
          .select('*, car_images (url)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setCar(data);

        // Fetch similar cars (same brand or similar price range)
        if (data) {
          const { data: similar } = await supabase
            .from('cars')
            .select('*, car_images (url)')
            .eq('status', 'aanbod')
            .neq('id', id)
            .or(`merk.eq.${data.merk},and(prijs.gte.${data.prijs * 0.7},prijs.lte.${data.prijs * 1.3})`)
            .limit(3);

          if (similar) setSimilarCars(similar);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCar();
  }, [id]);

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
            <h1 className="text-2xl">Auto niet gevonden</h1>
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
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setLightboxIndex((prev: number) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev: number) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard navigation when lightbox is open and there are images
      if (lightboxOpen && allImages.length > 1) {
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault(); // Prevent default browser behavior
            prevImage();
            break;
          case 'ArrowRight':
            event.preventDefault(); // Prevent default browser behavior
            nextImage();
            break;
          case 'Escape':
            event.preventDefault(); // Close lightbox on Escape
            setLightboxOpen(false);
            break;
        }
      }
    };

    // Add event listener when component mounts
    window.addEventListener('keydown', handleKeyDown);

    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxOpen, allImages.length, prevImage, nextImage]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace('proefrit-', '');

    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear error for this field when user starts typing
    if (formErrors[fieldName]) {
      setFormErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

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
      const { error } = await supabase.functions.invoke('send-test-drive-email', {
        body: {
          recipientEmail: 'info@autoservicevanderwaals.nl',
          subject: `Proefrit aanvraag: ${car.merk} ${car.model}`,
          naam: formData.naam,
          email: formData.email,
          telefoon: formData.telefoon,
          carMerk: car.merk,
          carModel: car.model,
          carId: car.id,
          carPrijs: car.prijs
        }
      });

      if (error) {
        throw error;
      }

      setSubmitStatus('success');
      setSubmitMessage('Uw proefrit aanvraag is succesvol verzonden! We nemen zo snel mogelijk contact met u op.');

      // Reset form
      setFormData({ naam: '', telefoon: '', email: '' });
      setFormErrors({});

    } catch (error) {
      console.error('Error submitting test drive request:', error);
      setSubmitStatus('error');
      setSubmitMessage('Er is een fout opgetreden bij het verzenden van uw aanvraag. Probeer het opnieuw of neem rechtstreeks contact met ons op.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
          {/* Back Button and Car Title */}
          <div className="mb-8">
            {/* Back Button */}
            <div className="mb-6">
                  <Button asChild className="w-auto">
                <Link to="/aanbod" className="group">
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  Terug
                </Link>
              </Button>
            </div>

            {/* Car Title */}
            <h1
              className="text-4xl md:text-5xl font-bold"
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
                  className="grid md:grid-cols-2 lg:grid-cols-3 mb-4"
                  style={{ gap: 'var(--spacing-grid-gap)' }}
                >
                  {largeImages.map((image: CarImage, index: number) => (
                    <div
                      key={`large-${index}`}
                      onClick={() => openLightbox(index)}
                      className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
                      style={{ borderRadius: 'var(--radius)' }}
                    >
                      <img
                        src={image.url}
                        alt={`${car.merk} ${car.model} - foto ${index + 1}`}
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
                      className="flex-shrink-0 relative w-20 h-16 overflow-hidden rounded cursor-pointer"
                      style={{ borderRadius: '4px' }}
                    >
                      <img
                        src={image.url}
                        alt={`${car.merk} ${car.model} - foto ${index + 4}`}
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
                € {car.prijs.toLocaleString('nl-NL')}
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
          </div>

          {/* Extra vertical space */}
          <div style={{ marginBottom: '32px' }}></div>

        {/* Car Info */}
          <div style={{ marginBottom: 'var(--spacing-section-xl)' }}>
            <div style={{ marginTop: '24px' }}>
              {/* Simple Tab Navigation */}
              <div className="flex gap-4 mb-6">
                <Button
                  className="btn-secondary"
                  style={{
                    backgroundColor: activeTab === 'omschrijving' ? 'var(--color-primary) !important' : '',
                    color: activeTab === 'omschrijving' ? 'var(--color-text-inverse) !important' : '',
                    borderColor: activeTab === 'omschrijving' ? 'var(--color-primary) !important' : '',
                    boxShadow: activeTab === 'omschrijving' ? 'none' : '',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onClick={() => setActiveTab('omschrijving')}
                >
                  Omschrijving
                </Button>
                <Button
                  className="btn-secondary"
                  style={{
                    backgroundColor: activeTab === 'opties' ? 'var(--color-primary) !important' : '',
                    color: activeTab === 'opties' ? 'var(--color-text-inverse) !important' : '',
                    borderColor: activeTab === 'opties' ? 'var(--color-primary) !important' : '',
                    boxShadow: activeTab === 'opties' ? 'none' : '',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onClick={() => setActiveTab('opties')}
                >
                  Opties en extra's
                </Button>
                <Button
                  className="btn-secondary"
                  style={{
                    backgroundColor: activeTab === 'techniek' ? 'var(--color-primary) !important' : '',
                    color: activeTab === 'techniek' ? 'var(--color-text-inverse) !important' : '',
                    borderColor: activeTab === 'techniek' ? 'var(--color-primary) !important' : '',
                    boxShadow: activeTab === 'techniek' ? 'none' : '',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onClick={() => setActiveTab('techniek')}
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
                          className="btn-secondary"
                          onClick={() => setShowFullDescription(!showFullDescription)}
                        >
                          {showFullDescription ? 'Lees minder' : 'Lees meer'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'opties' && (
                  <div>
                    {car.opties && car.opties.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ gap: '16px' }}>
                        {car.opties.map((optie: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-3"
                            style={{ gap: '12px' }}
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
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--color-text-secondary)' }}>
                        Geen opties beschikbaar.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'techniek' && (
                  <div>
                    {/* Twee kolommen met categorieën */}
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
                            backgroundColor: 'rgba(18, 52, 88, 0.03)',
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
                className="grid md:grid-cols-2 lg:grid-cols-3"
                style={{ gap: 'var(--spacing-card-gap)' }}
              >
                {similarCars.map((similarCar) => (
                  <CarCard
                    key={similarCar.id}
                    id={similarCar.id}
                    merk={similarCar.merk}
                    model={similarCar.model}
                    type={similarCar.type || undefined}
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
                className="absolute top-4 right-4 z-50 flex items-center justify-center rounded-full transition-all duration-200"
                style={{
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  padding: 'var(--spacing-micro)',
                  margin: 'var(--spacing-micro)',
                  outline: 'none',
                  boxShadow: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                  e.currentTarget.style.border = '1px solid var(--color-primary)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.querySelector('svg').style.color = 'var(--color-text-inverse)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.border = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.querySelector('svg').style.color = 'var(--color-text-primary)';
                }}
              >
                <X className="h-5 w-5" style={{ color: 'var(--color-text-primary)', transition: 'color 0.2s ease' }} />
              </button>

              <div className="relative w-full h-screen flex items-center justify-center">
                <button
                  onClick={prevImage}
                  className="absolute left-4 z-40 flex items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-secondary)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    padding: 'var(--spacing-micro)',
                    margin: 'var(--spacing-micro)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    e.currentTarget.style.border = '1px solid var(--color-primary)';
                    e.currentTarget.querySelector('svg').style.color = 'var(--color-text-inverse)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-background)';
                    e.currentTarget.style.border = '1px solid var(--color-secondary)';
                    e.currentTarget.querySelector('svg').style.color = 'var(--color-text-primary)';
                  }}
                >
                  <ChevronLeft className="h-5 w-5" style={{ color: 'var(--color-text-primary)', transition: 'color 0.2s ease' }} />
                </button>

                <img
                  src={allImages[lightboxIndex]?.url}
                  alt={`${car.merk} ${car.model}`}
                  className="w-full h-full object-contain"
                  style={{ maxWidth: '100vw', maxHeight: '100vh' }}
                />

                <button
                  onClick={nextImage}
                  className="absolute right-4 z-40 flex items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-secondary)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    padding: 'var(--spacing-micro)',
                    margin: 'var(--spacing-micro)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                    e.currentTarget.style.border = '1px solid var(--color-primary)';
                    e.currentTarget.querySelector('svg').style.color = 'var(--color-text-inverse)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-background)';
                    e.currentTarget.style.border = '1px solid var(--color-secondary)';
                    e.currentTarget.querySelector('svg').style.color = 'var(--color-text-primary)';
                  }}
                >
                  <ChevronRight className="h-5 w-5" style={{ color: 'var(--color-text-primary)', transition: 'color 0.2s ease' }} />
                </button>

                <div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    padding: 'var(--spacing-component-sm) var(--spacing-component-md)',
                    borderRadius: '20px',
                    color: 'var(--color-text-primary)'
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[500px]">

            {/* Links: Formulier Sectie - Footer alignment (48px 96px) */}
            <div className="flex flex-col justify-center items-center py-12 md:py-12 lg:py-24 xl:py-24" style={{ paddingLeft: '96px', paddingRight: '96px' }}>
            <div className="w-full">
              <div className="mb-8 text-center">
                <h2
                  className="text-3xl font-bold"
                  style={{
                    color: 'var(--color-text-inverse)',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
                  }}
                >
                  Boek een proefrit
                </h2>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Naam en E-mail naast elkaar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Rechts: Afbeelding Sectie - Schuine overlap over blauwe kaart */}
          <div className="relative h-64 lg:h-auto overflow-hidden" style={{
            clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)'
          }}>
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

      <Footer />
    </div>
  );
};

export default CarDetail;