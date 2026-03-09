import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { Car } from "@/types";

interface AdminDeleteConfirmProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  carToDelete: Car | null;
  deleteConfirmation: string;
  setDeleteConfirmation: React.Dispatch<React.SetStateAction<string>>;
  onConfirmDelete: () => void;
  onCancel: () => void;
}

const AdminDeleteConfirm = ({
  isOpen,
  onOpenChange,
  carToDelete,
  deleteConfirmation,
  setDeleteConfirmation,
  onConfirmDelete,
  onCancel,
}: AdminDeleteConfirmProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              <p className="text-sm font-medium text-red-800 mb-2">&#9888;&#65039; WAARSCHUWING</p>
              <p className="text-xs text-red-700 mb-3">
                Deze actie is permanent en kan niet ongedaan worden gemaakt.
                De auto en alle gerelateerde data worden permanent uit de database verwijderd.
              </p>
              <div className="text-sm text-gray-700">
                <p><strong>Auto:</strong> {carToDelete.merk} {carToDelete.model}</p>
                <p><strong>Bouwjaar:</strong> {carToDelete.bouwjaar}</p>
                <p><strong>Prijs:</strong> &#8364;{carToDelete.prijs.toLocaleString()}</p>
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
                    onConfirmDelete();
                  }
                }}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="default"
                size="default"
                onClick={onConfirmDelete}
                disabled={deleteConfirmation !== carToDelete.merk}
                className="flex-1 bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Permanent Verwijderen
              </Button>
              <Button
                variant="secondary"
                size="default"
                onClick={onCancel}
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
  );
};

export default AdminDeleteConfirm;
