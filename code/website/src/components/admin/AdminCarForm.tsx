import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CustomDropdown } from "@/components/CarFilters";
import TagInput from "@/components/TagInput";
import { Plus, X, Sparkles, Loader2 } from "lucide-react";
import { Car } from "@/types";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const inputClass = "kraakman-input";
const textareaClass = "kraakman-textarea";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface CarFormState {
  kenteken: string;
  merk: string;
  model: string;
  voertuig_type: string;
  bouwjaar: number;
  transmissie: string;
  kleur: string;
  kilometerstand: number;
  prijs: number;
  btw_auto: boolean;
  status: "aanbod" | "verkocht";
  binnenkort_beschikbaar: boolean;
  gereserveerd: boolean;
  omschrijving: string;
  zitplaatsen: number;
  deuren: number;
  brandstof_type: string;
  motor_cc: number;
  motor_cilinders: number;
  vermogen_pk: number;
  gewicht_kg: number;
  topsnelheid_kmh: number;
  acceleratie_0_100: number;
}

export const INITIAL_FORM_STATE: CarFormState = {
  kenteken: "",
  merk: "",
  model: "",
  voertuig_type: "",
  bouwjaar: 0,
  transmissie: "",
  kleur: "",
  kilometerstand: 0,
  prijs: 0,
  btw_auto: false,
  status: "aanbod",
  binnenkort_beschikbaar: false,
  gereserveerd: false,
  omschrijving: "",
  zitplaatsen: 5,
  deuren: 5,
  brandstof_type: "",
  motor_cc: 0,
  motor_cilinders: 0,
  vermogen_pk: 0,
  gewicht_kg: 0,
  topsnelheid_kmh: 0,
  acceleratie_0_100: 0,
};

interface AdminCarFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingCar: Car | null;
  formData: CarFormState;
  setFormData: React.Dispatch<React.SetStateAction<CarFormState>>;
  opties: string[];
  setOpties: React.Dispatch<React.SetStateAction<string[]>>;
  imageFiles: FileList | null;
  setImageFiles: React.Dispatch<React.SetStateAction<FileList | null>>;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onResetForm: () => void;
}

