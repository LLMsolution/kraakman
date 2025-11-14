// CarSpecs component - Displays detailed vehicle specifications
// Extracted from CarDetail to improve component maintainability

import { Car } from '@/types';

interface CarSpecsProps {
  car: Car;
}

interface SpecItemProps {
  label: string;
  value: string | number | null | undefined;
  format?: 'text' | 'currency' | 'boolean';
}

const SpecItem: React.FC<SpecItemProps> = ({ label, value, format = 'text' }) => {
  if (!value && value !== 0) return null;

  let displayValue: string;

  switch (format) {
    case 'currency':
      displayValue = `€${Number(value).toLocaleString('nl-NL')},-`;
      break;
    case 'boolean':
      displayValue = value === true ? 'Ja' : 'Nee';
      break;
    default:
      displayValue = String(value);
  }

  return (
    <div className="flex justify-between py-2 border-b border-[var(--color-border-primary)]/20 last:border-0">
      <span className="font-medium text-[var(--color-text-primary)]">{label}</span>
      <span className="text-[var(--color-text-secondary)]">{displayValue}</span>
    </div>
  );
};

export const CarSpecs: React.FC<CarSpecsProps> = ({ car }) => {
  const basicSpecs = [
    { label: 'Merk', value: car.merk },
    { label: 'Model', value: car.model },
    { label: 'Type', value: car.type },
    { label: 'Bouwjaar', value: car.bouwjaar },
    { label: 'Kilometerstand', value: car.kilometerstand ? `${car.kilometerstand.toLocaleString('nl-NL')} km` : null },
    { label: 'Prijs', value: car.prijs, format: 'currency' as const },
    { label: 'BTW Auto', value: car.btw_auto, format: 'boolean' as const },
  ];

  const technicalSpecs = [
    { label: 'Transmissie', value: car.transmissie },
    { label: 'Brandstof', value: car.brandstof_type },
    { label: 'Motorinhoud', value: car.motor_cc ? `${car.motor_cc} cc` : null },
    { label: 'Cilinders', value: car.motor_cilinders },
    { label: 'Vermogen', value: car.vermogen_pk ? `${car.vermogen_pk} pk` : null },
    { label: 'Gewicht', value: car.gewicht_kg ? `${car.gewicht_kg} kg` : null },
    { label: 'Topsnelheid', value: car.topsnelheid_kmh ? `${car.topsnelheid_kmh} km/h` : null },
    { label: 'Acceleratie 0-100', value: car.acceleratie_0_100 ? `${car.acceleratie_0_100} sec` : null },
  ];

  const comfortSpecs = [
    { label: 'Kleur', value: car.kleur },
    { label: 'Zitplaatsen', value: car.zitplaatsen },
    { label: 'Deuren', value: car.deuren },
    { label: 'Voertuigtype', value: car.voertuig_type },
  ];

  return (
    <div className="space-y-8">
      {/* Description */}
      {car.omschrijving && (
        <div>
          <h3 className="text-xl font-semibold mb-3 text-[var(--color-text-primary)]">Beschrijving</h3>
          <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
            {car.omschrijving}
          </p>
        </div>
      )}

      {/* Basic Specifications */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">Basis Specificaties</h3>
        <div className="bg-[var(--color-bg-card)] rounded-lg p-6 border border-[var(--color-border-primary)]">
          {basicSpecs.map((spec, index) => (
            <SpecItem key={index} {...spec} />
          ))}
        </div>
      </div>

      {/* Technical Specifications */}
      {technicalSpecs.some(spec => spec.value) && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">Technische Specificaties</h3>
          <div className="bg-[var(--color-bg-card)] rounded-lg p-6 border border-[var(--color-border-primary)]">
            {technicalSpecs.map((spec, index) => (
              <SpecItem key={index} {...spec} />
            ))}
          </div>
        </div>
      )}

      {/* Comfort and Convenience */}
      {comfortSpecs.some(spec => spec.value) && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">Comfort en Gemak</h3>
          <div className="bg-[var(--color-bg-card)] rounded-lg p-6 border border-[var(--color-border-primary)]">
            {comfortSpecs.map((spec, index) => (
              <SpecItem key={index} {...spec} />
            ))}
          </div>
        </div>
      )}

      {/* Options */}
      {car.opties && car.opties.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">Opties en Accessoires</h3>
          <div className="bg-[var(--color-bg-card)] rounded-lg p-6 border border-[var(--color-border-primary)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {car.opties.map((optie, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full flex-shrink-0"></div>
                  <span className="text-[var(--color-text-secondary)]">{optie}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Technical Information */}
      {car.techniek && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">Technische Informatie</h3>
          <div className="bg-[var(--color-bg-card)] rounded-lg p-6 border border-[var(--color-border-primary)]">
            <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
              {car.techniek}
            </p>
          </div>
        </div>
      )}

      {/* Availability Notice */}
      {car.binnenkort_beschikbaar && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium">
            🚗 Deze auto is binnenkort beschikbaar. Neem contact op voor meer informatie.
          </p>
        </div>
      )}
    </div>
  );
};