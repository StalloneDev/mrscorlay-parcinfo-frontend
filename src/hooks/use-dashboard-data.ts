import { useQuery } from "@tanstack/react-query";

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  entityId: string;
  entityType: string;
  createdAt: string;
}

interface Alert {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo: string | null;
  entityId: string | null;
  entityType: string | null;
}

interface MaintenanceSchedule {
  id: string;
  type: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface DashboardStats {
  totalEquipment: number;
  openTickets: number;
  activeUsers: number;
  expiringLicenses: number;
  equipmentByStatus: { status: string; count: number }[];
  ticketsByDay: { date: string; created: number; resolved: number }[];
  recentActivities: Activity[];
  alerts: Alert[];
  upcomingMaintenances: MaintenanceSchedule[];
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch("/api/dashboard/stats");
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }
  return response.json();
}

export function useDashboardData() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}
