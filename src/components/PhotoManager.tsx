import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2, GripVertical, ChevronUp, ChevronDown, Plus } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  display_order: number;
}

interface PhotoManagerProps {
  carId: string;
}

const PhotoManager = ({ carId }: PhotoManagerProps) => {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, [carId]);

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("car_images")
        .select("*")
        .eq("car_id", carId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error: any) {
      console.error("Error loading photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${carId}/${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("car-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("car-images").getPublicUrl(fileName);

        const maxOrder = photos.length > 0 ? Math.max(...photos.map((p) => p.display_order)) : -1;

        const { error: insertError } = await supabase.from("car_images").insert({
          car_id: carId,
          url: publicUrl,
          display_order: maxOrder + 1 + i,
        });

        if (insertError) throw insertError;
      }

      toast({
        title: "Geüpload",
        description: `${files.length} foto${files.length > 1 ? "'s" : ""} succesvol geüpload.`,
      });

      loadPhotos();
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (photoId: string, url: string) => {
    if (!confirm("Weet je zeker dat je deze foto wilt verwijderen?")) return;

    try {
      // Extract file path from URL
      const urlParts = url.split("/");
      const fileName = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("car-images")
        .remove([fileName]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("car_images")
        .delete()
        .eq("id", photoId);

      if (dbError) throw dbError;

      toast({
        title: "Verwijderd",
        description: "Foto succesvol verwijderd.",
      });

      loadPhotos();
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const movePhoto = async (photoId: string, direction: "up" | "down") => {
    const currentIndex = photos.findIndex((p) => p.id === photoId);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === photos.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const newPhotos = [...photos];
    [newPhotos[currentIndex], newPhotos[newIndex]] = [
      newPhotos[newIndex],
      newPhotos[currentIndex],
    ];

    // Update display orders
    try {
      for (let i = 0; i < newPhotos.length; i++) {
        await supabase
          .from("car_images")
          .update({ display_order: i })
          .eq("id", newPhotos[i].id);
      }

      setPhotos(newPhotos);
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => document.getElementById('photo-upload')?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploaden...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Foto's toevoegen
            </>
          )}
        </Button>
        <Input
          id="photo-upload"
          type="file"
          multiple
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative group border border-border overflow-hidden"
            >
              <img
                src={photo.url}
                alt={`Foto ${index + 1}`}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => movePhoto(photo.id, "up")}
                  disabled={index === 0}
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    cursor: index === 0 ? 'not-allowed' : 'pointer',
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-secondary)',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    padding: '6px',
                    margin: '4px',
                    outline: 'none',
                    boxShadow: 'none',
                    opacity: index === 0 ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (index !== 0) {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                      e.currentTarget.style.border = '1px solid var(--color-primary)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.querySelector('svg').style.color = 'var(--color-text-inverse)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== 0) {
                      e.currentTarget.style.backgroundColor = 'var(--color-background)';
                      e.currentTarget.style.border = '1px solid var(--color-secondary)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.querySelector('svg').style.color = 'var(--color-text-primary)';
                    }
                  }}
                >
                  <ChevronUp className="h-4 w-4" style={{ color: 'var(--color-text-primary)', transition: 'color 0.2s ease' }} />
                </button>
                <button
                  onClick={() => movePhoto(photo.id, "down")}
                  disabled={index === photos.length - 1}
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    cursor: index === photos.length - 1 ? 'not-allowed' : 'pointer',
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-secondary)',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    padding: '6px',
                    margin: '4px',
                    outline: 'none',
                    boxShadow: 'none',
                    opacity: index === photos.length - 1 ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (index !== photos.length - 1) {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                      e.currentTarget.style.border = '1px solid var(--color-primary)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.querySelector('svg').style.color = 'var(--color-text-inverse)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== photos.length - 1) {
                      e.currentTarget.style.backgroundColor = 'var(--color-background)';
                      e.currentTarget.style.border = '1px solid var(--color-secondary)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.querySelector('svg').style.color = 'var(--color-text-primary)';
                    }
                  }}
                >
                  <ChevronDown className="h-4 w-4" style={{ color: 'var(--color-text-primary)', transition: 'color 0.2s ease' }} />
                </button>
                <button
                  onClick={() => handleDelete(photo.id, photo.url)}
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-secondary)',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    padding: '6px',
                    margin: '4px',
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
                    e.currentTarget.style.backgroundColor = 'var(--color-background)';
                    e.currentTarget.style.border = '1px solid var(--color-secondary)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.querySelector('svg').style.color = 'var(--color-text-primary)';
                  }}
                >
                  <X className="h-4 w-4" style={{ color: 'var(--color-text-primary)', transition: 'color 0.2s ease' }} />
                </button>
              </div>
              <div className="absolute top-2 left-2 bg-background/90 px-2 py-1 text-xs">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoManager;
