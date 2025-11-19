import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

// Custom styling om te matchen met de rest van de site
const inputClass = "kraakman-input";
const textareaClass = "kraakman-textarea";
const selectClass = "kraakman-native-select";
const selectWrapperClass = "relative";
const selectTriggerClass = "kraakman-select-trigger";
const selectContentClass = "kraakman-select-content";
const selectItemClass = "kraakman-select-item";
const submitButtonClass = "kraakman-button-secondary";
const deleteButtonClass = "kraakman-button-danger";
const editButtonClass = "kraakman-button-secondary";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import PhotoManager from "@/components/PhotoManager";
import { LogOut, Plus, Image, Trash2, Pencil, X } from "lucide-react";
import CarFilters, { CustomDropdown } from "@/components/CarFilters";
import TagInput from "@/components/TagInput";
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [photoCarId, setPhotoCarId] = useState<string | null>(null);
  const [carToDelete, setCarToDelete] = useState<Car | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
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
    voertuig_type: "",
    bouwjaar: new Date().getFullYear(),
    transmissie: "",
    kleur: "",
    kilometerstand: 0,
    prijs: 0,
    btw_auto: false,
    status: "aanbod" as "aanbod" | "verkocht",
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

  const handleDelete = (car: Car) => {
    setCarToDelete(car);
    setDeleteConfirmation("");
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!carToDelete || deleteConfirmation !== carToDelete.merk) return;

    const { error } = await supabase.from("cars").delete().eq("id", carToDelete.id);

    if (error) {
      toast({
        title: "Fout",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Permanent Verwijderd",
        description: `${carToDelete.merk} ${carToDelete.model} is permanent verwijderd uit de database.`,
      });
      loadCars();
    }

    setIsDeleteDialogOpen(false);
    setCarToDelete(null);
    setDeleteConfirmation("");
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
        voertuig_type: fullCarData.voertuig_type || "",
        bouwjaar: fullCarData.bouwjaar,
        transmissie: fullCarData.transmissie || "",
        kleur: fullCarData.kleur || "",
        kilometerstand: fullCarData.kilometerstand || 0,
        prijs: fullCarData.prijs,
        btw_auto: fullCarData.btw_auto || false,
        status: fullCarData.status,
        binnenkort_beschikbaar: fullCarData.binnenkort_beschikbaar || false,
        gereserveerd: fullCarData.gereserveerd || false,
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
      voertuig_type: "",
      bouwjaar: new Date().getFullYear(),
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
    });
    setOpties([]);
    setImageFiles(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <Navigation />
      <div style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
        <div className="container-wide flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 py-8 sm:py-16" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Admin Dashboard</h1>
          <Button variant="secondary" size="lg" onClick={handleLogout} className="w-full sm:w-auto">
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Uitloggen</span>
            <span className="sm:hidden">Logout</span>
          </Button>
        </div>
      </div>

      <div className="container-wide px-4 py-8 sm:py-16" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
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
              <Button variant="secondary" size="lg" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nieuwe Auto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" style={{ width: '90vw', maxWidth: '1800px' }} hideCloseButton={true}>
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
                        onChange={(value: "aanbod" | "verkocht") =>
                          setFormData({
                            ...formData,
                            status: value,
                            // If car is sold, uncheck both "Binnenkort beschikbaar" and "Gereserveerd"
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
                            // If "Binnenkort beschikbaar" is checked, uncheck "Gereserveerd"
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
                            // If "Gereserveerd" is checked, uncheck "Binnenkort beschikbaar"
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

                <div>
                  <Label>Omschrijving</Label>
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
          <div className="space-y-4">
            {/* Desktop/Tablet Table View */}
            <div className="hidden lg:block">
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
                            <Button
                              size="sm"
                              onClick={() => {
                                setPhotoCarId(car.id);
                                setIsPhotoDialogOpen(true);
                              }}
                              title="Foto's beheren"
                            >
                              <Image className="w-4 h-4 mr-1" />
                              Foto's
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openEditDialog(car)}
                            >
                              <Pencil className="w-4 h-4 mr-1" />
                              Bewerken
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleDelete(car)}
                              className="hover:bg-red-600 hover:text-white hover:border-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              Verwijder
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tablet View - Simplified Table */}
            <div className="hidden md:block lg:hidden">
              <div style={{ border: '1px solid var(--color-border-primary)' }}>
                <table className="w-full">
                  <thead style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <tr>
                      <th className="text-left p-3" style={{ color: 'var(--color-text-primary)' }}>Auto</th>
                      <th className="text-left p-3" style={{ color: 'var(--color-text-primary)' }}>Prijs</th>
                      <th className="text-left p-3" style={{ color: 'var(--color-text-primary)' }}>Status</th>
                      <th className="text-left p-3" style={{ color: 'var(--color-text-primary)' }}>Acties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCars.map((car) => (
                      <tr key={car.id} style={{ borderTop: '1px solid var(--color-border-primary)' }}>
                        <td className="p-3" style={{ color: 'var(--color-text-primary)' }}>
                          <div className="font-medium">{car.merk} {car.model}</div>
                          <div className="text-sm opacity-75">{car.bouwjaar}</div>
                        </td>
                        <td className="p-3" style={{ color: 'var(--color-text-primary)' }}>€ {car.prijs.toLocaleString()}</td>
                        <td className="p-3">
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
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => openEditDialog(car)}
                              title="Bewerken"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleDelete(car)}
                              className="hover:bg-red-600 hover:text-white hover:border-red-600"
                              title="Verwijderen"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View - Card Layout */}
            <div className="md:hidden space-y-3">
              {filteredCars.map((car) => (
                <div
                  key={car.id}
                  className="border rounded-lg p-4 space-y-3"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border-primary)'
                  }}
                >
                  {/* Header with Title and Status */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                        {car.merk} {car.model}
                      </h3>
                      <p className="text-sm opacity-75" style={{ color: 'var(--color-text-secondary)' }}>
                        {car.bouwjaar}
                      </p>
                    </div>
                    <span
                      className="px-2 py-1 text-xs rounded"
                      style={{
                        backgroundColor: car.status === "aanbod" ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                        color: car.status === "aanbod" ? 'var(--color-background)' : 'var(--color-text-primary)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {car.status}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    € {car.prijs.toLocaleString()}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setPhotoCarId(car.id);
                        setIsPhotoDialogOpen(true);
                      }}
                      className="flex-1"
                    >
                      <Image className="w-4 h-4 mr-1" />
                      Foto's
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openEditDialog(car)}
                      className="flex-1"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Bewerken
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleDelete(car)}
                      className="hover:bg-red-600 hover:text-white hover:border-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" style={{ width: '90vw', maxWidth: '1800px' }} hideCloseButton={true}>
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent
            className="max-w-md w-full"
            style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-primary)' }}
            hideCloseButton={true}
          >
            <DialogHeader>
              <DialogTitle style={{ color: 'var(--color-secondary)' }}>Auto Permanent Verwijderen</DialogTitle>
            </DialogHeader>

            {carToDelete && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-800 mb-2">⚠️ WAARSCHUWING</p>
                  <p className="text-xs text-red-700 mb-3">
                    Deze actie is permanent en kan niet ongedaan worden gemaakt.
                    De auto en alle gerelateerde data worden permanent uit de database verwijderd.
                  </p>
                  <div className="text-sm text-gray-700">
                    <p><strong>Auto:</strong> {carToDelete.merk} {carToDelete.model}</p>
                    <p><strong>Bouwjaar:</strong> {carToDelete.bouwjaar}</p>
                    <p><strong>Prijs:</strong> €{carToDelete.prijs.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deleteConfirmation">
                    Typ <strong>"{carToDelete.merk}"</strong> om te bevestigen:
                  </Label>
                  <Input
                    id="deleteConfirmation"
                    className="kraakman-input"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder={carToDelete.merk}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && deleteConfirmation === carToDelete.merk) {
                        confirmDelete();
                      }
                    }}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="default"
                    size="default"
                    onClick={confirmDelete}
                    disabled={deleteConfirmation !== carToDelete.merk}
                    className="flex-1 bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Permanent Verwijderen
                  </Button>
                  <Button
                    variant="secondary"
                    size="default"
                    onClick={() => {
                      setIsDeleteDialogOpen(false);
                      setCarToDelete(null);
                      setDeleteConfirmation("");
                    }}
                    className="flex-1"
                  >
                    Annuleren
                  </Button>
                </div>

                {deleteConfirmation && deleteConfirmation !== carToDelete.merk && (
                  <p className="text-xs text-red-600 text-center">
                    Merk komt niet overeen. Typ "{carToDelete.merk}" om te bevestigen.
                  </p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
