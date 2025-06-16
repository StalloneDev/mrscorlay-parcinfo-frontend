import { useState, useEffect } from "react";
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
import { Plus, Edit, Trash, Eye } from "lucide-react";
import type { MaintenanceSchedule } from '@shared/schema';
import { getApiUrl } from "@/lib/config";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";

// Fonction pour récupérer les maintenances
async function fetchMaintenances(): Promise<MaintenanceSchedule[]> {
  const response = await fetch(getApiUrl("/api/maintenance"), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
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
  const response = await fetch(getApiUrl("/api/maintenance"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const responseData = await response.json();
    console.error("Erreur serveur:", responseData);
    if (responseData.errors && Array.isArray(responseData.errors)) {
      const errorMessages = responseData.errors
        .map((err: any) => err.message)
        .filter(Boolean)
        .join("\n");
      throw new Error(errorMessages || "Erreur lors de la création de la maintenance");
    }
    throw new Error(responseData.message || "Erreur lors de la création de la maintenance");
  }
  
  return response.json();
}

const PAGE_SIZE = 10;

export default function Planning() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [plannings, setPlannings] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlanning, setSelectedPlanning] = useState<any | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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

  useEffect(() => {
    // Charger tous les plannings au montage
    fetch(getApiUrl("/api/maintenance"), {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setPlannings(data))
      .catch((err) => console.error(err));
  }, []);

  // Pagination
  const paginatedPlannings = plannings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.ceil(plannings.length / PAGE_SIZE);

  // Actions
  const handleView = (planning: any) => {
    setSelectedPlanning(planning);
    setViewModalOpen(true);
  };
  const handleEdit = (planning: any) => {
    setSelectedPlanning(planning);
    setEditModalOpen(true);
  };
  const handleDelete = (planning: any) => {
    setSelectedPlanning(planning);
    setDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!selectedPlanning) return;
    await fetch(getApiUrl(`/api/maintenance/${selectedPlanning.id}`), {
      method: "DELETE",
      credentials: "include",
    });
    setPlannings(plannings => plannings.filter(p => p.id !== selectedPlanning.id));
    setDeleteModalOpen(false);
  };

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
                          maintenance.status === "planifié"
                            ? "bg-blue-100 text-blue-800"
                            : maintenance.status === "en cours"
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

      {/* Tableau des plannings */}
      <div className="mt-12">
        <h2 className="text-lg font-bold mb-4">Liste des plannings</h2>
        <Table className="border rounded shadow bg-background">
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date début</TableHead>
              <TableHead>Date fin</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPlannings.map((planning) => (
              <TableRow key={planning.id}>
                <TableCell>{planning.title}</TableCell>
                <TableCell>{planning.type}</TableCell>
                <TableCell>{planning.startDate ? format(new Date(planning.startDate), "dd/MM/yyyy") : ""}</TableCell>
                <TableCell>{planning.endDate ? format(new Date(planning.endDate), "dd/MM/yyyy") : ""}</TableCell>
                <TableCell>
                    <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          planning.status === "planifie"
                            ? "bg-blue-100 text-blue-800"
                            : planning.status === "en_cours"
                            ? "bg-yellow-100 text-yellow-800"
                            : planning.status === "termine"
                            ? "bg-green-100 text-green-800"
                            : planning.status === "annule"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {planning.status}
                    </span>
                </TableCell>
                <TableCell>{planning.notes ? planning.notes : ""}</TableCell>
                <TableCell>{planning.description ? planning.description : ""}</TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" onClick={() => handleView(planning)} title="Voir"><Eye className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(planning)} title="Éditer"><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(planning)} title="Supprimer"><Trash className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Pagination simple */}
        {totalPages > 1 && (
          <div className="flex justify-end mt-4 gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Précédent
            </Button>
            <span className="px-2 py-1 rounded bg-muted">{currentPage} / {totalPages}</span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>

      {/* Modal Voir Détails */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails du planning</DialogTitle>
            <DialogDescription>
              {selectedPlanning && (
                <div className="space-y-2">
                  <div><b>Titre :</b> {selectedPlanning.title}</div>
                  <div><b>Type :</b> {selectedPlanning.type}</div>
                  <div><b>Date début :</b> {selectedPlanning.startDate ? format(new Date(selectedPlanning.startDate), "dd/MM/yyyy") : ""}</div>
                  <div><b>Date fin :</b> {selectedPlanning.endDate ? format(new Date(selectedPlanning.endDate), "dd/MM/yyyy") : ""}</div>
                  <div><b>Statut :</b> {selectedPlanning.status}</div>
                  <div><b>Notes :</b> {selectedPlanning.notes}</div>
                  <div><b>Description :</b> {selectedPlanning.description}</div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Modal Éditer */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Éditer le planning</DialogTitle>
            <DialogDescription>
              {selectedPlanning && (
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    console.log(selectedPlanning);
                    const data = {
                      title: selectedPlanning.title,
                      type: selectedPlanning.type,
                      startDate: selectedPlanning.startDate,
                      endDate: selectedPlanning.endDate,
                      status: selectedPlanning.status,
                      notes: selectedPlanning.notes,
                      description: selectedPlanning.description,
                    }
                    const res = await fetch(getApiUrl(`/api/maintenance/${selectedPlanning.id}`), {
                      method: "PUT",
                      credentials: "include",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(data),
                    });
                    if (res.ok) {
                      fetch(getApiUrl("/api/maintenance"), { credentials: "include" })
                        .then((res) => res.json())
                        .then((data) => setPlannings(data));
                      setEditModalOpen(false);
                      toast({
                        title: "Succès",
                        description: "Modification effectuée avec succès",
                      });
                    } else {
                      toast({
                        title: "Erreur",
                        description: "Erreur lors de la modification",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="space-y-2"
                >
                  <div>
                    <label className="block font-medium w-full">Titre</label>
                    <input
                      className="input input-bordered w-full"
                      value={selectedPlanning.title}
                      onChange={e => setSelectedPlanning({ ...selectedPlanning, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-medium w-full">Type</label>
                    <Select
                      value={selectedPlanning.type}
                      onValueChange={value => setSelectedPlanning({ ...selectedPlanning, type: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preventive">Préventive</SelectItem>
                        <SelectItem value="corrective">Corrective</SelectItem>
                        <SelectItem value="mise_a_jour">Mise à jour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block font-medium w-full">Date début</label>
                    <Input
                      type="date"
                      className="input input-bordered w-full"
                      value={selectedPlanning.startDate ? format(new Date(selectedPlanning.startDate), "yyyy-MM-dd") : ""}
                      onChange={e => setSelectedPlanning({ ...selectedPlanning, startDate: new Date(e.target.value).toISOString() })}
                    />
                  </div>
                  <div>
                    <label className="block font-medium w-full">Date fin</label>   
                    <Input
                      type="date"
                      className="input input-bordered w-full"
                      value={selectedPlanning.endDate ? format(new Date(selectedPlanning.endDate), "yyyy-MM-dd") : ""}
                      onChange={e => setSelectedPlanning({ ...selectedPlanning, endDate: new Date(e.target.value).toISOString() })}
                    />
                  </div>
                  <div>
                    <label className="block font-medium">Statut</label>
                    <Select
                      value={selectedPlanning.status}
                      onValueChange={value => setSelectedPlanning({ ...selectedPlanning, status: value })}
                    >
                      <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionnez un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planifie">Planifié</SelectItem>
                        <SelectItem value="en_cours">En cours</SelectItem>
                        <SelectItem value="termine">Terminé</SelectItem>
                        <SelectItem value="annule">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block font-medium w-full">Notes</label>
                    <Textarea
                      className="input input-bordered w-full" 
                      value={selectedPlanning.notes}
                      onChange={e => setSelectedPlanning({ ...selectedPlanning, notes: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-medium w-full">Description</label>  
                    <Textarea
                      className="input input-bordered w-full" 
                      value={selectedPlanning.description}
                      onChange={e => setSelectedPlanning({ ...selectedPlanning, description: e.target.value })}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90">
                    Enregistrer
                  </Button>  
                </form>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Modal Supprimer */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le planning</DialogTitle>
            <DialogDescription>
              Es-tu sûr de vouloir supprimer ce planning ?
              <div className="flex gap-2 mt-4">
                <Button variant="destructive" onClick={confirmDelete}>Oui, supprimer</Button>
                <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Annuler</Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
} 