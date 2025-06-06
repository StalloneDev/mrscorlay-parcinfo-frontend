import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus } from "lucide-react";
import type { MaintenanceSchedule } from "@shared/schema";

// Fonction pour récupérer les maintenances
async function fetchMaintenances(): Promise<MaintenanceSchedule[]> {
  const response = await fetch("/api/maintenance", {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Non authentifié");
    }
    throw new Error("Erreur lors de la récupération des maintenances");
  }
  return response.json();
}

// Fonction pour créer une nouvelle maintenance
async function createMaintenance(data: any): Promise<MaintenanceSchedule> {
  console.log("Données envoyées au serveur:", data);
  const response = await fetch("/api/maintenance", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  const responseData = await response.json();
  
  if (!response.ok) {
    console.error("Erreur serveur:", responseData);
    if (responseData.errors && Array.isArray(responseData.errors)) {
      const errorMessages = responseData.errors
        .map((err: any) => err.message)
        .filter(Boolean)
        .join("\n");
      throw new Error(errorMessages || "Erreur lors de la création de la maintenance");
    }
    throw new Error(responseData.error || "Erreur lors de la création de la maintenance");
  }
  
  return responseData;
}

export default function Planning() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les maintenances
  const { data: maintenances = [], isLoading } = useQuery<MaintenanceSchedule[]>({
    queryKey: ["maintenances"],
    queryFn: fetchMaintenances,
  });

  // Mutation pour créer une nouvelle maintenance
  const createMaintenanceMutation = useMutation({
    mutationFn: createMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
      setIsNewEventDialogOpen(false);
      toast({
        title: "Maintenance planifiée",
        description: "La maintenance a été ajoutée au planning avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la maintenance.",
        variant: "destructive",
      });
    },
  });

  const handleNewEvent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      // Récupérer et valider les dates
      const startDateStr = formData.get("startDate") as string;
      const endDateStr = formData.get("endDate") as string;
      
      if (!startDateStr || !endDateStr) {
        toast({
          title: "Erreur de validation",
          description: "Les dates de début et de fin sont requises",
          variant: "destructive",
        });
        return;
      }

      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      // Validation des dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        toast({
          title: "Erreur de validation",
          description: "Les dates saisies ne sont pas valides",
          variant: "destructive",
        });
        return;
      }

      if (endDate <= startDate) {
        toast({
          title: "Erreur de validation",
          description: "La date de fin doit être postérieure à la date de début",
          variant: "destructive",
        });
        return;
      }

      const maintenanceData = {
        type: formData.get("type") as "preventive" | "corrective" | "mise_a_jour",
        title: (formData.get("title") as string)?.trim(),
        description: (formData.get("description") as string)?.trim(),
        startDate: formData.get("startDate") as string,
        endDate: formData.get("endDate") as string,
        notes: (formData.get("notes") as string)?.trim() || null,
      };

      // Validation des champs requis
      if (!maintenanceData.type || !maintenanceData.title || !maintenanceData.description) {
        toast({
          title: "Erreur de validation",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive",
        });
        return;
      }

      console.log("Données du formulaire:", maintenanceData);
      await createMaintenanceMutation.mutateAsync(maintenanceData);
      
      setIsNewEventDialogOpen(false);
      toast({
        title: "Succès",
        description: "La maintenance a été créée avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer la maintenance",
        variant: "destructive",
      });
    }
  };

  // Fonction pour obtenir les événements d'une date donnée
  const getEventsForDate = (date: Date) => {
    return maintenances.filter(maintenance => {
      const maintenanceDate = new Date(maintenance.startDate);
      return (
        maintenanceDate.getDate() === date.getDate() &&
        maintenanceDate.getMonth() === date.getMonth() &&
        maintenanceDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion du Planning</h1>
        <Dialog open={isNewEventDialogOpen} onOpenChange={setIsNewEventDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Maintenance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleNewEvent}>
              <DialogHeader>
                <DialogTitle>Planifier une maintenance</DialogTitle>
                <DialogDescription>
                  Remplissez les détails de la maintenance à planifier.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type de maintenance</Label>
                  <Select name="type" defaultValue="preventive">
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventive">Préventive</SelectItem>
                      <SelectItem value="corrective">Corrective</SelectItem>
                      <SelectItem value="mise_a_jour">Mise à jour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Titre de la maintenance"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Description détaillée"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Date de début</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">Date de fin</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Notes supplémentaires"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMaintenanceMutation.isPending}>
                  {createMaintenanceMutation.isPending ? "Création..." : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendrier</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={fr}
              modifiers={{
                hasEvents: (date) => getEventsForDate(date).length > 0,
              }}
              modifiersStyles={{
                hasEvents: { backgroundColor: "var(--primary-100)", color: "var(--primary-900)" },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Maintenances du {selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: fr }) : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Chargement...</div>
            ) : selectedDate ? (
              <div className="space-y-4">
                {getEventsForDate(selectedDate).map((maintenance) => (
                  <div
                    key={maintenance.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{maintenance.title}</h3>
                        <p className="text-sm text-gray-500">{maintenance.description}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(maintenance.startDate), "HH:mm")} -{" "}
                          {format(new Date(maintenance.endDate), "HH:mm")}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          maintenance.status === "planifie"
                            ? "bg-blue-100 text-blue-800"
                            : maintenance.status === "en_cours"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {maintenance.status}
                      </span>
                    </div>
                  </div>
                ))}
                {getEventsForDate(selectedDate).length === 0 && (
                  <p className="text-center text-gray-500">
                    Aucune maintenance planifiée pour cette date
                  </p>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                Sélectionnez une date pour voir les maintenances
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 