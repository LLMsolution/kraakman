import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import CarFilters from "@/components/CarFilters";
import AdminCarForm, { CarFormState, INITIAL_FORM_STATE } from "@/components/admin/AdminCarForm";
import AdminCarList from "@/components/admin/AdminCarList";
import AdminDeleteConfirm from "@/components/admin/AdminDeleteConfirm";
import { Car } from "@/types";
import { carService } from "@/services/carService";
import { imageService } from "@/services/imageService";
import { logger } from "@/utils/logger";
import { LogOut, Car as CarIcon, Settings, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";

const AdminWebsiteSettings = lazy(() => import("@/components/admin/AdminWebsiteSettings"));

type AdminTab = "autos" | "website";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("autos");
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
  const [formData, setFormData] = useState<CarFormState>(INITIAL_FORM_STATE);
  const [opties, setOpties] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    setLoading(true);
    const { data, error } = await carService.getCars();

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

      if (carsData.length > 0) {
        const merken = Array.from(new Set(carsData.map(car => car.merk))).sort();
        const prijzen = carsData.map(car => car.prijs);
        const bouwjaren = carsData.map(car => car.bouwjaar);
        const brandstofTypes = Array.from(new Set(carsData.map(car => car.brandstof_type).filter(Boolean))).sort() as string[];
        const transmissieTypes = Array.from(new Set(carsData.map(car => car.transmissie).filter(Boolean))).sort() as string[];

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
        kenteken: formData.kenteken?.trim() || null,
        opties: opties.length > 0 ? opties : null,
      };

      if (editingCar) {
        const { error } = await carService.updateCar(editingCar.id, carData);
        if (error) throw error;

        toast({
          title: "Bijgewerkt",
          description: "Auto succesvol bijgewerkt.",
        });
      } else {
        const { data: newCar, error } = await carService.createCar(carData);
        if (error) throw error;

        if (newCar && imageFiles && imageFiles.length > 0) {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Er is een onbekende fout opgetreden";
      logger.error("Failed to save car", { error: errorMessage });
      toast({
        title: "Fout",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async (carId: string) => {
    if (!imageFiles) return;

    const files = Array.from(imageFiles);

    const { data: uploadedImages, error: uploadError } = await imageService.uploadImages(files, carId);

    if (uploadError || !uploadedImages) {
      logger.error("Upload error", { error: uploadError?.message });
      return;
    }

    const { error: metadataError } = await imageService.saveImageMetadata(carId, uploadedImages);

    if (metadataError) {
      logger.error("Failed to save image metadata", { error: metadataError.message });
    }
  };

  const handleDelete = (car: Car) => {
    setCarToDelete(car);
    setDeleteConfirmation("");
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!carToDelete || deleteConfirmation !== carToDelete.merk) return;

    const { error } = await carService.deleteCar(carToDelete.id);

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

    const { data: fullCarData } = await carService.getCarById(car.id);

    if (fullCarData) {
      setFormData({
        kenteken: fullCarData.kenteken || "",
        merk: fullCarData.merk,
        model: fullCarData.model,
        voertuig_type: fullCarData.voertuig_type || "",
        bouwjaar: fullCarData.bouwjaar,
        transmissie: fullCarData.transmissie || "",
        kleur: fullCarData.kleur || "",
        kilometerstand: fullCarData.kilometerstand || 0,
        prijs: fullCarData.prijs,
        btw_auto: fullCarData.btw_auto || false,
        status: fullCarData.status || "aanbod",
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
    setFormData(INITIAL_FORM_STATE);
    setOpties([]);
    setImageFiles(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <SEO title="Admin Dashboard" description="" path="/admin/dashboard" noindex />
      <Navigation />
      <div style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
        <div className="container-wide flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 py-8 sm:py-16" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Admin Dashboard</h1>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              variant={activeTab === "autos" ? "secondary" : "default"}
              size="lg"
              onClick={() => setActiveTab("autos")}
              className="flex-1 sm:flex-none"
            >
              <CarIcon className="w-4 h-4 mr-2" />
              Auto's beheren
            </Button>
            <Button
              variant={activeTab === "website" ? "secondary" : "default"}
              size="lg"
              onClick={() => setActiveTab("website")}
              className="flex-1 sm:flex-none"
            >
              <Settings className="w-4 h-4 mr-2" />
              Website beheren
            </Button>
            <Button variant="default" size="lg" onClick={handleLogout} className="flex-1 sm:flex-none">
              <LogOut className="w-4 h-4 mr-2" />
              Uitloggen
            </Button>
          </div>
        </div>
      </div>

      <div className="container-wide px-4 py-8 sm:py-16" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
        {activeTab === "autos" && (
          <>
            {cars.length > 0 && (
              <CarFilters
                options={filterOptions}
                onFilterChange={handleFilterChange}
              />
            )}

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Auto's Beheer</h2>
              <AdminCarForm
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                editingCar={editingCar}
                formData={formData}
                setFormData={setFormData}
                opties={opties}
                setOpties={setOpties}
                imageFiles={imageFiles}
                setImageFiles={setImageFiles}
                loading={loading}
                onSubmit={handleSubmit}
                onResetForm={resetForm}
              />
            </div>

            <AdminCarList
              filteredCars={filteredCars}
              cars={cars}
              loading={loading}
              isPhotoDialogOpen={isPhotoDialogOpen}
              setIsPhotoDialogOpen={setIsPhotoDialogOpen}
              photoCarId={photoCarId}
              setPhotoCarId={setPhotoCarId}
              onEdit={openEditDialog}
              onDelete={handleDelete}
            />

            <AdminDeleteConfirm
              isOpen={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
              carToDelete={carToDelete}
              deleteConfirmation={deleteConfirmation}
              setDeleteConfirmation={setDeleteConfirmation}
              onConfirmDelete={confirmDelete}
              onCancel={() => {
                setIsDeleteDialogOpen(false);
                setCarToDelete(null);
                setDeleteConfirmation("");
              }}
            />
          </>
        )}

        {activeTab === "website" && (
          <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <AdminWebsiteSettings />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
