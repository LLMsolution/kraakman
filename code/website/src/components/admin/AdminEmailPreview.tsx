import { useState } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { DEFAULT_FOOTER, DEFAULT_COLORS } from "@/data/contentDefaults";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Star, CarFront } from "lucide-react";

type EmailType = "contact" | "contact-confirm" | "feedback" | "testdrive" | "testdrive-confirm";

const EMAIL_TYPES: { id: EmailType; label: string; icon: typeof Mail; description: string }[] = [
  { id: "contact", label: "Contact (intern)", icon: Mail, description: "Email naar het bedrijf bij nieuw contactbericht" },
  { id: "contact-confirm", label: "Contact (klant)", icon: MessageSquare, description: "Bevestigingsmail naar de klant" },
  { id: "feedback", label: "Feedback", icon: Star, description: "Email naar het bedrijf bij nieuwe feedback" },
  { id: "testdrive", label: "Proefrit (intern)", icon: CarFront, description: "Email naar het bedrijf bij proefrit aanvraag" },
  { id: "testdrive-confirm", label: "Proefrit (klant)", icon: CarFront, description: "Bevestigingsmail naar de klant" },
];

const MOCK = {
  name: "Jan de Vries",
  email: "jan@voorbeeld.nl",
  phone: "06-12345678",
  message: "Goedendag,\n\nIk ben geïnteresseerd in de Volkswagen Golf die op uw website staat. Kunt u mij meer informatie geven over de staat van de auto en of een proefrit mogelijk is?\n\nMet vriendelijke groet,\nJan de Vries",
  rating: 4,
  feedback: "Goede service gehad! De auto was precies zoals beschreven en de afhandeling ging snel en professioneel. Enige minpuntje was de wachttijd bij het ophalen.",
  carBrand: "Volkswagen",
  carModel: "Golf 1.4 TSI Comfortline",
  carYear: 2021,
  carPrice: 24950,
  carImage: "https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?w=600&h=300&fit=crop",
  timestamp: new Date().toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam" }),
};

function sanitize(s: string): string {
  return s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#x27;" }[c]!));
}

function buildBrand(colors: any, footer: any) {
  return {
    name: footer?.company_name || DEFAULT_FOOTER.company_name,
    primary: colors?.primary || DEFAULT_COLORS.primary,
    background: colors?.background || DEFAULT_COLORS.background,
    phone: footer?.phone || DEFAULT_FOOTER.phone,
    address: footer?.address_line1 && footer?.address_line2
      ? `${footer.address_line1}, ${footer.address_line2}`
      : `${DEFAULT_FOOTER.address_line1}, ${DEFAULT_FOOTER.address_line2}`,
  };
}

