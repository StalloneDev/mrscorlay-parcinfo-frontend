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
import InventoryForm from "@/components/forms/inventory-form";
import { Inventory, Equipment, Employee } from "@shared/schema";
import { INVENTORY_CONDITION } from "@/lib/constants";
import { Plus, Search, Edit, Trash2, MapPin, CheckCircle, AlertTriangle } from "lucide-react";

export default function InventoryPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventory, isLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: equipment } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
  });

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Succès",
        description: "Élément d'inventaire supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'élément d'inventaire",
        variant: "destructive",
      });
    },
  });

  const filteredInventory = inventory?.filter((item) => {
    const equipmentItem = equipment?.find(e => e.id === item.equipmentId);
    const employee = employees?.find(e => e.id === item.assignedTo);
    
    const matchesSearch = 
      equipmentItem?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipmentItem?.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCondition = conditionFilter === "all" || item.condition === conditionFilter;
    
    return matchesSearch && matchesCondition;
  }) || [];

  const getConditionBadge = (condition: string) => {
    const conditionConfig = INVENTORY_CONDITION.find(c => c.value === condition);
    if (!conditionConfig) return <Badge variant="secondary">{condition}</Badge>;
    
    const variants: Record<string, any> = {
      success: "default",
      error: "destructive",
    };
    
    return (
      <Badge variant={variants[conditionConfig.color] || "secondary"}>
        {conditionConfig.label}
      </Badge>
    );
  };

  const getEquipmentInfo = (equipmentId: string) => {
    const equipmentItem = equipment?.find(e => e.id === equipmentId);
    return equipmentItem ? `${equipmentItem.model} (${equipmentItem.serialNumber})` : "Équipement inconnu";
  };

  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return "-";
    const employee = employees?.find(e => e.id === employeeId);
    return employee?.name || "Employé inconnu";
  };

  const getInventoryStats = () => {
    if (!inventory) return { functional: 0, defective: 0, assigned: 0, total: 0 };
    
    return {
      functional: inventory.filter(i => i.condition === "fonctionnel").length,
      defective: inventory.filter(i => i.condition === "défectueux").length,
      assigned: inventory.filter(i => i.assignedTo).length,
      total: inventory.length,
    };
  };

  const stats = getInventoryStats();

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
              placeholder="Rechercher dans l'inventaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-background text-foreground"
          >
            <option value="all">Toutes les conditions</option>
            {INVENTORY_CONDITION.map((condition) => (
              <option key={condition.value} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </select>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter à l'Inventaire
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un élément à l'inventaire</DialogTitle>
            </DialogHeader>
            <InventoryForm
              onSuccess={() => {
                setIsCreateOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Inventaire</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fonctionnels</p>
                <p className="text-3xl font-bold text-foreground">{stats.functional}</p>
              </div>
              <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success-600 dark:text-success-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Défectueux</p>
                <p className="text-3xl font-bold text-foreground">{stats.defective}</p>
              </div>
              <div className="w-12 h-12 bg-error-100 dark:bg-error-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-error-600 dark:text-error-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assignés</p>
                <p className="text-3xl font-bold text-foreground">{stats.assigned}</p>
              </div>
              <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventaire des Équipements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Équipement</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Assigné à</TableHead>
                <TableHead>Dernière vérification</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {inventory?.length === 0 ? (
                      <div>
                        <p className="text-muted-foreground mb-2">Aucun élément d'inventaire trouvé</p>
                        <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
                          Ajouter le premier élément
                        </Button>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Aucun élément ne correspond à vos critères
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {getEquipmentInfo(item.equipmentId)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        {item.location}
                      </div>
                    </TableCell>
                    <TableCell>{getConditionBadge(item.condition)}</TableCell>
                    <TableCell>{getEmployeeName(item.assignedTo)}</TableCell>
                    <TableCell>
                      {new Date(item.lastChecked!).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingInventory(item)}
                        >
                          <Edit className="h-4 w-4" />
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
        open={!!editingInventory} 
        onOpenChange={(open) => !open && setEditingInventory(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l'élément d'inventaire</DialogTitle>
          </DialogHeader>
          {editingInventory && (
            <InventoryForm
              inventory={editingInventory}
              onSuccess={() => {
                setEditingInventory(null);
                queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
