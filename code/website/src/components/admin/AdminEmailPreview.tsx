import { useState, useEffect, useCallback } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { DEFAULT_FOOTER, DEFAULT_EMAIL_TEMPLATES } from "@/data/contentDefaults";
import { siteSettingsService, type EmailTemplateSettings } from "@/services/siteSettingsService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Star, CarFront, Save, RotateCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type EmailType = "contact" | "contact-confirm" | "feedback" | "testdrive" | "testdrive-confirm";

const EMAIL_TYPES: { id: EmailType; label: string; icon: typeof Mail; description: string }[] = [
  { id: "contact", label: "Contact (intern)", icon: Mail, description: "Email naar het bedrijf bij nieuw contactbericht" },
  { id: "contact-confirm", label: "Contact (klant)", icon: MessageSquare, description: "Bevestigingsmail naar de klant" },
  { id: "feedback", label: "Feedback (intern)", icon: Star, description: "Email naar het bedrijf bij nieuwe feedback — geen mail naar klant" },
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

function replacePlaceholders(text: string, brand: Brand): string {
  return text
    .replace(/\{naam\}/g, sanitize(MOCK.name))
    .replace(/\{telefoon\}/g, brand.phone)
    .replace(/\{bedrijfsnaam\}/g, brand.name)
    .replace(/\{adres\}/g, brand.address)
    .replace(/\{auto\}/g, `${MOCK.carYear} ${MOCK.carBrand} ${MOCK.carModel}`);
}

interface Brand {
  name: string;
  primary: string;
  background: string;
  phone: string;
  address: string;
}

function buildBrand(colors: any, footer: any): Brand {
  return {
    name: footer?.company_name || DEFAULT_FOOTER.company_name,
    primary: colors?.primary || "#123458",
    background: colors?.background || "#F1EFEC",
    phone: footer?.phone || DEFAULT_FOOTER.phone,
    address: footer?.address_line1 && footer?.address_line2
      ? `${footer.address_line1}, ${footer.address_line2}`
      : `${DEFAULT_FOOTER.address_line1}, ${DEFAULT_FOOTER.address_line2}`,
  };
}

function generateEmailHtml(type: EmailType, brand: Brand, tpl: EmailTemplateSettings): string {
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

  const closing = `<div style="border-top: 1px solid #eee; padding-top: 20px;">
    <p style="color: #555; margin: 0; line-height: 1.6;">
      Met vriendelijke groet,<br>
      <strong>${brand.name}</strong><br>
      <span style="font-size: 14px; color: #999;">${brand.address}</span>
    </p>
  </div>`;

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
        `<h3 style="color: #333; margin: 0 0 16px 0; font-size: 18px;">${replacePlaceholders(tpl.contact_confirm_greeting, brand)}</h3>
        <p style="color: #555; line-height: 1.6; margin: 0 0 16px 0;">
          ${replacePlaceholders(tpl.contact_confirm_body, brand)}
        </p>` +
        sectionBox("Uw bericht", `<p style="margin: 0; line-height: 1.6; color: #333; white-space: pre-wrap; font-style: italic;">${safeMessage}</p>`) +
        `<p style="color: #555; line-height: 1.6; margin: 0 0 24px 0;">
          ${replacePlaceholders(tpl.contact_confirm_urgent, brand)}
        </p>` + closing,
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
        `<h3 style="color: #333; margin: 0 0 16px 0; font-size: 18px;">${replacePlaceholders(tpl.testdrive_confirm_greeting, brand)}</h3>
        <p style="color: #555; line-height: 1.6; margin: 0 0 24px 0;">
          ${replacePlaceholders(tpl.testdrive_confirm_body, brand)}
        </p>
        <div style="border-radius: 6px; overflow: hidden; margin-bottom: 24px;">
          <img src="${MOCK.carImage}" alt="${carTitle}" style="width: 100%; height: auto; display: block; max-height: 300px; object-fit: cover;" />
        </div>` +
        sectionBox("Auto", `
          <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #333;">${carTitle}</p>
          <p style="margin: 0; font-size: 16px; color: ${brand.primary}; font-weight: 600;">${carPrice}</p>
        `) + closing,
        `Verzonden via het proefrit formulier &middot; ${MOCK.timestamp}`
      );
  }
}

