// Shared type definitions for the Kraakman automotive platform
// These types provide a single source of truth for all car-related data structures

export interface CarImage {
  url: string;
}

export interface Car {
  id: string;
  merk: string;
  model: string;
  type?: string | null;
  bouwjaar: number;
  kilometerstand?: number | null;
  prijs: number;
  omschrijving?: string | null;
  opties?: string[] | null;
  techniek?: string | null;
  voertuig_type?: string | null;
  transmissie?: string | null;
  kleur?: string | null;
  zitplaatsen?: number | null;
  deuren?: number | null;
  brandstof_type?: string | null;
  btw_auto?: boolean | null;
  motor_cc?: number | null;
  motor_cilinders?: number | null;
  vermogen_pk?: number | null;
  gewicht_kg?: number | null;
  topsnelheid_kmh?: number | null;
  acceleratie_0_100?: number | null;
  binnenkort_beschikbaar?: boolean | null;
  status?: "aanbod" | "verkocht" | null;
  car_images?: CarImage[];
  created_at?: string;
  updated_at?: string;
}

export interface CarFormData {
  id?: string;
  merk: string;
  model: string;
  type?: string | null;
  bouwjaar: number;
  transmissie?: string | null;
  kleur?: string | null;
  kilometerstand?: number | null;
  prijs: number;
  status: "aanbod" | "verkocht";
  binnenkort_beschikbaar?: boolean | null;
  omschrijving?: string | null;
  opties?: string[] | null;
  techniek?: string | null;
  voertuig_type?: string | null;
  brandstof_type?: string | null;
  btw_auto?: boolean | null;
  motor_cc?: number | null;
  motor_cilinders?: number | null;
  vermogen_pk?: number | null;
  gewicht_kg?: number | null;
  topsnelheid_kmh?: number | null;
  acceleratie_0_100?: number | null;
  deuren?: number | null;
  zitplaatsen?: number | null;
}

export interface FilterOptions {
  merken: string[];
  transmissies: string[];
  brandstoffen: string[];
  voertuig_types: string[];
}

export interface CarFilters {
  search: string;
  merk: string;
  minPrijs: number;
  maxPrijs: number;
  minBouwjaar: number;
  maxBouwjaar: number;
  transmissie: string;
  brandstof: string;
  voertuig_type: string;
}

export interface TestDriveFormData {
  naam: string;
  email: string;
  telefoon: string;
  voorkeursdatum: string;
  bericht?: string;
}