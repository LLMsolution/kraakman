-- Add new columns for car details
ALTER TABLE cars ADD COLUMN IF NOT EXISTS voertuig_type TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS zitplaatsen INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS deuren INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS brandstof_type TEXT;

-- Add structured technical specification columns
ALTER TABLE cars ADD COLUMN IF NOT EXISTS motor_cc INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS motor_cilinders INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS vermogen_pk INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS gewicht_kg INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS topsnelheid_kmh INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS acceleratie_0_100 NUMERIC(3,1);

-- Convert opties to text array for tag-based input
ALTER TABLE cars ALTER COLUMN opties TYPE TEXT[] USING 
  CASE 
    WHEN opties IS NULL OR opties = '' THEN NULL
    ELSE string_to_array(opties, E'\n')
  END;

-- Keep techniek column for backward compatibility but will be phased out
-- in favor of structured fields above

COMMENT ON COLUMN cars.voertuig_type IS 'Type voertuig (bijv. Personenwagen, SUV, etc.)';
COMMENT ON COLUMN cars.zitplaatsen IS 'Aantal zitplaatsen';
COMMENT ON COLUMN cars.deuren IS 'Aantal deuren';
COMMENT ON COLUMN cars.brandstof_type IS 'Type brandstof (bijv. Benzine, Diesel, Benzine/Hybride)';
COMMENT ON COLUMN cars.motor_cc IS 'Motor inhoud in cc';
COMMENT ON COLUMN cars.motor_cilinders IS 'Aantal cilinders';
COMMENT ON COLUMN cars.vermogen_pk IS 'Vermogen in pk';
COMMENT ON COLUMN cars.gewicht_kg IS 'Gewicht in kg';
COMMENT ON COLUMN cars.topsnelheid_kmh IS 'Topsnelheid in km/u';
COMMENT ON COLUMN cars.acceleratie_0_100 IS 'Acceleratie 0-100 km/h in seconden';
COMMENT ON COLUMN cars.opties IS 'Opties en extras als array';