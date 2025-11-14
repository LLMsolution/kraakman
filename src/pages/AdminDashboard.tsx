import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Custom styling om te matchen met de rest van de site
const inputClass = "h-12 border border-[#030303] bg-[#F1EFEC] focus:border-[#030303] focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:border-[#030303] transition-none px-4 py-3";
const textareaClass = "min-h-[100px] border border-[#030303] bg-[#F1EFEC] focus:border-[#030303] focus:ring-0 hover:border-[#030303] transition-none resize-none";
const selectClass = "kraakman-native-select";
const selectWrapperClass = "relative";
const selectTriggerClass = "!h-12 !border !border-[#030303] !bg-[#F1EFEC] !text-[#030303] focus:!border-[#030303] focus:!ring-0 hover:!border-[#030303] transition-none";
const selectContentClass = "!border-2 !border-[#030303] !bg-[#F1EFEC]";
const selectItemClass = "hover:bg-[#d4c9bf4d] focus:bg-[#d4c9bf4d] cursor-pointer";
const submitButtonClass = "h-12 border-2 border-[#030303] bg-[#F1EFEC] text-[#030303] hover:bg-[#123458] hover:text-[#F1EFEC] transition-colors font-medium";
const deleteButtonClass = "h-12 border-2 border-[#030303] bg-[#F1EFEC] text-[#030303] hover:bg-red-600 hover:text-white transition-colors font-medium";
const editButtonClass = "h-12 border-2 border-[#030303] bg-[#F1EFEC] text-[#030303] hover:bg-[#123458] hover:text-[#F1EFEC] transition-colors font-medium";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import PhotoManager from "@/components/PhotoManager";
import { LogOut, Plus, Image, Trash2, Pencil, X } from "lucide-react";
import CarFilters, { CustomDropdown } from "@/components/CarFilters";
import TagInput from "@/components/TagInput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Car = {
  id: string;
  merk: string;
  model: string;
  type: string | null;
  bouwjaar: number;
  transmissie: string | null;
  kleur: string | null;
  kilometerstand: number | null;
  prijs: number;
  status: "aanbod" | "verkocht";
  binnenkort_beschikbaar: boolean | null;
  omschrijving: string | null;
  opties: string[] | null;
  techniek: string | null;
  voertuig_type: string | null;
  zitplaatsen: number | null;
  deuren: number | null;
  brandstof_type: string | null;
  motor_cc: number | null;
  motor_cilinders: number | null;
  vermogen_pk: number | null;
  gewicht_kg: number | null;
  topsnelheid_kmh: number | null;
  acceleratie_0_100: number | null;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [photoCarId, setPhotoCarId] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState({
    merken: [] as string[],
    minPrijs: 0,
    maxPrijs: 0,
    minBouwjaar: 0,
    maxBouwjaar: 0,
    brandstofTypes: [] as string[],
    transmissieTypes: [] as string[],
  });
  const [formData, setFormData] = useState({
    merk: "",
    model: "",
    type: "",
    voertuig_type: "",
    bouwjaar: new Date().getFullYear(),
    transmissie: "",
    kleur: "",
    kilometerstand: 0,
    prijs: 0,
    btw_auto: false,
    status: "aanbod" as "aanbod" | "verkocht",
    binnenkort_beschikbaar: false,
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
  });
  const [opties, setOpties] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/admin");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (!roleData || roleData.role !== "admin") {
      toast({
        title: "Geen toegang",
        description: "Je hebt geen admin rechten.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    loadCars();
  };

  const loadCars = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Fout",
        description: "Kon auto's niet laden.",
        variant: "destructive",
      });
    } else {
      const carsData = data || [];
      setCars(carsData);
      setFilteredCars(carsData);

      // Calculate dynamic filter options
      if (carsData.length > 0) {
        const merken = Array.from(new Set(carsData.map(car => car.merk))).sort();
        const prijzen = carsData.map(car => car.prijs);
        const bouwjaren = carsData.map(car => car.bouwjaar);
        const brandstofTypes = Array.from(new Set(carsData.map(car => car.brandstof_type).filter(Boolean))).sort();
        const transmissieTypes = Array.from(new Set(carsData.map(car => car.transmissie).filter(Boolean))).sort();

        setFilterOptions({
          merken,
          minPrijs: Math.min(...prijzen),
          maxPrijs: Math.max(...prijzen),
          minBouwjaar: Math.min(...bouwjaren),
          maxBouwjaar: Math.max(...bouwjaren),
          brandstofTypes,
          transmissieTypes,
        });
      }
    }
    setLoading(false);
  };

  const handleFilterChange = (filters: {
    search: string;
    merk: string;
    minPrijs: number;
    maxPrijs: number;
    minBouwjaar: number;
    maxBouwjaar: number;
  }) => {
    let filtered = [...cars];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (car) =>
          car.merk.toLowerCase().includes(searchLower) ||
          car.model.toLowerCase().includes(searchLower) ||
          car.type?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.merk) {
      filtered = filtered.filter((car) => car.merk === filters.merk);
    }

    filtered = filtered.filter(
      (car) => car.prijs >= filters.minPrijs && car.prijs <= filters.maxPrijs
    );

    filtered = filtered.filter(
      (car) =>
        car.bouwjaar >= filters.minBouwjaar &&
        car.bouwjaar <= filters.maxBouwjaar
    );

    setFilteredCars(filtered);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const carData = {
        ...formData,
        opties: opties.length > 0 ? opties : null,
      };

      if (editingCar) {
        const { error } = await supabase
          .from("cars")
          .update(carData)
          .eq("id", editingCar.id);

        if (error) throw error;

        toast({
          title: "Bijgewerkt",
          description: "Auto succesvol bijgewerkt.",
        });
      } else {
        const { data: newCar, error } = await supabase
          .from("cars")
          .insert([carData])
          .select()
          .single();

        if (error) throw error;

        if (imageFiles && imageFiles.length > 0) {
          await uploadImages(newCar.id);
        }

        toast({
          title: "Toegevoegd",
          description: "Auto succesvol toegevoegd.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadCars();
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async (carId: string) => {
    if (!imageFiles) return;

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `${carId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("car-images")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("car-images")
        .getPublicUrl(fileName);

      await supabase.from("car_images").insert({
        car_id: carId,
        url: publicUrl,
        display_order: i,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Weet je zeker dat je deze auto wilt verwijderen?")) return;

    const { error } = await supabase.from("cars").delete().eq("id", id);

    if (error) {
      toast({
        title: "Fout",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Verwijderd",
        description: "Auto succesvol verwijderd.",
      });
      loadCars();
    }
  };

  const openEditDialog = async (car: Car) => {
    setEditingCar(car);
    
    // Load full car data
    const { data: fullCarData } = await supabase
      .from("cars")
      .select("*")
      .eq("id", car.id)
      .single();

    if (fullCarData) {
      setFormData({
        merk: fullCarData.merk,
        model: fullCarData.model,
        type: fullCarData.type || "",
        voertuig_type: fullCarData.voertuig_type || "",
        bouwjaar: fullCarData.bouwjaar,
        transmissie: fullCarData.transmissie || "",
        kleur: fullCarData.kleur || "",
        kilometerstand: fullCarData.kilometerstand || 0,
        prijs: fullCarData.prijs,
        btw_auto: fullCarData.btw_auto || false,
        status: fullCarData.status,
        binnenkort_beschikbaar: fullCarData.binnenkort_beschikbaar || false,
        omschrijving: fullCarData.omschrijving || "",
        zitplaatsen: fullCarData.zitplaatsen || 5,
        deuren: fullCarData.deuren || 5,
        brandstof_type: fullCarData.brandstof_type || "",
        motor_cc: fullCarData.motor_cc || 0,
        motor_cilinders: fullCarData.motor_cilinders || 0,
        vermogen_pk: fullCarData.vermogen_pk || 0,
        gewicht_kg: fullCarData.gewicht_kg || 0,
        topsnelheid_kmh: fullCarData.topsnelheid_kmh || 0,
        acceleratie_0_100: fullCarData.acceleratie_0_100 || 0,
      });
      setOpties(fullCarData.opties || []);
    }
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCar(null);
    setFormData({
      merk: "",
      model: "",
      type: "",
      voertuig_type: "",
      bouwjaar: new Date().getFullYear(),
      transmissie: "",
      kleur: "",
      kilometerstand: 0,
      prijs: 0,
      btw_auto: false,
      status: "aanbod",
      binnenkort_beschikbaar: false,
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
    });
    setOpties([]);
    setImageFiles(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <Navigation />
      <div style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
        <div className="container-wide section-padding flex justify-between items-center" style={{ paddingTop: '64px', paddingBottom: '64px' }}>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 font-medium px-8 transition-colors border"
            style={{
              backgroundColor: 'var(--color-button-secondary-bg)',
              color: 'var(--color-button-secondary-text)',
              borderColor: 'var(--color-button-secondary-border)',
              minHeight: '2.5rem',
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-button-secondary-hover-bg)';
              e.currentTarget.style.color = 'var(--color-button-secondary-hover-text)';
              e.currentTarget.style.borderColor = 'var(--color-button-secondary-hover-border)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-button-secondary-bg)';
              e.currentTarget.style.color = 'var(--color-button-secondary-text)';
              e.currentTarget.style.borderColor = 'var(--color-button-secondary-border)';
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Uitloggen
          </button>
        </div>
      </div>

      <div className="container-wide section-padding" style={{ paddingTop: '64px', paddingBottom: '64px' }}>
        {cars.length > 0 && (
          <CarFilters
            options={filterOptions}
            onFilterChange={handleFilterChange}
          />
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Auto's Beheer</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button
                onClick={resetForm}
                className="inline-flex items-center gap-2 font-medium px-8 transition-colors border"
                style={{
                  backgroundColor: 'var(--color-button-secondary-bg)',
                  color: 'var(--color-button-secondary-text)',
                  borderColor: 'var(--color-button-secondary-border)',
                  minHeight: '2.5rem',
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-button-secondary-hover-bg)';
                  e.currentTarget.style.color = 'var(--color-button-secondary-hover-text)';
                  e.currentTarget.style.borderColor = 'var(--color-button-secondary-hover-border)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-button-secondary-bg)';
                  e.currentTarget.style.color = 'var(--color-button-secondary-text)';
                  e.currentTarget.style.borderColor = 'var(--color-button-secondary-border)';
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nieuwe Auto
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" style={{ width: '90vw', maxWidth: '1200px' }} hideCloseButton={true}>
              <button
                onClick={() => setIsDialogOpen(false)}
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
                  e.currentTarget.querySelector('svg').style.color = 'var(--color-text-inverse)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.border = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.querySelector('svg').style.color = 'var(--color-text-primary)';
                }}
              >
                <X className="h-5 w-5" style={{ color: 'var(--color-text-primary)', transition: 'color 0.2s ease' }} />
              </button>
              <DialogHeader className="pr-16">
                <DialogTitle>
                  {editingCar ? "Auto Bewerken" : "Nieuwe Auto Toevoegen"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Basis Informatie</h3>
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label>Type</Label>
                      <Input
                        className={inputClass}
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        placeholder="Bijv. B6"
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
                        value={formData.bouwjaar}
                        onChange={(e) => setFormData({ ...formData, bouwjaar: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Prijs (€) *</Label>
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
                      <Label>Status *</Label>
                      <CustomDropdown
                        value={formData.status}
                        onChange={(value: "aanbod" | "verkocht") =>
                          setFormData({ ...formData, status: value })
                        }
                        options={["Selecteer status...", "aanbod", "verkocht"]}
                        placeholder="Selecteer status..."
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="binnenkort_beschikbaar"
                        checked={formData.binnenkort_beschikbaar}
                        onChange={(e) => setFormData({ ...formData, binnenkort_beschikbaar: e.target.checked })}
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '0px',
                          border: '1px solid #030303',
                          backgroundColor: formData.binnenkort_beschikbaar ? '#123458' : '#F1EFEC',
                          cursor: 'pointer',
                          accentColor: '#123458'
                        }}
                      />
                      <Label htmlFor="binnenkort_beschikbaar" className="cursor-pointer">Binnenkort beschikbaar</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="btw_auto"
                        checked={formData.btw_auto}
                        onChange={(e) => setFormData({ ...formData, btw_auto: e.target.checked })}
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '0px',
                          border: '1px solid #030303',
                          backgroundColor: formData.btw_auto ? '#123458' : '#F1EFEC',
                          cursor: 'pointer',
                          accentColor: '#123458'
                        }}
                      />
                      <Label htmlFor="btw_auto" className="cursor-pointer">BTW Auto</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Specificaties</h3>
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label>Kleur</Label>
                      <Input
                        className={inputClass}
                        value={formData.kleur}
                        onChange={(e) => setFormData({ ...formData, kleur: e.target.value })}
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

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Technische Gegevens</h3>
                  <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <Label>Omschrijving</Label>
                  <Textarea
                    className={textareaClass}
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
                <Button type="submit" className={`${submitButtonClass} w-full`} disabled={loading}>
                  {loading ? "Opslaan..." : editingCar ? "Bijwerken" : "Toevoegen"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p>Laden...</p>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">
              {cars.length === 0
                ? "Nog geen auto's toegevoegd."
                : "Geen auto's gevonden met de geselecteerde filters."}
            </p>
          </div>
        ) : (
          <div style={{ border: '1px solid var(--color-border-primary)' }}>
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <tr>
                  <th className="text-left p-4" style={{ color: 'var(--color-text-primary)' }}>Merk</th>
                  <th className="text-left p-4" style={{ color: 'var(--color-text-primary)' }}>Model</th>
                  <th className="text-left p-4" style={{ color: 'var(--color-text-primary)' }}>Bouwjaar</th>
                  <th className="text-left p-4" style={{ color: 'var(--color-text-primary)' }}>Prijs</th>
                  <th className="text-left p-4" style={{ color: 'var(--color-text-primary)' }}>Status</th>
                  <th className="text-left p-4" style={{ color: 'var(--color-text-primary)' }}>Acties</th>
                </tr>
              </thead>
              <tbody>
                {filteredCars.map((car) => (
                  <tr key={car.id} style={{ borderTop: '1px solid var(--color-border-primary)' }}>
                    <td className="p-4" style={{ color: 'var(--color-text-primary)' }}>{car.merk}</td>
                    <td className="p-4" style={{ color: 'var(--color-text-primary)' }}>{car.model}</td>
                    <td className="p-4" style={{ color: 'var(--color-text-primary)' }}>{car.bouwjaar}</td>
                    <td className="p-4" style={{ color: 'var(--color-text-primary)' }}>€ {car.prijs.toLocaleString()}</td>
                    <td className="p-4">
                      <span
                        className="px-2 py-1 text-xs rounded"
                        style={{
                          backgroundColor: car.status === "aanbod" ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                          color: car.status === "aanbod" ? 'var(--color-background)' : 'var(--color-text-primary)'
                        }}
                      >
                        {car.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setPhotoCarId(car.id);
                            setIsPhotoDialogOpen(true);
                          }}
                          title="Foto's beheren"
                          className="inline-flex items-center gap-1 font-medium px-3 py-1 transition-colors border text-sm"
                          style={{
                            backgroundColor: 'var(--color-button-secondary-bg)',
                            color: 'var(--color-button-secondary-text)',
                            borderColor: 'var(--color-button-secondary-border)',
                            minHeight: '2rem'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-button-secondary-hover-bg)';
                            e.currentTarget.style.color = 'var(--color-button-secondary-hover-text)';
                            e.currentTarget.style.borderColor = 'var(--color-button-secondary-hover-border)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-button-secondary-bg)';
                            e.currentTarget.style.color = 'var(--color-button-secondary-text)';
                            e.currentTarget.style.borderColor = 'var(--color-button-secondary-border)';
                          }}
                        >
                          <Image className="w-4 h-4 mr-1" />
                          Foto's
                        </button>
                        <button
                          onClick={() => openEditDialog(car)}
                          className="inline-flex items-center gap-1 font-medium px-3 py-1 transition-colors border text-sm"
                          style={{
                            backgroundColor: 'var(--color-button-secondary-bg)',
                            color: 'var(--color-button-secondary-text)',
                            borderColor: 'var(--color-button-secondary-border)',
                            minHeight: '2rem'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-button-secondary-hover-bg)';
                            e.currentTarget.style.color = 'var(--color-button-secondary-hover-text)';
                            e.currentTarget.style.borderColor = 'var(--color-button-secondary-hover-border)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-button-secondary-bg)';
                            e.currentTarget.style.color = 'var(--color-button-secondary-text)';
                            e.currentTarget.style.borderColor = 'var(--color-button-secondary-border)';
                          }}
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Bewerken
                        </button>
                        <button
                          onClick={() => handleDelete(car.id)}
                          className="inline-flex items-center gap-1 font-medium px-3 py-1 transition-colors border text-sm"
                          style={{
                            backgroundColor: 'var(--color-button-secondary-bg)',
                            color: 'var(--color-button-secondary-text)',
                            borderColor: 'var(--color-button-secondary-border)',
                            minHeight: '2rem'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.borderColor = '#dc2626';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-button-secondary-bg)';
                            e.currentTarget.style.color = 'var(--color-button-secondary-text)';
                            e.currentTarget.style.borderColor = 'var(--color-button-secondary-border)';
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Verwijder
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" style={{ width: '90vw', maxWidth: '1200px' }} hideCloseButton={true}>
            <button
              onClick={() => setIsPhotoDialogOpen(false)}
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
                e.currentTarget.querySelector('svg').style.color = 'var(--color-text-inverse)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.border = 'none';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.querySelector('svg').style.color = 'var(--color-text-primary)';
              }}
            >
              <X className="h-5 w-5" style={{ color: 'var(--color-text-primary)', transition: 'color 0.2s ease' }} />
            </button>
            <DialogHeader className="pr-16">
              <DialogTitle>Foto's Beheren</DialogTitle>
            </DialogHeader>
            {photoCarId && <PhotoManager carId={photoCarId} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
