import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { logger } from "@/utils/logger";

const Contact = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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

      // Simulate sending email
      setTimeout(() => {
        logger.info('Contact form submitted successfully', {
          email: formData.email
        });

        toast({
          title: "Bericht verzonden!",
          description: "We nemen zo spoedig mogelijk contact met u op."
        });
        setFormData({
          naam: "",
          email: "",
          bericht: ""
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      logger.error('Error submitting contact form', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: formData.email
      });

      toast({
        title: "Er ging iets mis",
        description: "Probeer het later opnieuw.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="text-5xl font-bold mb-6">Neem contact op</h1>
          <p className="text-xl opacity-90 leading-relaxed">
            Heeft u vragen over ons aanbod, onderhoud of LPG installaties?<br/>
            Wij staan voor u klaar met persoonlijk advies en professionele service.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <div className="border-b border-border bg-muted/30">
        <div className="container-wide section-padding py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Zuid+Zijperweg+66+1766+HD+Wieringerwaard"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-background border border-border p-8 cursor-pointer"
            >
              <MapPin className="h-8 w-8 mb-4 text-primary" />
              <h3 className="font-bold text-lg mb-3">Bezoekadres</h3>
              <p className="text-muted-foreground leading-relaxed">
                Zuid Zijperweg 66<br />
                1766 HD Wieringerwaard
              </p>
              <p className="text-sm text-muted-foreground">
                Ma - Vr: 08:00 - 17:00<br />
                Op afspraak
              </p>
            </a>

            <a
              href="tel:0626344965"
              className="block bg-background border border-border p-8 cursor-pointer"
            >
              <Phone className="h-8 w-8 mb-4 text-primary" />
              <h3 className="font-bold text-lg mb-3">Telefoon</h3>
              <p className="text-muted-foreground">
                06-26 344 965<br />
                Bel gerust
              </p>
            </a>

            <a
              href="mailto:info@autoservicevanderwaals.nl"
              className="block bg-background border border-border p-8 cursor-pointer"
            >
              <Mail className="h-8 w-8 mb-4 text-primary" />
              <h3 className="font-bold text-lg mb-3">E-mail</h3>
              <p className="text-muted-foreground break-all">
                info@autoservicevanderwaals.nl
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
                Stuur ons een bericht
              </h2>
              <p className="text-lg text-muted-foreground">
                Vul het formulier in en we nemen zo spoedig mogelijk contact met u op.
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

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
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
                Locatie
              </h2>
              <p className="text-muted-foreground text-lg">
                Wij zijn gevestigd in Wieringerwaard, makkelijk bereikbaar vanuit de regio.
              </p>
            </div>

            <div className="flex-1 border border-border bg-background overflow-hidden">
              <iframe
                src="https://maps.google.com/maps?q=Zuid+Zijperweg+66+Wieringerwaard&z=15&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
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