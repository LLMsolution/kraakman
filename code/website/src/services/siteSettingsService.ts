import { supabase } from "@/integrations/supabase/client";

export interface SiteColors {
  primary: string;
  secondary: string;
  background: string;
  accent: string;
}

export interface HeroSettings {
  title: string;
  subtitle: string;
  image_url: string;
  image_url_mobile: string;
  image_position?: number;
  image_position_mobile?: number;
  cta_title: string;
  cta_subtitle: string;
  wie_zijn_wij_title: string;
}

export interface PageHeaders {
  aanbod_title: string;
  aanbod_subtitle: string;
  verkocht_title: string;
  verkocht_subtitle: string;
  contact_title: string;
  contact_subtitle: string;
  reviews_title: string;
  reviews_subtitle: string;
  lpg_title: string;
  lpg_subtitle: string;
  lpg_cta_title: string;
  lpg_cta_subtitle: string;
}

export interface ReviewsSection {
  title: string;
  subtitle: string;
}

export interface TimelineFeature {
  bold: string;
  text: string;
}

export interface TimelineCard {
  title: string;
  subtitle: string;
  description: string;
  features: TimelineFeature[];
}

export interface HomepageTimeline {
  section_subtitle: string;
  cards: TimelineCard[];
}

export interface LpgFeatureCard {
  title: string;
  description: string;
  checklistTitle: string;
  features: string[];
}

export interface LpgFeatures {
  cards: LpgFeatureCard[];
}

export interface FooterSettings {
  email: string;
  phone: string;
  phone_name: string;
  phone2: string;
  phone2_name: string;
  address_line1: string;
  address_line2: string;
  opening_days: string;
  opening_hours: string;
  opening_note: string;
  company_name: string;
  whatsapp_number: string;
  whatsapp_button_text: string;
  whatsapp_default_message: string;
  contact_form_title: string;
  contact_form_subtitle: string;
  contact_map_title: string;
  contact_map_subtitle: string;
}

export interface EmailTemplateSettings {
  contact_confirm_greeting: string;
  contact_confirm_body: string;
  contact_confirm_urgent: string;
  testdrive_confirm_greeting: string;
  testdrive_confirm_body: string;
}

/** Convert a display phone number like "06-26 344 965" to "tel:0626344965" */
export function phoneToHref(phone: string): string {
  return `tel:${phone.replace(/[\s\-()]/g, '')}`;
}

export type SettingsKey = 'colors' | 'hero' | 'page_headers' | 'reviews_section' | 'homepage_timeline' | 'lpg_features' | 'footer' | 'email_templates';

// site_settings table is not in auto-generated types yet.
// Using a typed helper to minimize `as any` surface area.
// TODO: Regenerate Supabase types to include site_settings table.
const settingsTable = () => (supabase as any).from("site_settings");

export const siteSettingsService = {
  async getAll() {
    try {
      const { data, error } = await settingsTable().select("key, value");

      if (error) {
        console.error('Failed to fetch site settings:', error);
        return { data: null, error };
      }

      const settings: Record<string, unknown> = {};
      for (const row of (data as { key: string; value: unknown }[]) || []) {
        settings[row.key] = row.value;
      }
      return { data: settings, error: null };
    } catch (err) {
      console.error('Unexpected error fetching site settings:', err);
      return { data: null, error: err };
    }
  },

  async get<T>(key: SettingsKey): Promise<{ data: T | null; error: unknown }> {
    try {
      const { data, error } = await settingsTable()
        .select("value")
        .eq("key", key)
        .single();

      if (error) {
        console.error(`Failed to fetch setting "${key}":`, error);
        return { data: null, error };
      }
      return { data: data?.value as T, error: null };
    } catch (err) {
      console.error(`Unexpected error fetching setting "${key}":`, err);
      return { data: null, error: err };
    }
  },

  async update(key: SettingsKey, value: unknown) {
    try {
      const { data, error } = await settingsTable()
        .update({ value })
        .eq("key", key)
        .select()
        .single();

      if (error) {
        console.error(`Failed to update setting "${key}":`, error);
        return { data: null, error };
      }
      return { data, error: null };
    } catch (err) {
      console.error(`Unexpected error updating setting "${key}":`, err);
      return { data: null, error: err };
    }
  },
};
