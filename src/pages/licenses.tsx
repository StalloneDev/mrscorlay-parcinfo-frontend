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
import LicenseForm from "@/components/forms/license-form";
import { License } from "@shared/schema";
import { Plus, Search, Edit, Trash2, Key, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function LicensesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: licenses, isLoading } = useQuery<License[]>({
    queryKey: ["/api/licenses"],
  });

  const { data: expiringLicenses } = useQuery<License[]>({
    queryKey: ["/api/licenses/expiring/30"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/licenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      toast({
        title: "Succès",
        description: "Licence supprimée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la licence",
        variant: "destructive",
      });
    },
  });

  const filteredLicenses = licenses?.filter((license) =>
    license.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return { status: "no-expiry", label: "Aucune", color: "secondary" };
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: "expired", label: "Expirée", color: "destructive" };
    } else if (daysUntilExpiry <= 30) {
      return { status: "expiring", label: `${daysUntilExpiry} jours`, color: "secondary" };
    } else {
      return { status: "valid", label: `${daysUntilExpiry} jours`, color: "default" };
    }
  };

  const getUsageStatus = (current: number, max: number | null) => {
    if (!max) return { percentage: 0, color: "secondary", label: "Illimité" };
    
    const percentage = (current / max) * 100;
    
    if (percentage >= 90) {
      return { percentage, color: "destructive", label: `${current}/${max}` };
    } else if (percentage >= 70) {
      return { percentage, color: "secondary", label: `${current}/${max}` };
    } else {
      return { percentage, color: "default", label: `${current}/${max}` };
    }
  };

  const getLicenseStats = () => {
    if (!licenses) return { total: 0, expiring: 0, expired: 0, active: 0, totalCost: 0 };
    
    const now = new Date();
    let expired = 0;
    let active = 0;
    let totalCost = 0;
    
    licenses.forEach(license => {
      if (license.expiryDate) {
        const expiry = new Date(license.expiryDate);
        if (expiry < now) {
          expired++;
        } else {
          active++;
        }
      } else {
        active++;
      }
      
      if (license.cost) {
        totalCost += license.cost;
      }
    });
    
    return {
      total: licenses.length,
      expiring: expiringLicenses?.length || 0,
      expired,
      active,
      totalCost: totalCost / 100, // Convert from cents to euros
    };
  };

  const stats = getLicenseStats();

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
              placeholder="Rechercher des licences..."
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
              Ajouter Licence
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle licence</DialogTitle>
            </DialogHeader>
            <LicenseForm
              onSuccess={() => {
                setIsCreateOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
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
                <p className="text-sm font-medium text-muted-foreground">Total Licences</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <Key className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Actives</p>
                <p className="text-3xl font-bold text-foreground">{stats.active}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Expirant (30j)</p>
                <p className="text-3xl font-bold text-foreground">{stats.expiring}</p>
              </div>
              <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Coût Total</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalCost.toFixed(0)}€</p>
              </div>
              <div className="w-12 h-12 bg-error-100 dark:bg-error-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-error-600 dark:text-error-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Licenses Alert */}
      {stats.expiring > 0 && (
        <Card className="border-warning-200 bg-warning-50 dark:bg-warning-900/50 dark:border-warning-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-warning-600 mr-3" />
              <div>
                <p className="font-medium text-warning-900 dark:text-warning-100">
                  {stats.expiring} licence(s) expir(ent) dans les 30 prochains jours
                </p>
                <p className="text-sm text-warning-700 dark:text-warning-300">
                  Vérifiez les licences expirantes pour éviter les interruptions de service
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Licenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Licences</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Utilisateurs</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Coût</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLicenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {licenses?.length === 0 ? (
                      <div>
                        <p className="text-muted-foreground mb-2">Aucune licence trouvée</p>
                        <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
                          Ajouter la première licence
                        </Button>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Aucune licence ne correspond à votre recherche
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLicenses.map((license) => {
                  const expiryStatus = getExpiryStatus(license.expiryDate);
                  const usageStatus = getUsageStatus(license.currentUsers || 0, license.maxUsers);
                  
                  return (
                    <TableRow key={license.id}>
                      <TableCell className="font-medium">{license.name}</TableCell>
                      <TableCell>{license.vendor}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{license.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={usageStatus.color as any}>
                          {usageStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={expiryStatus.color as any}>
                          {expiryStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {license.cost ? `${(license.cost / 100).toFixed(2)}€` : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingLicense(license)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(license.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog 
        open={!!editingLicense} 
        onOpenChange={(open) => !open && setEditingLicense(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier la licence</DialogTitle>
          </DialogHeader>
          {editingLicense && (
            <LicenseForm
              license={editingLicense}
              onSuccess={() => {
                setEditingLicense(null);
                queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
