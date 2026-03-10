import { useState, useEffect, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, RotateCcw, Save } from "lucide-react";
import {
  siteSettingsService,
  SiteColors,
  HeroSettings,
  PageHeaders,
  ReviewsSection,
  type HomepageTimeline,
  type LpgFeatures,
  type FooterSettings,
} from "@/services/siteSettingsService";
import { DEFAULT_FOOTER } from "@/data/contentDefaults";
import { imageService } from "@/services/imageService";
import { applyColors } from "@/hooks/useSiteSettings";
import { useQueryClient } from "@tanstack/react-query";

const AdminTimelineEditor = lazy(() => import("./AdminTimelineEditor"));
const AdminLpgEditor = lazy(() => import("./AdminLpgEditor"));

const inputClass = "kraakman-input";

type ActiveSection = "kleuren" | "homepage" | "paginas" | "lpg" | "contact" | "footer";

const DEFAULT_COLORS: SiteColors = {
  primary: "#123458",
  secondary: "#030303",
  background: "#F1EFEC",
  accent: "#d4c9bf4d",
};

const AdminWebsiteSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>("kleuren");

  // Color state
  const [colors, setColors] = useState<SiteColors>(DEFAULT_COLORS);
  const [originalColors, setOriginalColors] = useState<SiteColors>(DEFAULT_COLORS);

  // Hero state
  const [hero, setHero] = useState<HeroSettings>({
    title: "",
    subtitle: "",
    image_url: "",
    image_url_mobile: "",
    cta_title: "",
    cta_subtitle: "",
    wie_zijn_wij_title: "",
  });

  // Page headers state
  const [pageHeaders, setPageHeaders] = useState<PageHeaders>({
    aanbod_title: "",
    aanbod_subtitle: "",
    verkocht_title: "",
    verkocht_subtitle: "",
    contact_title: "",
    contact_subtitle: "",
    reviews_title: "",
    reviews_subtitle: "",
    lpg_title: "",
    lpg_subtitle: "",
    lpg_cta_title: "",
    lpg_cta_subtitle: "",
  });

  // Reviews section state
  const [reviewsSection, setReviewsSection] = useState<ReviewsSection>({
    title: "",
    subtitle: "",
  });

  // Timeline, LPG & Footer state
  const [homepageTimeline, setHomepageTimeline] = useState<HomepageTimeline | undefined>(undefined);
  const [lpgFeatures, setLpgFeatures] = useState<LpgFeatures | undefined>(undefined);
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(DEFAULT_FOOTER);

  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string>("");
  const [heroMobileImageFile, setHeroMobileImageFile] = useState<File | null>(null);
  const [heroMobileImagePreview, setHeroMobileImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const { data, error } = await siteSettingsService.getAll();
    if (error) {
      toast({ title: "Fout", description: "Kon instellingen niet laden.", variant: "destructive" });
    } else if (data) {
      if (data.colors) {
        setColors(data.colors);
        setOriginalColors(data.colors);
      }
      if (data.hero) {
        setHero(data.hero);
        if (data.hero.image_url) setHeroImagePreview(data.hero.image_url);
        if (data.hero.image_url_mobile) setHeroMobileImagePreview(data.hero.image_url_mobile);
      }
      if (data.page_headers) setPageHeaders(data.page_headers);
      if (data.reviews_section) setReviewsSection(data.reviews_section);
      if (data.homepage_timeline) setHomepageTimeline(data.homepage_timeline);
      if (data.lpg_features) setLpgFeatures(data.lpg_features);
      if (data.footer) setFooterSettings(data.footer);
    }
    setLoading(false);
  };

  // Live preview colors as you change them
  useEffect(() => {
    applyColors(colors);
  }, [colors]);

  // Restore original colors on unmount if not saved
  useEffect(() => {
    return () => {
      applyColors(originalColors);
    };
  }, [originalColors]);

  const handleColorChange = (key: keyof SiteColors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetColors = () => {
    setColors(DEFAULT_COLORS);
  };

  const handleHeroImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroImageFile(file);
    setHeroImagePreview(URL.createObjectURL(file));
  };

  const handleHeroMobileImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroMobileImageFile(file);
    setHeroMobileImagePreview(URL.createObjectURL(file));
  };

  const uploadHeroImageFile = async (file: File, prefix: string): Promise<string | null> => {
    const fileName = `site/${prefix}-${crypto.randomUUID()}.${file.name.split(".").pop()}`;
    const { error: uploadError } = await (await import("@/integrations/supabase/client")).supabase.storage
      .from("car-images")
      .upload(fileName, file, { cacheControl: "3600" });

    if (uploadError) {
      toast({ title: "Fout", description: `Kon ${prefix} afbeelding niet uploaden.`, variant: "destructive" });
      return null;
    }

    const { data: { publicUrl } } = (await import("@/integrations/supabase/client")).supabase.storage
      .from("car-images")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const uploadHeroImages = async (): Promise<{ desktop: string | null; mobile: string | null }> => {
    setUploadingImage(true);
    const desktop = heroImageFile ? await uploadHeroImageFile(heroImageFile, "hero") : (hero.image_url || null);
    const mobile = heroMobileImageFile ? await uploadHeroImageFile(heroMobileImageFile, "hero-mobile") : (hero.image_url_mobile || null);
    setUploadingImage(false);
    return { desktop, mobile };
  };

  const handleSaveColors = async () => {
    setSaving(true);
    const { error } = await siteSettingsService.update("colors", colors);
    if (error) {
      toast({ title: "Fout", description: "Kon kleuren niet opslaan.", variant: "destructive" });
    } else {
      setOriginalColors(colors);
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast({ title: "Opgeslagen", description: "Kleuren succesvol bijgewerkt." });
    }
    setSaving(false);
  };

  const handleSaveHero = async () => {
    setSaving(true);
    const { desktop, mobile } = await uploadHeroImages();
    const updatedHero = {
      ...hero,
      image_url: desktop || hero.image_url,
      image_url_mobile: mobile || hero.image_url_mobile,
    };

    const { error } = await siteSettingsService.update("hero", updatedHero);
    if (error) {
      toast({ title: "Fout", description: "Kon hero instellingen niet opslaan.", variant: "destructive" });
    } else {
      setHero(updatedHero);
      setHeroImageFile(null);
      setHeroMobileImageFile(null);
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast({ title: "Opgeslagen", description: "Homepage instellingen bijgewerkt." });
    }
    setSaving(false);
  };

  const handleSaveFooter = async () => {
    setSaving(true);
    const { error } = await siteSettingsService.update("footer", footerSettings);
    if (error) {
      toast({ title: "Fout", description: "Kon footer niet opslaan.", variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast({ title: "Opgeslagen", description: "Footer instellingen bijgewerkt." });
    }
    setSaving(false);
  };

  const handleSavePages = async () => {
    setSaving(true);
    const [headersResult, reviewsResult] = await Promise.all([
      siteSettingsService.update("page_headers", pageHeaders),
      siteSettingsService.update("reviews_section", reviewsSection),
    ]);

    if (headersResult.error || reviewsResult.error) {
      toast({ title: "Fout", description: "Kon pagina instellingen niet opslaan.", variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast({ title: "Opgeslagen", description: "Pagina instellingen bijgewerkt." });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const sections: { key: ActiveSection; label: string }[] = [
    { key: "kleuren", label: "Kleuren" },
    { key: "homepage", label: "Homepage" },
    { key: "paginas", label: "Pagina Headers" },
    { key: "lpg", label: "LPG Content" },
    { key: "contact", label: "Contact" },
    { key: "footer", label: "Footer" },
  ];

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex gap-1.5 sm:gap-2 flex-wrap pb-2">
        {sections.map((section) => (
          <Button
            key={section.key}
            variant={activeSection === section.key ? "secondary" : "default"}
            size="sm"
            onClick={() => setActiveSection(section.key)}
            className="sm:!h-10 sm:!px-4"
          >
            {section.label}
          </Button>
        ))}
      </div>

      {/* Kleuren Section */}
      {activeSection === "kleuren" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-semibold mb-2 block">Primaire kleur</Label>
              <p className="text-xs text-muted-foreground mb-2">Knoppen, links, accenten</p>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={colors.primary}
                  onChange={(e) => handleColorChange("primary", e.target.value)}
                  className="cursor-pointer shrink-0" style={{ width: 56, height: 56, padding: 0, border: "1px solid var(--color-secondary)" }}
                />
                <Input
                  className={inputClass}
                  value={colors.primary}
                  onChange={(e) => handleColorChange("primary", e.target.value)}
                  placeholder="#123458"
                  style={{ lineHeight: "24px" }}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">Secundaire kleur</Label>
              <p className="text-xs text-muted-foreground mb-2">Tekst, borders</p>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={colors.secondary}
                  onChange={(e) => handleColorChange("secondary", e.target.value)}
                  className="cursor-pointer shrink-0" style={{ width: 56, height: 56, padding: 0, border: "1px solid var(--color-secondary)" }}
                />
                <Input
                  className={inputClass}
                  value={colors.secondary}
                  onChange={(e) => handleColorChange("secondary", e.target.value)}
                  placeholder="#030303"
                  style={{ lineHeight: "24px" }}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">Achtergrondkleur</Label>
              <p className="text-xs text-muted-foreground mb-2">Hoofdachtergrond</p>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={colors.background}
                  onChange={(e) => handleColorChange("background", e.target.value)}
                  className="cursor-pointer shrink-0" style={{ width: 56, height: 56, padding: 0, border: "1px solid var(--color-secondary)" }}
                />
                <Input
                  className={inputClass}
                  value={colors.background}
                  onChange={(e) => handleColorChange("background", e.target.value)}
                  placeholder="#F1EFEC"
                  style={{ lineHeight: "24px" }}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">Accent kleur</Label>
              <p className="text-xs text-muted-foreground mb-2">Sectie-achtergronden</p>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={colors.accent.substring(0, 7)}
                  onChange={(e) => handleColorChange("accent", e.target.value + "4d")}
                  className="cursor-pointer shrink-0" style={{ width: 56, height: 56, padding: 0, border: "1px solid var(--color-secondary)" }}
                />
                <Input
                  className={inputClass}
                  value={colors.accent}
                  onChange={(e) => handleColorChange("accent", e.target.value)}
                  placeholder="#d4c9bf4d"
                  style={{ lineHeight: "24px" }}
                />
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div className="border border-border p-4">
            <Label className="text-sm font-semibold mb-3 block">Preview</Label>
            <div className="flex gap-3 flex-wrap">
              <div className="w-20 h-20 border" style={{ backgroundColor: colors.primary }}>
                <span className="text-xs p-1 block" style={{ color: colors.background }}>Primary</span>
              </div>
              <div className="w-20 h-20 border" style={{ backgroundColor: colors.secondary }}>
                <span className="text-xs p-1 block" style={{ color: colors.background }}>Secondary</span>
              </div>
              <div className="w-20 h-20 border border-border" style={{ backgroundColor: colors.background }}>
                <span className="text-xs p-1 block" style={{ color: colors.secondary }}>Background</span>
              </div>
              <div className="w-20 h-20 border border-border" style={{ backgroundColor: colors.accent }}>
                <span className="text-xs p-1 block" style={{ color: colors.secondary }}>Accent</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleSaveColors} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Kleuren opslaan
            </Button>
            <Button variant="default" onClick={handleResetColors}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset naar standaard
            </Button>
          </div>
        </div>
      )}

      {/* Homepage Section */}
      {activeSection === "homepage" && (
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-semibold mb-2 block">Hero Titel</Label>
            <Input
              className={inputClass}
              value={hero.title}
              onChange={(e) => setHero({ ...hero, title: e.target.value })}
              placeholder="Auto Service van der Waals"
              style={{ lineHeight: "24px" }}
            />
          </div>

          <div>
            <Label className="text-sm font-semibold mb-2 block">Hero Subtekst</Label>
            <Textarea
              className="kraakman-textarea"
              value={hero.subtitle}
              onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
              placeholder="Specialist in auto onderhoud..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-semibold mb-2 block">Hero Afbeelding (Desktop)</Label>
              <p className="text-xs text-muted-foreground mb-2">Liggend formaat, wordt getoond op desktop en tablet</p>
              <div className="mb-3 border border-border overflow-hidden">
                {heroImagePreview ? (
                  <img
                    src={heroImagePreview}
                    alt="Hero preview desktop"
                    className="w-full object-contain"
                    style={{ maxHeight: "300px" }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                    Geen afbeelding ingesteld
                  </div>
                )}
              </div>
              <Button
                variant="default"
                onClick={() => document.getElementById("hero-image-upload")?.click()}
                disabled={uploadingImage}
              >
                <Upload className="w-4 h-4 mr-2" />
                {heroImagePreview ? "Andere afbeelding" : "Afbeelding kiezen"}
              </Button>
              <input
                id="hero-image-upload"
                type="file"
                accept="image/*"
                onChange={handleHeroImageSelect}
                className="hidden"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold mb-2 block">Hero Afbeelding (Mobiel)</Label>
              <p className="text-xs text-muted-foreground mb-2">Staand formaat, wordt getoond op telefoons. Laat leeg om de desktop afbeelding te gebruiken.</p>
              <div className="mb-3 border border-border overflow-hidden">
                {heroMobileImagePreview ? (
                  <img
                    src={heroMobileImagePreview}
                    alt="Hero preview mobiel"
                    className="w-full object-contain"
                    style={{ maxHeight: "300px" }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                    Geen mobiele afbeelding (desktop wordt gebruikt)
                  </div>
                )}
              </div>
              <Button
                variant="default"
                onClick={() => document.getElementById("hero-mobile-image-upload")?.click()}
                disabled={uploadingImage}
              >
                <Upload className="w-4 h-4 mr-2" />
                {heroMobileImagePreview ? "Andere afbeelding" : "Afbeelding kiezen"}
              </Button>
              <input
                id="hero-mobile-image-upload"
                type="file"
                accept="image/*"
                onChange={handleHeroMobileImageSelect}
                className="hidden"
              />
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold mb-4">"Wie zijn wij?" Sectie</h3>
            <div className="mb-4">
              <Label className="text-sm font-semibold mb-2 block">Sectie Titel</Label>
              <Input
                className={inputClass}
                value={hero.wie_zijn_wij_title}
                onChange={(e) => setHero({ ...hero, wie_zijn_wij_title: e.target.value })}
                placeholder="Wie zijn wij?"
                style={{ lineHeight: "24px" }}
              />
            </div>
          </div>

          <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
            <AdminTimelineEditor initial={homepageTimeline} />
          </Suspense>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold mb-4">CTA Sectie (onderaan homepage)</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">CTA Titel</Label>
                <Input
                  className={inputClass}
                  value={hero.cta_title}
                  onChange={(e) => setHero({ ...hero, cta_title: e.target.value })}
                  placeholder="Klaar voor uw volgende auto-ervaring?"
                  style={{ lineHeight: "24px" }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">CTA Subtekst</Label>
                <Input
                  className={inputClass}
                  value={hero.cta_subtitle}
                  onChange={(e) => setHero({ ...hero, cta_subtitle: e.target.value })}
                  placeholder="Neem contact op voor een vrijblijvend advies..."
                  style={{ lineHeight: "24px" }}
                />
              </div>
            </div>
          </div>

          <Button variant="secondary" onClick={handleSaveHero} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Homepage opslaan
          </Button>
        </div>
      )}

      {/* Pagina Headers Section */}
      {activeSection === "paginas" && (
        <div className="space-y-8">
          {/* Reviews Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Reviews Sectie (homepage)</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Titel</Label>
                <Input
                  className={inputClass}
                  value={reviewsSection.title}
                  onChange={(e) => setReviewsSection({ ...reviewsSection, title: e.target.value })}
                  placeholder="Kies voor zekerheid"
                  style={{ lineHeight: "24px" }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Subtekst</Label>
                <Input
                  className={inputClass}
                  value={reviewsSection.subtitle}
                  onChange={(e) => setReviewsSection({ ...reviewsSection, subtitle: e.target.value })}
                  placeholder="bij ons geen verrassingen..."
                  style={{ lineHeight: "24px" }}
                />
              </div>
            </div>
          </div>

          {/* Aanbod Header */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold mb-4">Aanbod Pagina</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Titel</Label>
                <Input
                  className={inputClass}
                  value={pageHeaders.aanbod_title}
                  onChange={(e) => setPageHeaders({ ...pageHeaders, aanbod_title: e.target.value })}
                  placeholder="Ons Aanbod"
                  style={{ lineHeight: "24px" }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Subtekst</Label>
                <Textarea
                  className="kraakman-textarea"
                  value={pageHeaders.aanbod_subtitle}
                  onChange={(e) => setPageHeaders({ ...pageHeaders, aanbod_subtitle: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Verkocht Header */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold mb-4">Verkocht Pagina</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Titel</Label>
                <Input
                  className={inputClass}
                  value={pageHeaders.verkocht_title}
                  onChange={(e) => setPageHeaders({ ...pageHeaders, verkocht_title: e.target.value })}
                  placeholder="Verkochte Auto's"
                  style={{ lineHeight: "24px" }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Subtekst</Label>
                <Textarea
                  className="kraakman-textarea"
                  value={pageHeaders.verkocht_subtitle}
                  onChange={(e) => setPageHeaders({ ...pageHeaders, verkocht_subtitle: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Reviews Header */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold mb-4">Reviews Pagina</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Titel</Label>
                <Input
                  className={inputClass}
                  value={pageHeaders.reviews_title}
                  onChange={(e) => setPageHeaders({ ...pageHeaders, reviews_title: e.target.value })}
                  placeholder="Klantbeoordelingen"
                  style={{ lineHeight: "24px" }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Subtekst</Label>
                <Textarea
                  className="kraakman-textarea"
                  value={pageHeaders.reviews_subtitle}
                  onChange={(e) => setPageHeaders({ ...pageHeaders, reviews_subtitle: e.target.value })}
                  placeholder="Wat onze klanten over ons zeggen"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* LPG Header */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold mb-4">LPG Pagina</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Titel</Label>
                <Input
                  className={inputClass}
                  value={pageHeaders.lpg_title}
                  onChange={(e) => setPageHeaders({ ...pageHeaders, lpg_title: e.target.value })}
                  placeholder="Onze LPG Diensten"
                  style={{ lineHeight: "24px" }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Subtekst</Label>
                <Textarea
                  className="kraakman-textarea"
                  value={pageHeaders.lpg_subtitle}
                  onChange={(e) => setPageHeaders({ ...pageHeaders, lpg_subtitle: e.target.value })}
                  placeholder="Professionele LPG installaties met jarenlange ervaring"
                  rows={2}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">CTA Titel</Label>
                <Input
                  className={inputClass}
                  value={pageHeaders.lpg_cta_title}
                  onChange={(e) => setPageHeaders({ ...pageHeaders, lpg_cta_title: e.target.value })}
                  placeholder="Interesse in een LPG-installatie?"
                  style={{ lineHeight: "24px" }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">CTA Subtekst</Label>
                <Input
                  className={inputClass}
                  value={pageHeaders.lpg_cta_subtitle}
                  onChange={(e) => setPageHeaders({ ...pageHeaders, lpg_cta_subtitle: e.target.value })}
                  placeholder="Neem contact met ons op voor een vrijblijvend adviesgesprek"
                  style={{ lineHeight: "24px" }}
                />
              </div>
            </div>
          </div>

          <Button variant="secondary" onClick={handleSavePages} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Pagina instellingen opslaan
          </Button>
        </div>
      )}

      {/* LPG Content Section */}
      {activeSection === "lpg" && (
        <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
          <AdminLpgEditor initial={lpgFeatures} />
        </Suspense>
      )}

      {/* Contact Section */}
      {activeSection === "contact" && (
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Pagina Header</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              De titel en subtekst bovenaan de contactpagina.
            </p>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Titel</Label>
                <Input
                  className={inputClass}
                  value={pageHeaders.contact_title}
                  onChange={(e) => setPageHeaders({ ...pageHeaders, contact_title: e.target.value })}
                  placeholder="Neem contact op"
                  style={{ lineHeight: "24px" }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Subtekst</Label>
                <Textarea
                  className="kraakman-textarea"
                  value={pageHeaders.contact_subtitle}
                  onChange={(e) => setPageHeaders({ ...pageHeaders, contact_subtitle: e.target.value })}
                  placeholder="Heeft u vragen over ons aanbod, onderhoud of LPG installaties?"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold mb-2">Contactformulier</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              De tekst boven het contactformulier.
            </p>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Titel</Label>
                <Input
                  className={inputClass}
                  value={footerSettings.contact_form_title}
                  onChange={(e) => setFooterSettings({ ...footerSettings, contact_form_title: e.target.value })}
                  placeholder="Stuur ons een bericht"
                  style={{ lineHeight: "24px" }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Subtekst</Label>
                <Input
                  className={inputClass}
                  value={footerSettings.contact_form_subtitle}
                  onChange={(e) => setFooterSettings({ ...footerSettings, contact_form_subtitle: e.target.value })}
                  placeholder="Vul het formulier in en we nemen zo spoedig mogelijk contact met u op."
                  style={{ lineHeight: "24px" }}
                />
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold mb-2">Kaart</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              De tekst naast de Google Maps kaart.
            </p>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Titel</Label>
                <Input
                  className={inputClass}
                  value={footerSettings.contact_map_title}
                  onChange={(e) => setFooterSettings({ ...footerSettings, contact_map_title: e.target.value })}
                  placeholder="Locatie"
                  style={{ lineHeight: "24px" }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Subtekst</Label>
                <Input
                  className={inputClass}
                  value={footerSettings.contact_map_subtitle}
                  onChange={(e) => setFooterSettings({ ...footerSettings, contact_map_subtitle: e.target.value })}
                  placeholder="Wij zijn gevestigd in Wieringerwaard, makkelijk bereikbaar vanuit de regio."
                  style={{ lineHeight: "24px" }}
                />
              </div>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold mb-2">WhatsApp Knop</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              De WhatsApp-knop op de contactpagina en onderaan elke autopagina ("Stel eenvoudig een vraag").
            </p>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">WhatsApp nummer</Label>
                <p className="text-xs text-muted-foreground mb-1">Internationaal formaat zonder + (bijv. 31612345678)</p>
                <Input
                  className={inputClass}
                  value={footerSettings.whatsapp_number}
                  onChange={(e) => setFooterSettings({ ...footerSettings, whatsapp_number: e.target.value })}
                  placeholder="31646075907"
                  style={{ lineHeight: "24px" }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Knoptekst</Label>
                <p className="text-xs text-muted-foreground mb-1">De tekst die op de WhatsApp-knop staat</p>
                <Input
                  className={inputClass}
                  value={footerSettings.whatsapp_button_text}
                  onChange={(e) => setFooterSettings({ ...footerSettings, whatsapp_button_text: e.target.value })}
                  placeholder="Direct chatten met Kees"
                  style={{ lineHeight: "24px" }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Standaard bericht</Label>
                <p className="text-xs text-muted-foreground mb-1">Dit bericht staat alvast ingevuld als iemand op de knop klikt</p>
                <Input
                  className={inputClass}
                  value={footerSettings.whatsapp_default_message}
                  onChange={(e) => setFooterSettings({ ...footerSettings, whatsapp_default_message: e.target.value })}
                  placeholder="Hi Kees, ik heb een vraag:"
                  style={{ lineHeight: "24px" }}
                />
              </div>
            </div>
          </div>

          <Button variant="secondary" onClick={async () => {
            setSaving(true);
            const [footerResult, headersResult] = await Promise.all([
              siteSettingsService.update("footer", footerSettings),
              siteSettingsService.update("page_headers", pageHeaders),
            ]);
            if (footerResult.error || headersResult.error) {
              toast({ title: "Fout", description: "Kon contact instellingen niet opslaan.", variant: "destructive" });
            } else {
              queryClient.invalidateQueries({ queryKey: ["site-settings"] });
              toast({ title: "Opgeslagen", description: "Contact instellingen bijgewerkt." });
            }
            setSaving(false);
          }} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Contact opslaan
          </Button>
        </div>
      )}

      {/* Footer Section */}
      {activeSection === "footer" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">E-mailadres</Label>
                <Input
                  className={inputClass}
                  value={footerSettings.email}
                  onChange={(e) => setFooterSettings({ ...footerSettings, email: e.target.value })}
                  placeholder="info@autoservicevanderwaals.nl"
                  style={{ lineHeight: "24px" }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Telefoonnummer</Label>
                <div className="flex gap-3">
                  <Input
                    className={inputClass}
                    value={footerSettings.phone}
                    onChange={(e) => setFooterSettings({ ...footerSettings, phone: e.target.value })}
                    placeholder="06-26 344 965"
                    style={{ lineHeight: "24px" }}
                  />
                  <Input
                    className={inputClass}
                    value={footerSettings.phone_name || ""}
                    onChange={(e) => setFooterSettings({ ...footerSettings, phone_name: e.target.value })}
                    placeholder="Naam (bijv. Stefan)"
                    style={{ lineHeight: "24px", maxWidth: "200px" }}
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Tweede telefoonnummer</Label>
                <p className="text-xs text-muted-foreground mb-1">Laat leeg om te verbergen</p>
                <div className="flex gap-3">
                  <Input
                    className={inputClass}
                    value={footerSettings.phone2}
                    onChange={(e) => setFooterSettings({ ...footerSettings, phone2: e.target.value })}
                    placeholder="06-12 345 678"
                    style={{ lineHeight: "24px" }}
                  />
                  <Input
                    className={inputClass}
                    value={footerSettings.phone2_name || ""}
                    onChange={(e) => setFooterSettings({ ...footerSettings, phone2_name: e.target.value })}
                    placeholder="Naam (bijv. Kees)"
                    style={{ lineHeight: "24px", maxWidth: "200px" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold mb-4">Adres</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Adresregel 1</Label>
                <Input
                  className={inputClass}
                  value={footerSettings.address_line1}
                  onChange={(e) => setFooterSettings({ ...footerSettings, address_line1: e.target.value })}
                  placeholder="Zuid Zijperweg 66"
                  style={{ lineHeight: "24px" }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Adresregel 2</Label>
                <Input
                  className={inputClass}
                  value={footerSettings.address_line2}
                  onChange={(e) => setFooterSettings({ ...footerSettings, address_line2: e.target.value })}
                  placeholder="1766 HD Wieringerwaard"
                  style={{ lineHeight: "24px" }}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold mb-4">Openingstijden</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Dagen</Label>
                <Input
                  className={inputClass}
                  value={footerSettings.opening_days}
                  onChange={(e) => setFooterSettings({ ...footerSettings, opening_days: e.target.value })}
                  placeholder="Maandag - Vrijdag"
                  style={{ lineHeight: "24px" }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Tijden</Label>
                <Input
                  className={inputClass}
                  value={footerSettings.opening_hours}
                  onChange={(e) => setFooterSettings({ ...footerSettings, opening_hours: e.target.value })}
                  placeholder="08:00 - 17:00 uur"
                  style={{ lineHeight: "24px" }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Opmerking</Label>
                <Input
                  className={inputClass}
                  value={footerSettings.opening_note}
                  onChange={(e) => setFooterSettings({ ...footerSettings, opening_note: e.target.value })}
                  placeholder="Op afspraak"
                  style={{ lineHeight: "24px" }}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold mb-4">Overig</h3>
            <div>
              <Label className="text-sm font-semibold mb-2 block">Bedrijfsnaam (copyright)</Label>
              <Input
                className={inputClass}
                value={footerSettings.company_name}
                onChange={(e) => setFooterSettings({ ...footerSettings, company_name: e.target.value })}
                placeholder="Auto Service van der Waals"
                style={{ lineHeight: "24px" }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleSaveFooter} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Footer opslaan
            </Button>
            <Button variant="default" onClick={() => setFooterSettings(DEFAULT_FOOTER)}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset naar standaard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWebsiteSettings;
