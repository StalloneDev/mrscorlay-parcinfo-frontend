import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { Skeleton } from "@/components/ui/skeleton";
import EquipmentChart from "@/components/charts/equipment-chart";
import TicketsChart from "@/components/charts/tickets-chart";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Laptop, 
  AlertTriangle, 
  Users, 
  Key,
  Info,
  Shield,
  RefreshCw,
  Calendar
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardData();
  const [, navigate] = useLocation();
  const [selectedMaintenance, setSelectedMaintenance] = useState<string | null>(null);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Impossible de charger les statistiques du tableau de bord
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Équipements"
          value={stats.totalEquipment.toString()}
          change="+8.2%"
          changeLabel="ce mois"
          icon={<Laptop className="h-6 w-6" />}
          iconBg="bg-primary-100 dark:bg-primary-900"
          iconColor="text-primary-600 dark:text-primary-400"
        />
        
        <StatsCard
          title="Tickets Ouverts"
          value={stats.openTickets.toString()}
          change="+2"
          changeLabel="aujourd'hui"
          icon={<AlertTriangle className="h-6 w-6" />}
          iconBg="bg-error-100 dark:bg-error-900"
          iconColor="text-error-600 dark:text-error-400"
          changeColor="text-error-600"
        />
        
        <StatsCard
          title="Utilisateurs Actifs"
          value={stats.activeUsers.toString()}
          change="+12"
          changeLabel="cette semaine"
          icon={<Users className="h-6 w-6" />}
          iconBg="bg-success-100 dark:bg-success-900"
          iconColor="text-success-600 dark:text-success-400"
          changeColor="text-success-600"
        />
        
        <StatsCard
          title="Licences Expirant"
          value={stats.expiringLicenses.toString()}
          change="dans 30 jours"
          changeLabel=""
          icon={<Key className="h-6 w-6" />}
          iconBg="bg-warning-100 dark:bg-warning-900"
          iconColor="text-warning-600 dark:text-warning-400"
          changeColor="text-warning-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Statut des Équipements</CardTitle>
            <Button variant="ghost" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <EquipmentChart data={stats.equipmentByStatus} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Évolution des Tickets</CardTitle>
            <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-background">
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">3 derniers mois</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <TicketsChart data={stats.ticketsByDay} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Equipment Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Activité Récente des Équipements</CardTitle>
            <Button variant="ghost" className="text-primary-600 hover:text-primary-700">
              Voir tout
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  icon={getActivityIcon(activity.type)}
                  iconBg={getActivityIconBg(activity.type)}
                  iconColor={getActivityIconColor(activity.type)}
                  title={activity.title}
                  description={activity.description}
                  time={formatActivityTime(activity.createdAt)}
                  status={activity.status}
                  statusColor={getActivityStatusColor(activity.status)}
                />
              ))}
              {stats.recentActivities.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Aucune activité récente
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alerts Section */}
        <Card>
          <CardHeader>
            <CardTitle>Alertes et Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.alerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  icon={getAlertIcon(alert.type)}
                  iconColor={getAlertIconColor(alert.priority)}
                  bgColor={getAlertBgColor(alert.priority)}
                  title={alert.title}
                  description={alert.description}
                  action={getAlertAction(alert.type)}
                  actionColor={getAlertActionColor(alert.priority)}
                />
              ))}
              {stats.alerts.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Aucune alerte active
                </p>
              )}
              {stats.upcomingMaintenances.map((maintenance) => (
                <AlertItem
                  key={maintenance.id}
                  icon={<Calendar className="h-5 w-5" />}
                  iconColor="text-primary-600"
                  bgColor="bg-primary-50 border-primary-200 dark:bg-primary-900/50 dark:border-primary-800"
                  title={maintenance.title}
                  description={`${format(new Date(maintenance.startDate), "PPP 'à' HH:mm", { locale: fr })}`}
                  action="Détails"
                  actionColor="text-primary-600 hover:text-primary-800"
                  onClick={() => setSelectedMaintenance(maintenance.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Details Modal */}
      {selectedMaintenance && (
        <MaintenanceDetails
          maintenanceId={selectedMaintenance}
          isOpen={!!selectedMaintenance}
          onClose={() => setSelectedMaintenance(null)}
        />
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeLabel: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  changeColor?: string;
}

function StatsCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon, 
  iconBg, 
  iconColor, 
  changeColor = "text-success-600" 
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${changeColor}`}>{change}</span>
              {changeLabel && <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">{changeLabel}</span>}
            </div>
          </div>
          <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
            <div className={iconColor}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ActivityItemProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  time: string;
  status: string;
  statusColor: string;
}

function ActivityItem({ 
  icon, 
  iconBg, 
  iconColor, 
  title, 
  description, 
  time, 
  status, 
  statusColor 
}: ActivityItemProps) {
  return (
    <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
      <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
      <Badge className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
        {status}
      </Badge>
    </div>
  );
}

interface AlertItemProps {
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
  action: string;
  actionColor: string;
  onClick?: () => void;
}

function AlertItem({ 
  icon, 
  iconColor, 
  bgColor, 
  title, 
  description, 
  action, 
  actionColor, 
  onClick 
}: AlertItemProps) {
  const { user } = useAuth();
  const canSeeActions = user?.role === "admin" || user?.role === "technicien";

  return (
    <div className={`flex items-center p-4 ${bgColor} border rounded-lg`}>
      <div className={`${iconColor} mr-3`}>{icon}</div>
      <div className="flex-1">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {canSeeActions && (
        <Button variant="ghost" className={`font-medium text-sm ${actionColor}`} onClick={onClick}>
          {action}
        </Button>
      )}
    </div>
  );
}

// Fonctions utilitaires pour les activités
function getActivityIcon(type: string) {
  switch (type) {
    case "equipment_added":
      return <Laptop className="h-4 w-4" />;
    case "equipment_maintenance":
      return <AlertTriangle className="h-4 w-4" />;
    case "equipment_updated":
      return <RefreshCw className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
}

function getActivityIconBg(type: string) {
  switch (type) {
    case "equipment_added":
      return "bg-success-100 dark:bg-success-900";
    case "equipment_maintenance":
      return "bg-warning-100 dark:bg-warning-900";
    case "equipment_updated":
      return "bg-primary-100 dark:bg-primary-900";
    default:
      return "bg-gray-100 dark:bg-gray-900";
  }
}

function getActivityIconColor(type: string) {
  switch (type) {
    case "equipment_added":
      return "text-success-600 dark:text-success-400";
    case "equipment_maintenance":
      return "text-warning-600 dark:text-warning-400";
    case "equipment_updated":
      return "text-primary-600 dark:text-primary-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
}

function getActivityStatusColor(status: string) {
  switch (status) {
    case "Nouveau":
      return "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300";
    case "Maintenance":
      return "bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300";
    case "Modifié":
      return "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
}

function formatActivityTime(date: string) {
  const activityDate = new Date(date);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return "Il y a quelques minutes";
  } else if (diffInHours < 24) {
    return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  } else if (diffInHours < 48) {
    return "Hier";
  } else {
    return activityDate.toLocaleDateString();
  }
}

// Fonction pour gérer l'export de rapport
async function handleExportReport() {
  // TODO: Implémenter la génération de rapport
  console.log("Export de rapport non implémenté");
}

interface MaintenanceDetailsProps {
  maintenanceId: string;
  isOpen: boolean;
  onClose: () => void;
}

function MaintenanceDetails({ maintenanceId, isOpen, onClose }: MaintenanceDetailsProps) {
  const { data: maintenance, isLoading } = useQuery({
    queryKey: ["maintenance", maintenanceId],
    queryFn: async () => {
      const response = await fetch(`/api/maintenance/${maintenanceId}`);
      if (!response.ok) throw new Error("Failed to fetch maintenance details");
      return response.json();
    },
    enabled: isOpen,
  });

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Détails de la Maintenance</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : maintenance ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Type</h4>
              <p className="text-sm text-muted-foreground">{maintenance.type}</p>
            </div>
            <div>
              <h4 className="font-medium">Description</h4>
              <p className="text-sm text-muted-foreground">{maintenance.description}</p>
            </div>
            <div>
              <h4 className="font-medium">Date et Heure</h4>
              <p className="text-sm text-muted-foreground">
                {format(new Date(maintenance.startDate), "PPP 'à' HH:mm", { locale: fr })} -{" "}
                {format(new Date(maintenance.endDate), "HH:mm", { locale: fr })}
              </p>
            </div>
            <div>
              <h4 className="font-medium">Statut</h4>
              <p className="text-sm text-muted-foreground">{maintenance.status}</p>
            </div>
            {maintenance.notes && (
              <div>
                <h4 className="font-medium">Notes</h4>
                <p className="text-sm text-muted-foreground">{maintenance.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            Impossible de charger les détails de la maintenance
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Utility functions for alerts
function getAlertIcon(type: string) {
  switch (type) {
    case "licence":
      return <Key className="h-5 w-5" />;
    case "securite":
      return <Shield className="h-5 w-5" />;
    case "maintenance":
      return <AlertTriangle className="h-5 w-5" />;
    default:
      return <Info className="h-5 w-5" />;
  }
}

function getAlertIconColor(priority: string) {
  switch (priority) {
    case "haute":
      return "text-error-600";
    case "moyenne":
      return "text-warning-600";
    case "basse":
      return "text-primary-600";
    default:
      return "text-gray-600";
  }
}

function getAlertBgColor(priority: string) {
  switch (priority) {
    case "haute":
      return "bg-error-50 border-error-200 dark:bg-error-900/50 dark:border-error-800";
    case "moyenne":
      return "bg-warning-50 border-warning-200 dark:bg-warning-900/50 dark:border-warning-800";
    case "basse":
      return "bg-primary-50 border-primary-200 dark:bg-primary-900/50 dark:border-primary-800";
    default:
      return "bg-gray-50 border-gray-200 dark:bg-gray-900/50 dark:border-gray-800";
  }
}

function getAlertAction(type: string) {
  switch (type) {
    case "licence":
      return "Renouveler";
    case "securite":
      return "Résoudre";
    case "maintenance":
      return "Planifier";
    default:
      return "Voir";
  }
}

function getAlertActionColor(priority: string) {
  switch (priority) {
    case "haute":
      return "text-error-600 hover:text-error-800";
    case "moyenne":
      return "text-warning-600 hover:text-warning-800";
    case "basse":
      return "text-primary-600 hover:text-primary-800";
    default:
      return "text-gray-600 hover:text-gray-800";
  }
}
