import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PhotoManager from "@/components/PhotoManager";
import { Image, Trash2, Pencil, X } from "lucide-react";
import { Car } from "@/types";

interface AdminCarListProps {
  filteredCars: Car[];
  cars: Car[];
  loading: boolean;
  isPhotoDialogOpen: boolean;
  setIsPhotoDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  photoCarId: string | null;
  setPhotoCarId: React.Dispatch<React.SetStateAction<string | null>>;
  onEdit: (car: Car) => void;
  onDelete: (car: Car) => void;
}

const AdminCarList = ({
  filteredCars,
  cars,
  loading,
  isPhotoDialogOpen,
  setIsPhotoDialogOpen,
  photoCarId,
  setPhotoCarId,
  onEdit,
  onDelete,
}: AdminCarListProps) => {
  if (loading) {
    return <p>Laden...</p>;
  }

  if (filteredCars.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground">
          {cars.length === 0
            ? "Nog geen auto's toegevoegd."
            : "Geen auto's gevonden met de geselecteerde filters."}
        </p>
      </div>
    );
  }

  return (
    <>
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
                    <td className="p-4" style={{ color: 'var(--color-text-primary)' }}>&#8364; {car.prijs.toLocaleString()}</td>
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
                          onClick={() => onEdit(car)}
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Bewerken
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onDelete(car)}
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
                    <td className="p-3" style={{ color: 'var(--color-text-primary)' }}>&#8364; {car.prijs.toLocaleString()}</td>
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
                          onClick={() => onEdit(car)}
                          title="Bewerken"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onDelete(car)}
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

        {/* Mobile View - Compact Card Layout */}
        <div className="md:hidden space-y-2">
          {filteredCars.map((car) => (
            <div
              key={car.id}
              className="border rounded-lg p-3"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border-primary)'
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {car.merk} {car.model}
                    </h3>
                    <span
                      className="px-1.5 py-0.5 text-[10px] rounded shrink-0"
                      style={{
                        backgroundColor: car.status === "aanbod" ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                        color: car.status === "aanbod" ? 'var(--color-background)' : 'var(--color-text-primary)'
                      }}
                    >
                      {car.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    <span>{car.bouwjaar}</span>
                    <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>&#8364; {car.prijs.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setPhotoCarId(car.id);
                    setIsPhotoDialogOpen(true);
                  }}
                  className="flex-1 !h-8 !text-xs"
                >
                  <Image className="w-3.5 h-3.5 mr-1" />
                  Foto's
                </Button>
                <Button
                  size="sm"
                  onClick={() => onEdit(car)}
                  className="flex-1 !h-8 !text-xs"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" />
                  Bewerken
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onDelete(car)}
                  className="hover:bg-red-600 hover:text-white hover:border-red-600 !h-8"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Manager Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" style={{ width: '95vw', maxWidth: '1800px' }} hideCloseButton={true}>
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
            <DialogTitle>Foto's Beheren</DialogTitle>
          </DialogHeader>
          {photoCarId && <PhotoManager carId={photoCarId} />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminCarList;
