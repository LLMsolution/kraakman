import { useQuery } from "@tanstack/react-query";
import { siteSettingsService, SiteColors, type HeroSettings, type PageHeaders, type ReviewsSection, type HomepageTimeline, type LpgFeatures, type FooterSettings, type EmailTemplateSettings } from "@/services/siteSettingsService";
import { useEffect } from "react";

// Apply colors to CSS custom properties on document root
function applyColors(colors: SiteColors) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-accent', colors.accent);

  // Also update the Tailwind HSL bridge variables
  // Convert hex to HSL for Tailwind compatibility
  const primaryHSL = hexToHSL(colors.primary);
  const secondaryHSL = hexToHSL(colors.secondary);
  const backgroundHSL = hexToHSL(colors.background);

  if (primaryHSL) root.style.setProperty('--primary', primaryHSL);
  if (secondaryHSL) root.style.setProperty('--foreground', secondaryHSL);
  if (backgroundHSL) {
    root.style.setProperty('--background', backgroundHSL);
    root.style.setProperty('--primary-foreground', backgroundHSL);
  }
}

// Convert hex color to HSL string (without hsl() wrapper, just "H S% L%")
function hexToHSL(hex: string): string | null {
  // Remove # if present
  hex = hex.replace('#', '');

  // Handle shorthand (3-char) and 8-char (with alpha) hex
  if (hex.length === 3) {
    hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  }
  // Take only first 6 chars (ignore alpha)
  hex = hex.substring(0, 6);

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    console.warn(`hexToHSL: invalid hex color "${hex}"`);
    return null;
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function useSiteSettings() {
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await siteSettingsService.getAll();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Apply colors whenever settings change
  useEffect(() => {
    if (settings?.colors) {
      applyColors(settings.colors as SiteColors);
    }
  }, [settings?.colors]);

  return {
    settings,
    colors: settings?.colors as SiteColors | undefined,
    hero: settings?.hero as HeroSettings | undefined,
    pageHeaders: settings?.page_headers as PageHeaders | undefined,
    reviewsSection: settings?.reviews_section as ReviewsSection | undefined,
    homepageTimeline: settings?.homepage_timeline as HomepageTimeline | undefined,
    lpgFeatures: settings?.lpg_features as LpgFeatures | undefined,
    footerSettings: settings?.footer as FooterSettings | undefined,
    emailTemplates: settings?.email_templates as EmailTemplateSettings | undefined,
    isLoading,
    error,
  };
}

export { hexToHSL, applyColors };
