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
import TicketForm from "@/components/forms/ticket-form";
import { Ticket, User } from "@shared/schema";
import { TICKET_STATUS, TICKET_PRIORITY } from "@/lib/constants";
import { Plus, Search, Edit, Trash2, AlertTriangle, CheckCircle, Clock, Eye } from "lucide-react";
import { useRole } from "@/hooks/useRole";

export default function TicketsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canPerformAction } = useRole();

  const { data: tickets, isLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tickets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({
        title: "Succès",
        description: "Ticket supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le ticket",
        variant: "destructive",
      });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PUT", `/api/tickets/${id}`, { status: "résolu" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({
        title: "Succès",
        description: "Ticket marqué comme résolu",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de marquer le ticket comme résolu",
        variant: "destructive",
      });
    },
  });

  const filteredTickets = tickets?.filter((ticket) => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = TICKET_STATUS.find(s => s.value === status);
    if (!statusConfig) return <Badge variant="secondary">{status}</Badge>;
    
    const variants: Record<string, any> = {
      success: "default",
      warning: "secondary", 
      error: "destructive",
      primary: "default",
      muted: "outline",
    };
    
    return (
      <Badge variant={variants[statusConfig.color] || "secondary"}>
        {statusConfig.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = TICKET_PRIORITY.find(p => p.value === priority);
    if (!priorityConfig) return <Badge variant="secondary">{priority}</Badge>;
    
    const variants: Record<string, any> = {
      success: "outline",
      warning: "secondary", 
      error: "destructive",
    };
    
    return (
      <Badge variant={variants[priorityConfig.color] || "secondary"}>
        {priorityConfig.label}
      </Badge>
    );
  };

  const getUserName = (userId: string | null) => {
    if (!userId) return "-";
    const user = users?.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Utilisateur inconnu";
  };

  const getTicketStats = () => {
    if (!tickets) return { open: 0, inProgress: 0, resolved: 0, closed: 0 };
    
    return {
      open: tickets.filter(t => t.status === "ouvert").length,
      inProgress: tickets.filter(t => t.status === "en cours").length,
      resolved: tickets.filter(t => t.status === "résolu").length,
      closed: tickets.filter(t => t.status === "clôturé").length,
    };
  };

  const stats = getTicketStats();

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
              placeholder="Rechercher des tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-background text-foreground"
          >
            <option value="all">Tous les statuts</option>
            {TICKET_STATUS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau ticket</DialogTitle>
            </DialogHeader>
            <TicketForm
              onSuccess={() => {
                setIsCreateOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
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
                <p className="text-sm font-medium text-muted-foreground">Tickets Ouverts</p>
                <p className="text-3xl font-bold text-foreground">{stats.open}</p>
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
                <p className="text-sm font-medium text-muted-foreground">En Cours</p>
                <p className="text-3xl font-bold text-foreground">{stats.inProgress}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Résolus</p>
                <p className="text-3xl font-bold text-foreground">{stats.resolved}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-3xl font-bold text-foreground">{tickets?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Créé par</TableHead>
                <TableHead>Assigné à</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {tickets?.length === 0 ? (
                      <div>
                        <p className="text-muted-foreground mb-2">Aucun ticket trouvé</p>
                        <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
                          Créer le premier ticket
                        </Button>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Aucun ticket ne correspond à vos critères
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium max-w-xs">
                      <div>
                        <p className="truncate">{ticket.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {ticket.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getUserName(ticket.createdBy)}</TableCell>
                    <TableCell>{getUserName(ticket.assignedTo)}</TableCell>
                    <TableCell>
                      {new Date(ticket.createdAt!).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingTicket(ticket)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingTicket(ticket)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {(canPerformAction("update") && ticket.status !== "résolu" && ticket.status !== "clôturé") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => resolveMutation.mutate(ticket.id)}
                            disabled={resolveMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 text-success-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(ticket.id)}
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
        open={!!editingTicket} 
        onOpenChange={(open) => !open && setEditingTicket(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le ticket</DialogTitle>
          </DialogHeader>
          {editingTicket && (
            <TicketForm
              ticket={editingTicket}
              onSuccess={() => {
                setEditingTicket(null);
                queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog 
        open={!!viewingTicket} 
        onOpenChange={(open) => !open && setViewingTicket(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du ticket</DialogTitle>
          </DialogHeader>
          {viewingTicket && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{viewingTicket.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {viewingTicket.description}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Statut</p>
                  <div className="mt-1">{getStatusBadge(viewingTicket.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Priorité</p>
                  <div className="mt-1">{getPriorityBadge(viewingTicket.priority)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Créé par</p>
                  <p className="mt-1">{getUserName(viewingTicket.createdBy)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assigné à</p>
                  <p className="mt-1">{getUserName(viewingTicket.assignedTo)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                  <p className="mt-1">
                    {new Date(viewingTicket.createdAt!).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {(canPerformAction("update") && viewingTicket.status !== "résolu" && viewingTicket.status !== "clôturé") && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      resolveMutation.mutate(viewingTicket.id);
                      setViewingTicket(null);
                    }}
                    disabled={resolveMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marquer comme résolu
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
