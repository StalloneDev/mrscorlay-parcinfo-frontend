import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Equipment, Employee } from "@shared/schema";
import { EQUIPMENT_TYPES, EQUIPMENT_STATUS } from "@/lib/constants";

const equipmentFormSchema = z.object({
  type: z.enum(["ordinateur", "serveur", "périphérique"]),
  model: z.string().min(1, "Le modèle est requis"),
  serialNumber: z.string().min(1, "Le numéro de série est requis"),
  purchaseDate: z.string().min(1, "La date d'achat est requise"),
  status: z.enum(["en service", "en maintenance", "hors service"]),
  assignedTo: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentFormSchema>;

interface EquipmentFormProps {
  equipment?: Equipment;
  onSuccess: () => void;
}

export default function EquipmentForm({ equipment, onSuccess }: EquipmentFormProps) {
  const { toast } = useToast();
  const isEditing = !!equipment;

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: equipment
      ? {
          type: equipment.type,
          model: equipment.model,
          serialNumber: equipment.serialNumber,
          purchaseDate: new Date(equipment.purchaseDate).toISOString().split('T')[0],
          status: equipment.status,
          assignedTo: equipment.assignedTo || undefined,
        }
      : {
          status: "en service",
          type: "ordinateur",
        },
  });

  const mutation = useMutation({
    mutationFn: async (data: EquipmentFormData) => {
      console.log('Données envoyées:', data);
      
      const payload = {
        type: data.type,
        model: data.model,
        serialNumber: data.serialNumber,
        purchaseDate: new Date(data.purchaseDate),
        status: data.status,
        assignedTo: data.assignedTo === "unassigned" ? null : data.assignedTo || null,
      };
      
      console.log('Payload final:', payload);

      if (isEditing) {
        return await apiRequest("PUT", `/api/equipment/${equipment.id}`, payload);
      } else {
        return await apiRequest("POST", "/api/equipment", payload);
      }
    },
    onError: (error: any) => {
      console.error('Erreur détaillée:', error);
      const errorMessage = error.response?.data?.errors?.[0]?.message || 
                         error.response?.data?.message || 
                         error.message || 
                         "Une erreur est survenue";
      toast({
        title: "Erreur",
        description: `Impossible de ${isEditing ? 'modifier' : 'créer'} l'équipement: ${errorMessage}`,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: isEditing
          ? "Équipement modifié avec succès"
          : "Équipement créé avec succès",
      });
      onSuccess();
    },
  });

  const onSubmit = (data: EquipmentFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type d'équipement</Label>
          <Select
            value={watch("type")}
            onValueChange={(value) => setValue("type", value as "ordinateur" | "serveur" | "périphérique")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              {EQUIPMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-destructive">{errors.type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Statut</Label>
          <Select
            value={watch("status")}
            onValueChange={(value) => setValue("status", value as "en service" | "en maintenance" | "hors service")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              {EQUIPMENT_STATUS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-destructive">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="model">Modèle</Label>
        <Input
          id="model"
          {...register("model")}
          placeholder="ex: Dell OptiPlex 7090"
        />
        {errors.model && (
          <p className="text-sm text-destructive">{errors.model.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="serialNumber">Numéro de série</Label>
        <Input
          id="serialNumber"
          {...register("serialNumber")}
          placeholder="ex: SN123456789"
        />
        {errors.serialNumber && (
          <p className="text-sm text-destructive">{errors.serialNumber.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="purchaseDate">Date d'achat</Label>
        <Input
          id="purchaseDate"
          type="date"
          {...register("purchaseDate")}
        />
        {errors.purchaseDate && (
          <p className="text-sm text-destructive">{errors.purchaseDate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignedTo">Assigné à (optionnel)</Label>
        <Select
          value={watch("assignedTo") || "unassigned"}
          onValueChange={(value) => setValue("assignedTo", value === "unassigned" ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un employé" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Non assigné</SelectItem>
            {employees?.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name} - {employee.department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
