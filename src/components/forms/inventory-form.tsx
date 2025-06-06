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
import { Inventory, Equipment, Employee } from "@shared/schema";
import { INVENTORY_CONDITION } from "@/lib/constants";
import { InventoryFormData } from "@/types/inventory";

const inventorySchema = z.object({
  equipmentId: z.string().uuid("L'ID de l'équipement doit être un UUID valide"),
  assignedTo: z.string().uuid("L'ID de l'employé doit être un UUID valide").nullable().optional(),
  location: z.string().min(1, "La localisation est requise"),
  condition: z.enum(["fonctionnel", "défectueux"]),
});

interface InventoryFormProps {
  inventory?: Inventory;
  onSuccess: () => void;
}

export default function InventoryForm({ inventory, onSuccess }: InventoryFormProps) {
  const { toast } = useToast();
  const isEditing = !!inventory;

  const { data: equipment } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
  });

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: inventory
      ? {
          equipmentId: inventory.equipmentId,
          assignedTo: inventory.assignedTo || null,
          location: inventory.location,
          condition: inventory.condition,
        }
      : {
          condition: "fonctionnel",
          equipmentId: "",
          location: "",
          assignedTo: null,
        },
  });

  const mutation = useMutation({
    mutationFn: async (data: InventoryFormData) => {
      const payload = {
        ...data,
        assignedTo: data.assignedTo || null,
      };

      console.log('Données envoyées au serveur:', payload);

      if (isEditing) {
        return await apiRequest("PUT", `/api/inventory/${inventory.id}`, payload);
      } else {
        return await apiRequest("POST", "/api/inventory", payload);
      }
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: isEditing
          ? "Élément d'inventaire modifié avec succès"
          : "Élément d'inventaire créé avec succès",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error('Erreur détaillée:', error);
      toast({
        title: "Erreur",
        description: isEditing
          ? "Impossible de modifier l'élément d'inventaire"
          : "Impossible de créer l'élément d'inventaire",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InventoryFormData) => {
    mutation.mutate(data);
  };

  // Filter equipment that's not already in inventory (for new items)
  const availableEquipment = equipment?.filter(eq => 
    isEditing || !inventory // Show all for editing, or filter for new items
  ) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="equipmentId">Équipement</Label>
        <Select
          value={watch("equipmentId")}
          onValueChange={(value) => setValue("equipmentId", value)}
          disabled={isEditing}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un équipement" />
          </SelectTrigger>
          <SelectContent>
            {availableEquipment.map((eq) => (
              <SelectItem key={eq.id} value={eq.id}>
                {eq.model} ({eq.serialNumber})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.equipmentId && (
          <p className="text-sm text-destructive">{errors.equipmentId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Localisation</Label>
          <Input
            id="location"
            {...register("location")}
            placeholder="ex: Bureau 201, Salle serveur, Entrepôt"
          />
          {errors.location && (
            <p className="text-sm text-destructive">{errors.location.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <Select
            value={watch("condition")}
            onValueChange={(value) => setValue("condition", value as "fonctionnel" | "défectueux")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une condition" />
            </SelectTrigger>
            <SelectContent>
              {INVENTORY_CONDITION.map((condition) => (
                <SelectItem key={condition.value} value={condition.value}>
                  {condition.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.condition && (
            <p className="text-sm text-destructive">{errors.condition.message}</p>
          )}
        </div>
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
            <SelectItem value="unassigned">Aucun</SelectItem>
            {employees?.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name}
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