function generateEmailHtml(type: EmailType, brand: ReturnType<typeof buildBrand>): string {
  const wrapper = (header: string, content: string, footerText: string) => `
    <!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f5f5f5;">
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${brand.background}; padding: 32px;">
      <div style="background: white; border-radius: 8px; overflow: hidden;">
        <div style="background-color: ${brand.primary}; padding: 24px 32px;">
          <h2 style="color: white; margin: 0; font-size: 20px;">${header}</h2>
        </div>
        <div style="padding: 32px;">${content}</div>
        <div style="padding: 16px 32px; border-top: 1px solid #eee;">
          <p style="margin: 0; font-size: 12px; color: #999; text-align: center;">${footerText}</p>
        </div>
      </div>
    </div>
    </body></html>`;

  const sectionBox = (title: string, body: string) => `
    <div style="background-color: ${brand.background}; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
      <h3 style="color: ${brand.primary}; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">${title}</h3>
      ${body}
    </div>`;

  const safeName = sanitize(MOCK.name);
  const safeEmail = sanitize(MOCK.email);
  const safeMessage = sanitize(MOCK.message);
  const safeFeedback = sanitize(MOCK.feedback);
  const stars = "\u2B50".repeat(MOCK.rating);
  const carTitle = `${MOCK.carYear} ${MOCK.carBrand} ${MOCK.carModel}`;
  const carPrice = `\u20AC${MOCK.carPrice.toLocaleString("nl-NL")}`;

  switch (type) {
    case "contact":
      return wrapper("Nieuw Contactbericht",
        sectionBox("Afzender", `
          <p style="margin: 0 0 6px 0; color: #555;"><strong>Naam:</strong> ${safeName}</p>
          <p style="margin: 0; color: #555;"><strong>E-mail:</strong> ${safeEmail}</p>
        `) +
        sectionBox("Bericht", `<p style="margin: 0; line-height: 1.6; color: #333; white-space: pre-wrap;">${safeMessage}</p>`),
        `Verzonden via het contactformulier op de website &middot; ${MOCK.timestamp}`
      );

    case "contact-confirm":
      return wrapper(brand.name,
        `<h3 style="color: #333; margin: 0 0 16px 0; font-size: 18px;">Bedankt voor uw bericht, ${safeName}!</h3>
        <p style="color: #555; line-height: 1.6; margin: 0 0 16px 0;">
          We hebben uw bericht in goede orde ontvangen. We streven ernaar om zo snel mogelijk te reageren, meestal binnen 1 werkdag.
        </p>` +
        sectionBox("Uw bericht", `<p style="margin: 0; line-height: 1.6; color: #333; white-space: pre-wrap; font-style: italic;">${safeMessage}</p>`) +
        `<p style="color: #555; line-height: 1.6; margin: 0 0 24px 0;">
          Heeft u een dringende vraag? Bel ons gerust op <strong>${brand.phone}</strong>.
        </p>
        <div style="border-top: 1px solid #eee; padding-top: 20px;">
          <p style="color: #555; margin: 0; line-height: 1.6;">
            Met vriendelijke groet,<br>
            <strong>${brand.name}</strong><br>
            <span style="font-size: 14px; color: #999;">${brand.address}</span>
          </p>
        </div>`,
        `Verzonden via het contactformulier op de website &middot; ${MOCK.timestamp}`
      );

    case "feedback":
      return wrapper("Nieuwe Feedback Ontvangen",
        `<div style="background-color: ${brand.background}; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 24px; text-align: center;">${stars}</p>
          <p style="margin: 8px 0 0 0; text-align: center; color: #555; font-size: 16px; font-weight: 600;">${MOCK.rating} van 5 sterren</p>
        </div>` +
        sectionBox("Feedback", `<p style="margin: 0; line-height: 1.6; color: #333; white-space: pre-wrap;">${safeFeedback}</p>`),
        `Verzonden via de review popup op de website &middot; ${MOCK.timestamp}`
      );

    case "testdrive":
      return wrapper("Nieuwe Proefrit Aanvraag",
        `<p style="color: #333; font-size: 16px; margin: 0 0 24px 0;">
          <strong>${safeName}</strong> wil graag een proefrit plannen.
        </p>
        <div style="border-radius: 6px; overflow: hidden; margin-bottom: 24px;">
          <img src="${MOCK.carImage}" alt="${carTitle}" style="width: 100%; height: auto; display: block; max-height: 300px; object-fit: cover;" />
        </div>` +
        sectionBox("Auto", `
          <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #333;">${carTitle}</p>
          <p style="margin: 0; font-size: 16px; color: ${brand.primary}; font-weight: 600;">${carPrice}</p>
        `) +
        sectionBox("Contactgegevens", `
          <p style="margin: 0 0 6px 0; color: #555;"><strong>Naam:</strong> ${safeName}</p>
          <p style="margin: 0 0 6px 0; color: #555;"><strong>E-mail:</strong> ${safeEmail}</p>
          <p style="margin: 0; color: #555;"><strong>Telefoon:</strong> ${sanitize(MOCK.phone)}</p>
        `),
        `Verzonden via het proefrit formulier &middot; ${MOCK.timestamp}`
      );

    case "testdrive-confirm":
      return wrapper(brand.name,
        `<h3 style="color: #333; margin: 0 0 16px 0; font-size: 18px;">Bedankt voor uw aanvraag, ${safeName}!</h3>
        <p style="color: #555; line-height: 1.6; margin: 0 0 24px 0;">
          We hebben uw proefrit aanvraag ontvangen. We nemen zo snel mogelijk contact met u op om een afspraak in te plannen.
        </p>
        <div style="border-radius: 6px; overflow: hidden; margin-bottom: 24px;">
          <img src="${MOCK.carImage}" alt="${carTitle}" style="width: 100%; height: auto; display: block; max-height: 300px; object-fit: cover;" />
        </div>` +
        sectionBox("Auto", `
          <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #333;">${carTitle}</p>
          <p style="margin: 0; font-size: 16px; color: ${brand.primary}; font-weight: 600;">${carPrice}</p>
        `) +
        `<div style="border-top: 1px solid #eee; padding-top: 20px;">
          <p style="color: #555; margin: 0; line-height: 1.6;">
            Met vriendelijke groet,<br>
            <strong>${brand.name}</strong><br>
            <span style="font-size: 14px; color: #999;">${brand.address}</span>
          </p>
        </div>`,
        `Verzonden via het proefrit formulier &middot; ${MOCK.timestamp}`
      );
  }
}

const AdminEmailPreview = () => {
  const [activeType, setActiveType] = useState<EmailType>("contact");
  const { colors, footerSettings } = useSiteSettings();

  const brand = buildBrand(colors, footerSettings);
  const html = generateEmailHtml(activeType, brand);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Email Preview
        </h2>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Bekijk hoe de emails eruitzien met je huidige thema-instellingen. Dit zijn voorbeelden met testdata — er wordt niets verstuurd.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {EMAIL_TYPES.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeType === id ? "secondary" : "outline"}
            size="sm"
            onClick={() => setActiveType(id)}
          >
            <Icon className="w-4 h-4 mr-1.5" />
            {label}
          </Button>
        ))}
      </div>

      <p className="text-xs mb-3" style={{ color: "var(--color-text-secondary)" }}>
        {EMAIL_TYPES.find((t) => t.id === activeType)?.description}
      </p>

      <div className="border rounded-lg overflow-hidden" style={{ borderColor: "var(--color-border-primary)" }}>
        <iframe
          srcDoc={html}
          title="Email preview"
          className="w-full border-0"
          style={{ height: "700px", background: "#f5f5f5" }}
        />
      </div>
    </div>
  );
};

export default AdminEmailPreview;
