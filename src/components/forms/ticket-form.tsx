import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Ticket, User } from "@shared/schema";
import { TICKET_STATUS, TICKET_PRIORITY } from "@/lib/constants";

const ticketSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  createdBy: z.string().min(1, "Le créateur est requis"),
  assignedTo: z.string().optional(),
  status: z.enum(["ouvert", "assigné", "en cours", "résolu", "clôturé"]),
  priority: z.enum(["basse", "moyenne", "haute"]),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketFormProps {
  ticket?: Ticket;
  onSuccess: () => void;
}

export default function TicketForm({ ticket, onSuccess }: TicketFormProps) {
  const { toast } = useToast();
  const isEditing = !!ticket;

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Filter users for different roles
  const technicians = users?.filter(user => user.role === "technicien" || user.role === "admin") || [];
  const allUsers = users || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: ticket
      ? {
          title: ticket.title,
          description: ticket.description,
          createdBy: ticket.createdBy,
          assignedTo: ticket.assignedTo || undefined,
          status: ticket.status,
          priority: ticket.priority,
        }
      : {
          status: "ouvert",
          priority: "moyenne",
        },
  });

  const mutation = useMutation({
    mutationFn: async (data: TicketFormData) => {
      const payload = {
        ...data,
        assignedTo: data.assignedTo || null,
      };

      if (isEditing) {
        return await apiRequest("PUT", `/api/tickets/${ticket.id}`, payload);
      } else {
        return await apiRequest("POST", "/api/tickets", payload);
      }
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: isEditing
          ? "Ticket modifié avec succès"
          : "Ticket créé avec succès",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: isEditing
          ? "Impossible de modifier le ticket"
          : "Impossible de créer le ticket",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TicketFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Titre du ticket</Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="ex: Problème de connexion réseau"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Décrivez le problème en détail..."
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priorité</Label>
          <Select
            value={watch("priority") || ""}
            onValueChange={(value) => setValue("priority", value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une priorité" />
            </SelectTrigger>
            <SelectContent>
              {TICKET_PRIORITY.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.priority && (
            <p className="text-sm text-destructive">{errors.priority.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Statut</Label>
          <Select
            value={watch("status") || ""}
            onValueChange={(value) => setValue("status", value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              {TICKET_STATUS.map((status) => (
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="createdBy">Créé par</Label>
          <Select
            value={watch("createdBy") || ""}
            onValueChange={(value) => setValue("createdBy", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un utilisateur" />
            </SelectTrigger>
            <SelectContent>
              {allUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} - {user.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.createdBy && (
            <p className="text-sm text-destructive">{errors.createdBy.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignedTo">Assigné à (optionnel)</Label>
          <Select
            value={watch("assignedTo") || "unassigned"}
            onValueChange={(value) => setValue("assignedTo", value === "unassigned" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un technicien" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Non assigné</SelectItem>
              {technicians.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} - {user.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
