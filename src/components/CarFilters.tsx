import { useEffect, useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { X, ChevronDown, Filter } from "lucide-react";

// Custom styling voor consistente input velden zonder hover/focus effecten
const inputClass = "border border-[#030303] bg-background focus:border-[#030303] focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:border-[#030303] transition-none leading-6";
const selectClass = "kraakman-native-select";
const selectWrapperClass = "relative";

// Custom Dropdown Component using Button variant
const CustomDropdown = ({ value, onChange, options, placeholder, disabled = false }: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const selectedLabel = value || placeholder;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="default"
        size="default"
        type="button"
        className="w-full justify-start pr-10 appearance-none"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="text-left flex-1">
          {selectedLabel}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-[-1px] bg-background border border-[#030303] rounded-md shadow-lg max-h-60 overflow-auto">
          {options.filter(option => option !== placeholder).map((option) => (
            <Button
              key={option}
              variant="dropdown"
              type="button"
              className="w-full justify-start rounded-none border-x-0 border-t-0 border-b border-[#030303] last:border-b-0"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

interface FilterOptions {
  merken: string[];
  minPrijs: number;
  maxPrijs: number;
  minBouwjaar: number;
  maxBouwjaar: number;
  brandstofTypes: string[];
  transmissieTypes: string[];
}

interface CarFiltersProps {
  options: FilterOptions;
  onFilterChange: (filters: {
    search: string;
    merk: string;
    minPrijs: number;
    maxPrijs: number;
    minBouwjaar: number;
    maxBouwjaar: number;
    brandstofType: string;
    transmissie: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) => void;
}

const CarFilters = ({ options, onFilterChange }: CarFiltersProps) => {
  const [search, setSearch] = useState("");
  const [selectedMerk, setSelectedMerk] = useState("");
  const [minPrijs, setMinPrijs] = useState(options.minPrijs);
  const [maxPrijs, setMaxPrijs] = useState(options.maxPrijs);
  const [minBouwjaar, setMinBouwjaar] = useState(options.minBouwjaar);
  const [maxBouwjaar, setMaxBouwjaar] = useState(options.maxBouwjaar);
  const [selectedBrandstofType, setSelectedBrandstofType] = useState("");
  const [selectedTransmissie, setSelectedTransmissie] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("desc");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    onFilterChange({
      search,
      merk: selectedMerk,
      minPrijs,
      maxPrijs,
      minBouwjaar,
      maxBouwjaar,
      brandstofType: selectedBrandstofType,
      transmissie: selectedTransmissie,
      sortBy,
      sortOrder,
    });
  }, [search, selectedMerk, minPrijs, maxPrijs, minBouwjaar, maxBouwjaar, selectedBrandstofType, selectedTransmissie, sortBy, sortOrder]);


  const handleReset = () => {
    setSearch("");
    setSelectedMerk("");
    setMinPrijs(options.minPrijs);
    setMaxPrijs(options.maxPrijs);
    setMinBouwjaar(options.minBouwjaar);
    setMaxBouwjaar(options.maxBouwjaar);
    setSelectedBrandstofType("");
    setSelectedTransmissie("");
    setSortBy("created_at");
    setSortOrder("desc");
  };

  const hasActiveFilters =
    search ||
    selectedMerk !== "" ||
    minPrijs !== options.minPrijs ||
    maxPrijs !== options.maxPrijs ||
    minBouwjaar !== options.minBouwjaar ||
    maxBouwjaar !== options.maxBouwjaar ||
    selectedBrandstofType !== "" ||
    selectedTransmissie !== "" ||
    sortBy !== "created_at" ||
    sortOrder !== "desc";

  const activeFilterCount = [
    search,
    selectedMerk,
    minPrijs !== options.minPrijs,
    maxPrijs !== options.maxPrijs,
    minBouwjaar !== options.minBouwjaar,
    maxBouwjaar !== options.maxBouwjaar,
    selectedBrandstofType,
    selectedTransmissie,
    sortBy !== "created_at",
    sortOrder !== "desc"
  ].filter(Boolean).length;

  const clearFilter = (filterType: string) => {
    switch (filterType) {
      case 'search':
        setSearch("");
        break;
      case 'merk':
        setSelectedMerk("");
        break;
      case 'prijs':
        setMinPrijs(options.minPrijs);
        setMaxPrijs(options.maxPrijs);
        break;
      case 'bouwjaar':
        setMinBouwjaar(options.minBouwjaar);
        setMaxBouwjaar(options.maxBouwjaar);
        break;
      case 'brandstof':
        setSelectedBrandstofType("");
        break;
      case 'transmissie':
        setSelectedTransmissie("");
        break;
      case 'sortering':
        setSortBy("created_at");
        setSortOrder("desc");
        break;
    }
  };

  return (
    <div className="mb-8">
      {/* Filter and Sort Controls */}
      <div className="space-y-4 mb-4">
        {/* Sort Controls Row */}
        <div className="flex flex-col items-start gap-4">
          <div className="flex flex-row gap-3 w-full">
            {/* Sort By Button */}
            <div className="flex-1">
              <CustomDropdown
                value={sortBy === 'created_at' ? 'Datum' : sortBy === 'prijs' ? 'Prijs' : sortBy === 'bouwjaar' ? 'Bouwjaar vanaf' : 'Kilometerstand'}
                onChange={(value) => setSortBy(value === 'Datum' ? 'created_at' : value === 'Prijs' ? 'prijs' : value === 'Bouwjaar vanaf' ? 'bouwjaar' : 'kilometerstand')}
                options={["Datum", "Prijs", "Bouwjaar vanaf", "Kilometerstand"]}
                placeholder="Datum"
              />
            </div>

            {/* Sort Order Button */}
            <div className="flex-1">
              <CustomDropdown
                value={sortOrder === 'desc' ? 'Aflopend' : 'Oplopend'}
                onChange={(value) => setSortOrder(value === 'Aflopend' ? 'desc' : 'asc')}
                options={["Aflopend", "Oplopend"]}
                placeholder="Aflopend"
              />
            </div>
          </div>
        </div>

        {/* Filter and Reset Controls Row */}
        <div className="flex flex-col gap-4">
          {/* Filter Toggle Button */}
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="default" size="default" className="w-full">
                <Filter className="h-4 w-4 shrink-0" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 px-2 py-0 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          </Collapsible>

          {/* Reset All Button */}
          {hasActiveFilters && (
            <Button variant="default" size="sm" onClick={handleReset} className="w-full">
              <X className="h-4 w-4 mr-1" />
              <span>Reset filters</span>
            </Button>
          )}
        </div>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>

        {/* Active Filters and Reset */}
        <div className="flex items-center gap-4 flex-wrap mb-4">
          {/* Active Filters as Badges */}
          {search && (
            <Button variant="active" size="sm" onClick={() => clearFilter('search')}>
              Zoeken: {search}
              <X className="h-3 w-3 ml-1" />
            </Button>
          )}
          {selectedMerk && (
            <Button variant="active" size="sm" onClick={() => clearFilter('merk')}>
              Merk: {selectedMerk}
              <X className="h-3 w-3 ml-1" />
            </Button>
          )}
          {(minPrijs !== options.minPrijs || maxPrijs !== options.maxPrijs) && (
            <Button variant="active" size="sm" onClick={() => clearFilter('prijs')}>
              Prijs: €{minPrijs.toLocaleString()} - €{maxPrijs.toLocaleString()}
              <X className="h-3 w-3 ml-1" />
            </Button>
          )}
          {(minBouwjaar !== options.minBouwjaar || maxBouwjaar !== options.maxBouwjaar) && (
            <Button variant="active" size="sm" onClick={() => clearFilter('bouwjaar')}>
              Bouwjaar: {minBouwjaar} - {maxBouwjaar}
              <X className="h-3 w-3 ml-1" />
            </Button>
          )}
          {selectedBrandstofType && (
            <Button variant="active" size="sm" onClick={() => clearFilter('brandstof')}>
              Brandstof: {selectedBrandstofType}
              <X className="h-3 w-3 ml-1" />
            </Button>
          )}
          {selectedTransmissie && (
            <Button variant="active" size="sm" onClick={() => clearFilter('transmissie')}>
              Transmissie: {selectedTransmissie}
              <X className="h-3 w-3 ml-1" />
            </Button>
          )}
          {(sortBy !== "created_at" || sortOrder !== "desc") && (
            <Button variant="active" size="sm" onClick={() => clearFilter('sortering')}>
              Sortering: {sortBy === 'created_at' ? 'Datum' : sortBy === 'prijs' ? 'Prijs' : sortBy === 'bouwjaar' ? 'Bouwjaar vanaf' : 'Kilometerstand'} {sortOrder === 'asc' ? '↑' : '↓'}
              <X className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>

        {/* Expandable Filter Content */}
        <CollapsibleContent className="mt-4">
          <div className="bg-background border border-[#030303] rounded-lg p-6">
            {/* Bovenste rij: Merk, Brandstof, Transmissie */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label>Merk</Label>
                <CustomDropdown
                  value={selectedMerk}
                  onChange={setSelectedMerk}
                  options={["Selecteer merk...", ...options.merken]}
                  placeholder="Selecteer merk..."
                />
              </div>

              <div>
                <Label>Brandstof</Label>
                <CustomDropdown
                  value={selectedBrandstofType}
                  onChange={setSelectedBrandstofType}
                  options={["Selecteer brandstof...", ...options.brandstofTypes]}
                  placeholder="Selecteer brandstof..."
                />
              </div>

              <div>
                <Label>Transmissie</Label>
                <CustomDropdown
                  value={selectedTransmissie}
                  onChange={setSelectedTransmissie}
                  options={["Selecteer transmissie...", ...options.transmissieTypes]}
                  placeholder="Selecteer transmissie..."
                />
              </div>
            </div>

            {/* Onderste rij: Bouwjaar vanaf, Prijs vanaf, Prijs tot */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Bouwjaar vanaf</Label>
                <Input
                  className={inputClass}
                  type="number"
                  value={minBouwjaar}
                  onChange={(e) => setMinBouwjaar(Number(e.target.value))}
                  min={options.minBouwjaar}
                  max={maxBouwjaar}
                  style={{ lineHeight: '24px' }}
                />
              </div>

              <div>
                <Label>Prijs vanaf (€)</Label>
                <Input
                  className={inputClass}
                  type="number"
                  value={minPrijs}
                  style={{ lineHeight: '24px' }}
                  onChange={(e) => setMinPrijs(Number(e.target.value))}
                  min={options.minPrijs}
                  max={maxPrijs}
                  step={1000}
                />
              </div>

              <div>
                <Label>Prijs tot (€)</Label>
                <Input
                  className={inputClass}
                  type="number"
                  value={maxPrijs}
                  onChange={(e) => setMaxPrijs(Number(e.target.value))}
                  min={minPrijs}
                  max={options.maxPrijs}
                  step={1000}
                  style={{ lineHeight: '24px' }}
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export { CustomDropdown };
export default CarFilters;