const EDITABLE_TYPES: EmailType[] = ["contact-confirm", "testdrive-confirm"];

interface FieldConfig {
  key: keyof EmailTemplateSettings;
  label: string;
  type: "input" | "textarea";
  help?: string;
}

const FIELDS: Record<string, FieldConfig[]> = {
  "contact-confirm": [
    { key: "contact_confirm_greeting", label: "Begroeting", type: "textarea", help: "Gebruik {naam} voor de klantnaam" },
    { key: "contact_confirm_body", label: "Bericht tekst", type: "textarea" },
    { key: "contact_confirm_urgent", label: "Dringende vraag tekst", type: "textarea", help: "Gebruik {telefoon} voor het telefoonnummer" },
  ],
  "testdrive-confirm": [
    { key: "testdrive_confirm_greeting", label: "Begroeting", type: "textarea", help: "Gebruik {naam} voor de klantnaam" },
    { key: "testdrive_confirm_body", label: "Bericht tekst", type: "textarea" },
  ],
};

const AdminEmailPreview = () => {
  const [activeType, setActiveType] = useState<EmailType>("contact");
  const { colors, footerSettings, emailTemplates } = useSiteSettings();
  const [templates, setTemplates] = useState<EmailTemplateSettings>(DEFAULT_EMAIL_TEMPLATES);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (emailTemplates) {
      setTemplates({ ...DEFAULT_EMAIL_TEMPLATES, ...emailTemplates });
    }
  }, [emailTemplates]);

  const brand = buildBrand(colors, footerSettings);
  const html = generateEmailHtml(activeType, brand, templates);
  const isEditable = EDITABLE_TYPES.includes(activeType);

  const handleFieldChange = useCallback((key: keyof EmailTemplateSettings, value: string) => {
    setTemplates(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await siteSettingsService.update("email_templates", templates);
    setSaving(false);
    if (error) {
      toast({ title: "Fout", description: "Kon email teksten niet opslaan.", variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast({ title: "Opgeslagen", description: "Email teksten bijgewerkt." });
    }
  };

  const handleReset = () => {
    setTemplates(DEFAULT_EMAIL_TEMPLATES);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Email Preview & Teksten
        </h2>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Bekijk en bewerk de email teksten. De preview toont testdata — er wordt niets verstuurd.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
        {EMAIL_TYPES.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeType === id ? "secondary" : "default"}
            size="sm"
            onClick={() => setActiveType(id)}
            className="!text-xs sm:!text-sm"
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
            {label}
          </Button>
        ))}
      </div>

      <p className="text-xs mb-4" style={{ color: "var(--color-text-secondary)" }}>
        {EMAIL_TYPES.find((t) => t.id === activeType)?.description}
      </p>

      <div className={`grid gap-6 ${isEditable ? "lg:grid-cols-2" : ""}`}>
        {isEditable && (
          <div className="space-y-4">
            <h3 className="font-medium text-sm" style={{ color: "var(--color-text-primary)" }}>
              Teksten aanpassen
            </h3>
            {FIELDS[activeType]?.map(({ key, label, type, help }) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key} className="text-sm">{label}</Label>
                {type === "input" ? (
                  <Input
                    id={key}
                    value={templates[key]}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                  />
                ) : (
                  <Textarea
                    id={key}
                    value={templates[key]}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    rows={3}
                  />
                )}
                {help && (
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{help}</p>
                )}
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving} size="sm">
                <Save className="w-4 h-4 mr-1.5" />
                {saving ? "Opslaan..." : "Opslaan"}
              </Button>
              <Button variant="default" onClick={handleReset} size="sm">
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Standaard teksten
              </Button>
            </div>
          </div>
        )}

        <div>
          <div className="border rounded-lg overflow-hidden" style={{ borderColor: "var(--color-border-primary)" }}>
            <iframe
              srcDoc={html}
              title="Email preview"
              className="w-full border-0"
              style={{ height: "min(700px, 60vh)", background: "#f5f5f5" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailPreview;