const AdminCarForm = ({
  isOpen,
  onOpenChange,
  editingCar,
  formData,
  setFormData,
  opties,
  setOpties,
  imageFiles,
  setImageFiles,
  loading,
  onSubmit,
  onResetForm,
}: AdminCarFormProps) => {
  const { toast } = useToast();
  const [aiFillingSpecs, setAiFillingSpecs] = useState(false);
  const [aiGeneratingDesc, setAiGeneratingDesc] = useState(false);

  const handleAiAutofill = async () => {
    if (!formData.kenteken && !formData.merk && !formData.model) {
      toast({
        title: "Gegevens nodig",
        description: "Vul minimaal een kenteken of merk + model in.",
        variant: "destructive",
      });
      return;
    }

    setAiFillingSpecs(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        toast({ title: "Niet ingelogd", description: "Log opnieuw in.", variant: "destructive" });
        setAiFillingSpecs(false);
        return;
      }

      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-autofill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          kenteken: formData.kenteken || undefined,
          merk: formData.merk || undefined,
          model: formData.model || undefined,
          bouwjaar: formData.bouwjaar || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "AI autofill mislukt");
      }

      const d = json.data;

      // Track filled fields synchronously BEFORE setState (React 18 batches callbacks)
      const fieldMap: [keyof CarFormState, string][] = [
        ["merk", "Merk"],
        ["model", "Model"],
        ["voertuig_type", "Type"],
        ["bouwjaar", "Bouwjaar"],
        ["kleur", "Kleur"],
        ["zitplaatsen", "Zitplaatsen"],
        ["deuren", "Deuren"],
        ["gewicht_kg", "Gewicht"],
        ["brandstof_type", "Brandstof"],
        ["motor_cc", "Motor cc"],
        ["motor_cilinders", "Cilinders"],
        ["transmissie", "Transmissie"],
        ["vermogen_pk", "Vermogen"],
        ["topsnelheid_kmh", "Topsnelheid"],
        ["acceleratie_0_100", "Acceleratie"],
      ];

      const filledFields = fieldMap
        .filter(([key]) => d[key] != null && d[key] !== "")
        .map(([, label]) => label);

      setFormData((prev) => {
        const updated = { ...prev };
        for (const [key] of fieldMap) {
          if (d[key] != null && d[key] !== "") {
            (updated as any)[key] = d[key];
          }
        }
        return updated;
      });

      if (d.opties && Array.isArray(d.opties) && d.opties.length > 0) {
        setOpties(d.opties);
        filledFields.push(`${d.opties.length} opties`);
      }

      toast({
        title: "AI heeft velden ingevuld",
        description: filledFields.length > 0
          ? `Ingevuld: ${filledFields.join(", ")}`
          : "Geen extra gegevens gevonden.",
      });
    } catch (err: any) {
      toast({
        title: "AI autofill mislukt",
        description: err.message || "Er ging iets mis.",
        variant: "destructive",
      });
    } finally {
      setAiFillingSpecs(false);
    }
  };

  const handleAiGenerateDescription = async () => {
    if (!formData.merk && !formData.model) {
      toast({
        title: "Gegevens nodig",
        description: "Vul minimaal merk en model in.",
        variant: "destructive",
      });
      return;
    }

    setAiGeneratingDesc(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        toast({ title: "Niet ingelogd", description: "Log opnieuw in.", variant: "destructive" });
        setAiGeneratingDesc(false);
        return;
      }

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/ai-generate-description`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            merk: formData.merk,
            model: formData.model,
            bouwjaar: formData.bouwjaar,
            voertuig_type: formData.voertuig_type,
            brandstof_type: formData.brandstof_type,
            transmissie: formData.transmissie,
            vermogen_pk: formData.vermogen_pk,
            motor_cc: formData.motor_cc,
            motor_cilinders: formData.motor_cilinders,
            kilometerstand: formData.kilometerstand,
            kleur: formData.kleur,
            gewicht_kg: formData.gewicht_kg,
            topsnelheid_kmh: formData.topsnelheid_kmh,
            acceleratie_0_100: formData.acceleratie_0_100,
            zitplaatsen: formData.zitplaatsen,
            deuren: formData.deuren,
            prijs: formData.prijs,
            kenteken: formData.kenteken || undefined,
            opties: opties.length > 0 ? opties : undefined,
          }),
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Omschrijving genereren mislukt");
      }

      if (json.data?.omschrijving) {
        setFormData((prev) => ({
          ...prev,
          omschrijving: json.data.omschrijving,
        }));
        toast({
          title: "Omschrijving gegenereerd",
          description: "Je kunt de tekst nog aanpassen voordat je opslaat.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Omschrijving genereren mislukt",
        description: err.message || "Er ging iets mis.",
        variant: "destructive",
      });
    } finally {
      setAiGeneratingDesc(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="lg" onClick={onResetForm}>
          <Plus className="w-4 h-4 mr-2" />
          Nieuwe Auto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" style={{ width: '90vw', maxWidth: '1800px' }} hideCloseButton={true}>
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 flex items-center justify-center transition-all duration-200"
          style={{
            cursor: 'pointer',
            backgroundColor: 'transparent',
            border: 'none',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            padding: 'var(--spacing-micro)',
            margin: 'var(--spacing-micro)',
            outline: 'none',
            boxShadow: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            e.currentTarget.style.border = '1px solid var(--color-primary)';
            e.currentTarget.style.boxShadow = 'none';
            (e.currentTarget.querySelector('svg') as SVGElement).style.color = 'var(--color-text-inverse)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.border = 'none';
            e.currentTarget.style.boxShadow = 'none';
            (e.currentTarget.querySelector('svg') as SVGElement).style.color = 'var(--color-text-primary)';
          }}
        >
          <X className="h-5 w-5" style={{ color: 'var(--color-text-primary)', transition: 'color 0.2s ease' }} />
        </button>
        <DialogHeader className="pr-16">
          <DialogTitle>
            {editingCar ? "Auto Bewerken" : "Nieuwe Auto Toevoegen"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Kenteken + AI Autofill */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">AI Invulhulp</h3>
            <p className="text-sm text-muted-foreground">
              Vul een kenteken in voor automatische gegevens via RDW, of vul merk en model in. Klik daarna op de knop om alle velden automatisch in te vullen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label>Kenteken (optioneel, intern)</Label>
                <Input
                  className={inputClass}
                  value={formData.kenteken}
                  onChange={(e) => setFormData({ ...formData, kenteken: e.target.value.toUpperCase() })}
                  placeholder="Bijv. AB-123-CD"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={handleAiAutofill}
                disabled={aiFillingSpecs}
                className="whitespace-nowrap"
              >
                {aiFillingSpecs ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {aiFillingSpecs ? "Bezig met invullen..." : "Vul in met AI"}
              </Button>
            </div>
          </div>

          {/* Basis Informatie */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Basis Informatie</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Merk *</Label>
                <Input
                  className={inputClass}
                  value={formData.merk}
                  onChange={(e) => setFormData({ ...formData, merk: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Model *</Label>
                <Input
                  className={inputClass}
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Voertuig Type</Label>
                <Input
                  className={inputClass}
                  value={formData.voertuig_type}
                  onChange={(e) => setFormData({ ...formData, voertuig_type: e.target.value })}
                  placeholder="Bijv. Personenwagen, SUV"
                />
              </div>
              <div>
                <Label>Bouwjaar *</Label>
                <Input
                  className={inputClass}
                  type="number"
                  value={formData.bouwjaar || ""}
                  onChange={(e) => setFormData({ ...formData, bouwjaar: parseInt(e.target.value) || 0 })}
                  placeholder="Bijv. 2021"
                />
              </div>
              <div>
                <Label>Prijs (&#8364;) *</Label>
                <Input
                  className={inputClass}
                  type="number"
                  value={formData.prijs}
                  onChange={(e) => setFormData({ ...formData, prijs: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label>Kilometerstand</Label>
                <Input
                  className={inputClass}
                  type="number"
                  value={formData.kilometerstand}
                  onChange={(e) => setFormData({ ...formData, kilometerstand: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Kleur</Label>
                <Input
                  className={inputClass}
                  value={formData.kleur}
                  onChange={(e) => setFormData({ ...formData, kleur: e.target.value })}
                />
              </div>
              <div>
                <Label>Status *</Label>
                <CustomDropdown
                  value={formData.status}
                  onChange={(value: string) =>
                    setFormData({
                      ...formData,
                      status: value as "aanbod" | "verkocht",
                      binnenkort_beschikbaar: value === 'verkocht' ? false : formData.binnenkort_beschikbaar,
                      gereserveerd: value === 'verkocht' ? false : formData.gereserveerd
                    })
                  }
                  options={["Selecteer status...", "aanbod", "verkocht"]}
                  placeholder="Selecteer status..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="binnenkort_beschikbaar"
                  className="kraakman-checkbox"
                  checked={formData.binnenkort_beschikbaar}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    if (newValue) {
                      setFormData({
                        ...formData,
                        binnenkort_beschikbaar: true,
                        gereserveerd: false
                      });
                    } else {
                      setFormData({
                        ...formData,
                        binnenkort_beschikbaar: false
                      });
                    }
                  }}
                  disabled={formData.status === 'verkocht'}
                />
                <label
                  htmlFor="binnenkort_beschikbaar"
                  className={`kraakman-checkbox-label cursor-pointer ${formData.status === 'verkocht' ? 'opacity-50' : ''}`}
                >
                  Binnenkort beschikbaar
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="gereserveerd"
                  className="kraakman-checkbox"
                  checked={formData.gereserveerd}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    if (newValue) {
                      setFormData({
                        ...formData,
                        gereserveerd: true,
                        binnenkort_beschikbaar: false
                      });
                    } else {
                      setFormData({
                        ...formData,
                        gereserveerd: false
                      });
                    }
                  }}
                  disabled={formData.status === 'verkocht'}
                />
                <label
                  htmlFor="gereserveerd"
                  className={`kraakman-checkbox-label cursor-pointer ${formData.status === 'verkocht' ? 'opacity-50' : ''}`}
                >
                  Gereserveerd
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="btw_auto"
                  className="kraakman-checkbox"
                  checked={formData.btw_auto}
                  onChange={(e) => setFormData({ ...formData, btw_auto: e.target.checked })}
                />
                <label
                  htmlFor="btw_auto"
                  className="kraakman-checkbox-label cursor-pointer"
                >
                  BTW Auto
                </label>
              </div>
            </div>
          </div>

          {/* Specificaties */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Specificaties</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Transmissie</Label>
                <Input
                  className={inputClass}
                  value={formData.transmissie}
                  onChange={(e) => setFormData({ ...formData, transmissie: e.target.value })}
                  placeholder="Bijv. Automaat, Handgeschakeld"
                />
              </div>
              <div>
                <Label>Brandstof Type</Label>
                <Input
                  className={inputClass}
                  value={formData.brandstof_type}
                  onChange={(e) => setFormData({ ...formData, brandstof_type: e.target.value })}
                  placeholder="Bijv. Benzine, Diesel, Hybride"
                />
              </div>
              <div>
                <Label>Zitplaatsen</Label>
                <Input
                  className={inputClass}
                  type="number"
                  value={formData.zitplaatsen}
                  onChange={(e) => setFormData({ ...formData, zitplaatsen: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Deuren</Label>
                <Input
                  className={inputClass}
                  type="number"
                  value={formData.deuren}
                  onChange={(e) => setFormData({ ...formData, deuren: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Technische Gegevens */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Technische Gegevens</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Motor (cc)</Label>
                <Input
                  className={inputClass}
                  type="number"
                  value={formData.motor_cc}
                  onChange={(e) => setFormData({ ...formData, motor_cc: parseInt(e.target.value) || 0 })}
                  placeholder="Bijv. 1984"
                />
              </div>
              <div>
                <Label>Cilinders</Label>
                <Input
                  className={inputClass}
                  type="number"
                  value={formData.motor_cilinders}
                  onChange={(e) => setFormData({ ...formData, motor_cilinders: parseInt(e.target.value) || 0 })}
                  placeholder="Bijv. 4"
                />
              </div>
              <div>
                <Label>Vermogen (pk)</Label>
                <Input
                  className={inputClass}
                  type="number"
                  value={formData.vermogen_pk}
                  onChange={(e) => setFormData({ ...formData, vermogen_pk: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Gewicht (kg)</Label>
                <Input
                  className={inputClass}
                  type="number"
                  value={formData.gewicht_kg}
                  onChange={(e) => setFormData({ ...formData, gewicht_kg: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Topsnelheid (km/u)</Label>
                <Input
                  className={inputClass}
                  type="number"
                  value={formData.topsnelheid_kmh}
                  onChange={(e) => setFormData({ ...formData, topsnelheid_kmh: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Acceleratie 0-100 km/h (s)</Label>
                <Input
                  className={inputClass}
                  type="number"
                  step="0.1"
                  value={formData.acceleratie_0_100}
                  onChange={(e) => setFormData({ ...formData, acceleratie_0_100: parseFloat(e.target.value) || 0 })}
                  placeholder="Bijv. 6.5"
                />
              </div>
            </div>
          </div>

          {/* Omschrijving with AI generate button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Omschrijving</Label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAiGenerateDescription}
                disabled={aiGeneratingDesc}
              >
                {aiGeneratingDesc ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                )}
                {aiGeneratingDesc ? "Genereren..." : "Genereer omschrijving"}
              </Button>
            </div>
            <Textarea
              className={`omschrijving-textarea ${textareaClass}`}
              value={formData.omschrijving}
              onChange={(e) => setFormData({ ...formData, omschrijving: e.target.value })}
              rows={12}
            />
          </div>

          <div>
            <Label>Opties / Extra's</Label>
            <p className="text-sm text-muted-foreground mb-2">Typ een optie en druk op Enter om toe te voegen</p>
            <TagInput tags={opties} onChange={setOpties} placeholder="Bijv. Cruise control, Airco, etc." />
          </div>
          {!editingCar && (
            <div>
              <Label>Foto's</Label>
              <Input
                className={inputClass}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImageFiles(e.target.files)}
              />
            </div>
          )}
          <Button type="submit" variant="secondary" size="lg" className="w-full" disabled={loading}>
            {loading ? "Opslaan..." : editingCar ? "Bijwerken" : "Toevoegen"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCarForm;
