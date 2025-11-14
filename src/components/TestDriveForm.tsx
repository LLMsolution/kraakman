import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar } from "lucide-react";
import { logger } from "@/utils/logger";

const formSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Naam is verplicht" })
    .max(100, { message: "Naam mag maximaal 100 karakters bevatten" }),
  email: z.string()
    .trim()
    .email({ message: "Ongeldig e-mailadres" })
    .max(255, { message: "E-mail mag maximaal 255 karakters bevatten" }),
  phone: z.string()
    .trim()
    .min(1, { message: "Telefoonnummer is verplicht" })
    .max(20, { message: "Telefoonnummer mag maximaal 20 karakters bevatten" }),
});

type FormData = z.infer<typeof formSchema>;

interface TestDriveFormProps {
  carBrand: string;
  carModel: string;
  carImage?: string;
}

export default function TestDriveForm({ carBrand, carModel, carImage }: TestDriveFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      logger.userAction('submit_test_drive_request', {
        carBrand,
        carModel,
        email: data.email
      });

      const { error } = await supabase.functions.invoke("send-testdrive-request", {
        body: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          carBrand,
          carModel,
        },
      });

      if (error) throw error;

      logger.info('Test drive request submitted successfully', {
        carBrand,
        carModel,
        email: data.email
      });

      toast({
        title: "Aanvraag verstuurd!",
        description: "We nemen zo snel mogelijk contact met je op.",
      });

      reset();
      setOpen(false);
    } catch (error: any) {
      logger.error("Error sending test drive request", {
        error: error.message,
        carBrand,
        carModel,
        email: data.email
      });
      toast({
        title: "Er ging iets mis",
        description: "Probeer het later opnieuw of neem direct contact met ons op.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="w-full gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Plan een proefrit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Left side - Car Image */}
          <div className="relative aspect-[4/3] md:aspect-auto">
            {carImage ? (
              <img 
                src={carImage} 
                alt={`${carBrand} ${carModel}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                Geen afbeelding
              </div>
            )}
          </div>

          {/* Right side - Form */}
          <div className="bg-primary p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-6 w-6 text-primary-foreground" />
              <h2 className="text-xl font-semibold text-primary-foreground">Boek een proefrit</h2>
            </div>
            
            <h3 className="text-2xl font-bold text-primary-foreground mb-6">
              ERVAAR DE {carBrand.toUpperCase()} {carModel.toUpperCase()}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="name"
                  type="text"
                  placeholder="Voornaam*"
                  {...register("name")}
                  disabled={loading}
                  className="bg-primary border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                />
                {errors.name && (
                  <p className="text-sm text-primary-foreground/90">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  id="lastname"
                  type="text"
                  placeholder="Achternaam*"
                  className="bg-primary border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Telefoonnummer*"
                  {...register("phone")}
                  disabled={loading}
                  className="bg-primary border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                />
                {errors.phone && (
                  <p className="text-sm text-primary-foreground/90">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="E-mailadres*"
                  {...register("email")}
                  disabled={loading}
                  className="bg-primary border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                />
                {errors.email && (
                  <p className="text-sm text-primary-foreground/90">{errors.email.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Versturen...
                  </>
                ) : (
                  <>
                    Proefrit aanvragen
                    <span className="ml-2">→</span>
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
