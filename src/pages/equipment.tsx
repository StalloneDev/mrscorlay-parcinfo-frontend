import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import EquipmentForm from "@/components/forms/equipment-form";
import { Equipment, Employee, EquipmentHistory } from "@shared/schema";
import { EQUIPMENT_STATUS } from "@/lib/constants";
import { Plus, Search, Edit, Trash2, History } from "lucide-react";

export default function EquipmentPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [viewingHistory, setViewingHistory] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: equipment, isLoading } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
  });

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: history } = useQuery<EquipmentHistory[]>({
    queryKey: [`/api/equipment/${viewingHistory?.id}/history`],
    enabled: !!viewingHistory,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/equipment/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      toast({
        title: "Succès",
        description: "Équipement supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'équipement",
        variant: "destructive",
      });
    },
  });

  const filteredEquipment = equipment?.filter((item) =>
    item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = EQUIPMENT_STATUS.find(s => s.value === status);
    if (!statusConfig) return <Badge variant="secondary">{status}</Badge>;
    
    const variants: Record<string, any> = {
      success: "default",
      warning: "secondary", 
      error: "destructive",
    };
    
    return (
      <Badge variant={variants[statusConfig.color] || "secondary"}>
        {statusConfig.label}
      </Badge>
    );
  };

  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return "-";
    const employee = employees?.find(e => e.id === employeeId);
    return employee ? `${employee.name} ` : "-";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des équipements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter Équipement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel équipement</DialogTitle>
            </DialogHeader>
            <EquipmentForm
              onSuccess={() => {
                setIsCreateOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Equipment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Équipements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Modèle</TableHead>
                <TableHead>Numéro de série</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d'achat</TableHead>
                <TableHead>Assigné à</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipment.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {equipment?.length === 0 ? (
                      <div>
                        <p className="text-muted-foreground mb-2">Aucun équipement trouvé</p>
                        <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
                          Ajouter le premier équipement
                        </Button>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Aucun équipement ne correspond à votre recherche
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEquipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium capitalize">{item.type}</TableCell>
                    <TableCell>{item.model}</TableCell>
                    <TableCell className="font-mono text-sm">{item.serialNumber}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      {new Date(item.purchaseDate).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>{getEmployeeName(item.assignedTo)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingEquipment(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setViewingHistory(item)}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(item.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog 
        open={!!editingEquipment} 
        onOpenChange={(open) => !open && setEditingEquipment(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l'équipement</DialogTitle>
          </DialogHeader>
          {editingEquipment && (
            <EquipmentForm
              equipment={editingEquipment}
              onSuccess={() => {
                setEditingEquipment(null);
                queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog 
        open={!!viewingHistory} 
        onOpenChange={(open) => !open && setViewingHistory(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Historique des modifications - {viewingHistory?.model}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {history?.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Aucun historique disponible pour cet équipement
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Modifié par</TableHead>
                    <TableHead>Modifications</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history?.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {new Date(entry.createdAt!).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>{entry.updatedBy}</TableCell>
                      <TableCell>{entry.changes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
