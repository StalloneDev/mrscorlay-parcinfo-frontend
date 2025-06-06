import { useQuery } from "@tanstack/react-query";
import type { Alert } from "@shared/schema";

interface NotificationState {
  unreadCount: number;
  notifications: Alert[];
}

async function fetchNotifications(): Promise<Alert[]> {
  const response = await fetch("/api/alerts");
  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }
  return response.json();
}

export function useNotifications() {
  const { data: notifications = [], isLoading, error } = useQuery<Alert[]>({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  // Filtrer pour n'obtenir que les notifications non lues (status: "nouvelle")
  const unreadNotifications = notifications.filter(
    (notification) => notification.status === "nouvelle"
  );

  return {
    notifications,
    unreadCount: unreadNotifications.length,
    isLoading,
    error,
  };
} 