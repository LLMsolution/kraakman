import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { logger } from "@/utils/logger";
import { BUSINESS } from "@/config/business";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { phoneToHref } from "@/services/siteSettingsService";
import SEO, { buildBreadcrumbSchema } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import Turnstile from "@/components/Turnstile";

const Contact = () => {
  const { toast } = useToast();
  const { pageHeaders, footerSettings } = useSiteSettings();
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    naam: "",
    email: "",
    bericht: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      logger.userAction('submit_contact_form', {
        email: formData.email,
        hasMessage: formData.bericht.length > 0
      });

      const { data, error } = await supabase.functions.invoke("send-contact", {
        body: {
          naam: formData.naam,
          email: formData.email,
          bericht: formData.bericht,
          turnstileToken,
        },
      });

      if (error) throw error;

      logger.info('Contact form submitted successfully', {
        email: formData.email
      });

      toast({
        title: "Bericht verzonden!",
        description: data?.warning
          ? "We hebben uw bericht ontvangen, maar de bevestigingsmail kon niet worden verzonden."
          : "We nemen zo spoedig mogelijk contact met u op."
      });
      setFormData({ naam: "", email: "", bericht: "" });
      setTurnstileToken(null);
    } catch (error) {
      logger.error('Error submitting contact form', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: formData.email
      });

      toast({
        title: "Er ging iets mis",
        description: "Probeer het later opnieuw of neem direct contact met ons op.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Contact - Neem contact op"
        description="Neem contact op met Auto Service van der Waals in Wieringerwaard. Bel 06-26 344 965 of stuur een bericht. Zuid Zijperweg 66, 1766 HD Wieringerwaard."
        path="/contact"
        schema={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <Navigation />

      {/* Hero Section */}
      <section
        className="section-padding bg-primary text-primary-foreground"
        style={{
          paddingTop: 'var(--spacing-hero-padding)',    /* 96px top */
          paddingBottom: 'var(--spacing-hero-padding)' /* 96px bottom - equal to top */
        }}
      >
        <div className="container-wide text-center">
          <h1 className="text-5xl font-bold mb-6">{pageHeaders?.contact_title || "Neem contact op"}</h1>
          <p className="text-xl opacity-90 leading-relaxed">
            {pageHeaders?.contact_subtitle || "Heeft u vragen over ons aanbod, onderhoud of LPG installaties? Wij staan voor u klaar met persoonlijk advies en professionele service."}
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <div className="border-b border-border bg-muted/30">
        <div className="container-wide section-padding py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((footerSettings?.address_line1 || BUSINESS.ADDRESS_STREET) + ' ' + (footerSettings?.address_line2 || BUSINESS.ADDRESS_POSTAL + ' ' + BUSINESS.ADDRESS_CITY))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-background border border-border p-8 cursor-pointer"
            >
              <MapPin className="h-8 w-8 mb-4 text-primary" />
              <h3 className="font-bold text-lg mb-3">Bezoekadres</h3>
              <p className="text-muted-foreground leading-relaxed">
                {footerSettings?.address_line1 || BUSINESS.ADDRESS_STREET}<br />
                {footerSettings?.address_line2 || `${BUSINESS.ADDRESS_POSTAL} ${BUSINESS.ADDRESS_CITY}`}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {footerSettings?.opening_days || "Maandag - Vrijdag"}: {footerSettings?.opening_hours || "08:00 - 17:00 uur"}<br />
                {footerSettings?.opening_note || "Op afspraak"}
              </p>
            </a>

            <a
              href={phoneToHref(footerSettings?.phone || BUSINESS.PHONE)}
              className="block bg-background border border-border p-8 cursor-pointer"
            >
              <Phone className="h-8 w-8 mb-4 text-primary" />
              <h3 className="font-bold text-lg mb-3">Telefoon</h3>
              <p className="text-muted-foreground">
                {footerSettings?.phone || BUSINESS.PHONE}{footerSettings?.phone_name && ` (${footerSettings.phone_name})`}
                {footerSettings?.phone2 && <><br />{footerSettings.phone2}{footerSettings?.phone2_name && ` (${footerSettings.phone2_name})`}</>}
              </p>
            </a>

            <a
              href={`mailto:${footerSettings?.email || BUSINESS.EMAIL}`}
              className="block bg-background border border-border p-8 cursor-pointer"
            >
              <Mail className="h-8 w-8 mb-4 text-primary" />
              <h3 className="font-bold text-lg mb-3">E-mail</h3>
              <p className="text-muted-foreground break-all">
                {footerSettings?.email || BUSINESS.EMAIL}
              </p>
            </a>

            <a
              href={`https://wa.me/${footerSettings?.whatsapp_number || BUSINESS.WHATSAPP_NUMBER}?text=${encodeURIComponent(footerSettings?.whatsapp_default_message || 'Hi Kees, ik heb een vraag:')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-background border border-border p-8 cursor-pointer"
            >
              <svg className="h-8 w-8 mb-4 text-primary" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#25D366' }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <h3 className="font-bold text-lg mb-3">WhatsApp</h3>
              <p className="text-muted-foreground">
                {footerSettings?.whatsapp_button_text || "Direct chatten met Kees"}
              </p>
            </a>
          </div>
        </div>
      </div>

      {/* Contact Form & Map Section */}
      <div className="container-wide section-padding py-16">
        <div className="lg:flex lg:gap-16">
          {/* Left Column - Form */}
          <div className="lg:w-1/2">
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {footerSettings?.contact_form_title || "Stuur ons een bericht"}
              </h2>
              <p className="text-lg text-muted-foreground">
                {footerSettings?.contact_form_subtitle || "Vul het formulier in en we nemen zo spoedig mogelijk contact met u op."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="naam" className="text-base font-semibold mb-3 block">
                  Naam *
                </Label>
                <Input
                  id="naam"
                  type="text"
                  required
                  className="kraakman-input"
                  value={formData.naam}
                  onChange={e => setFormData({
                    ...formData,
                    naam: e.target.value
                  })}
                  placeholder="Uw volledige naam"
                  style={{ lineHeight: '24px' }}
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-base font-semibold mb-3 block">
                  E-mailadres *
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  className="kraakman-input"
                  value={formData.email}
                  onChange={e => setFormData({
                    ...formData,
                    email: e.target.value
                  })}
                  placeholder="uw.email@voorbeeld.nl"
                  style={{ lineHeight: '24px' }}
                />
              </div>

              <div>
                <Label htmlFor="bericht" className="text-base font-semibold mb-3 block">
                  Bericht *
                </Label>
                <Textarea
                  id="bericht"
                  required
                  className="kraakman-textarea"
                  value={formData.bericht}
                  onChange={e => setFormData({
                    ...formData,
                    bericht: e.target.value
                  })}
                  placeholder="Waar kunnen wij u mee helpen?"
                  rows={8}
                />
              </div>

              <Turnstile
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken(null)}
              />

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button type="submit" variant="secondary" className="w-full" disabled={loading || (!!import.meta.env.VITE_TURNSTILE_SITE_KEY && !turnstileToken)}>
                  {loading ? "Verzenden..." : "Verstuur bericht"}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Door dit formulier te verzenden gaat u akkoord met onze privacy voorwaarden.
                Wij behandelen uw gegevens vertrouwelijk.
              </p>
            </form>
          </div>

          {/* Right Column - Map */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4">
                {footerSettings?.contact_map_title || "Locatie"}
              </h2>
              <p className="text-muted-foreground text-lg">
                {footerSettings?.contact_map_subtitle || "Wij zijn gevestigd in Wieringerwaard, makkelijk bereikbaar vanuit de regio."}
              </p>
            </div>

            <div className="flex-1 border border-border bg-background overflow-hidden" style={{ minHeight: '400px' }}>
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent((footerSettings?.address_line1 || BUSINESS.ADDRESS_STREET) + ' ' + (footerSettings?.address_line2 || BUSINESS.ADDRESS_POSTAL + ' ' + BUSINESS.ADDRESS_CITY))}&z=15&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps - Auto Service van der Waals"
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;