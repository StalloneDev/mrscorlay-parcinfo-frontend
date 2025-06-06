import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { License } from "@shared/schema";
import { LICENSE_TYPES } from "@/lib/constants";

// Type pour les données brutes du formulaire (avant transformation)
const licenseFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  vendor: z.string().min(1, "Le fournisseur est requis"),
  type: z.string().min(1, "Le type est requis"),
  licenseKey: z.string().nullable(),
  maxUsers: z.string().nullable(),
  currentUsers: z.string(),
  cost: z.string().nullable(),
});

// Type pour les données du formulaire (avant transformation)
type LicenseFormData = z.infer<typeof licenseFormSchema>;

// Type pour les données transformées (après transformation)
const transformedSchema = z.object({
  name: z.string(),
  vendor: z.string(),
  type: z.string(),
  licenseKey: z.string().nullable(),
  maxUsers: z.number().nullable(),
  currentUsers: z.number(),
  cost: z.number().nullable(),
});

type TransformedLicenseData = z.infer<typeof transformedSchema>;

// Fonction de transformation
const transformFormData = (data: LicenseFormData): TransformedLicenseData => ({
  ...data,
  maxUsers: data.maxUsers ? parseInt(data.maxUsers) : null,
  currentUsers: parseInt(data.currentUsers || "0"),
  cost: data.cost ? Math.round(parseFloat(data.cost) * 100) : null,
});

interface LicenseFormProps {
  license?: License;
  onSuccess: () => void;
}

export default function LicenseForm({ license, onSuccess }: LicenseFormProps) {
  const { toast } = useToast();
  const isEditing = !!license;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LicenseFormData>({
    resolver: zodResolver(licenseFormSchema),
    defaultValues: license
      ? {
          name: license.name,
          vendor: license.vendor,
          type: license.type,
          licenseKey: license.licenseKey || null,
          maxUsers: license.maxUsers?.toString() || null,
          currentUsers: license.currentUsers?.toString() || "0",
          cost: license.cost ? (license.cost / 100).toString() : null,
        }
      : {
          name: "",
          vendor: "",
          type: "",
          licenseKey: null,
          maxUsers: null,
          currentUsers: "0",
          cost: null,
        },
  });

  const mutation = useMutation({
    mutationFn: async (data: LicenseFormData) => {
      console.log('Données avant transformation:', data);
      
      const payload = {
        name: data.name,
        vendor: data.vendor,
        type: data.type,
        licenseKey: data.licenseKey || null,
        maxUsers: data.maxUsers ? parseInt(data.maxUsers) : null,
        currentUsers: parseInt(data.currentUsers || "0"),
        cost: data.cost ? Math.round(parseFloat(data.cost) * 100) : null,
      };

      console.log('Données envoyées au serveur:', payload);

      if (isEditing) {
        return await apiRequest("PUT", `/api/licenses/${license.id}`, payload);
      } else {
        return await apiRequest("POST", "/api/licenses", payload);
      }
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: isEditing
          ? "Licence modifiée avec succès"
          : "Licence créée avec succès",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error('Erreur détaillée:', error);
      toast({
        title: "Erreur",
        description: isEditing
          ? "Impossible de modifier la licence"
          : "Impossible de créer la licence",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LicenseFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom de la licence</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="ex: Microsoft Office 365"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendor">Fournisseur</Label>
          <Input
            id="vendor"
            {...register("vendor")}
            placeholder="ex: Microsoft, Adobe, etc."
          />
          {errors.vendor && (
            <p className="text-sm text-destructive">{errors.vendor.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type de licence</Label>
        <Select
          value={watch("type") || ""}
          onValueChange={(value) => setValue("type", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un type" />
          </SelectTrigger>
          <SelectContent>
            {LICENSE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="licenseKey">Clé de licence (optionnel)</Label>
        <Input
          id="licenseKey"
          {...register("licenseKey")}
          placeholder="ex: XXXXX-XXXXX-XXXXX-XXXXX"
          type="password"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxUsers">Utilisateurs max (optionnel)</Label>
          <Input
            id="maxUsers"
            type="number"
            min="1"
            {...register("maxUsers")}
            placeholder="ex: 50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentUsers">Utilisateurs actuels</Label>
          <Input
            id="currentUsers"
            type="number"
            min="0"
            {...register("currentUsers")}
            placeholder="ex: 25"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost">Coût (€) (optionnel)</Label>
          <Input
            id="cost"
            type="number"
            min="0"
            step="0.01"
            {...register("cost")}
            placeholder="ex: 1200.00"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? "Enregistrement..."
            : isEditing
            ? "Modifier"
            : "Créer"}
        </Button>
      </div>
    </form>
  );
}
