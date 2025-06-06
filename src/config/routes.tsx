import { Home, Box, Users, Ticket, Map, Shield, Settings, Calendar } from "lucide-react";

export const routes = [
  {
    path: "/",
    label: "Tableau de Bord",
    icon: Home,
  },
  {
    path: "/equipment",
    label: "Gestion des Équipements",
    icon: Box,
  },
  {
    path: "/planning",
    label: "Gestion du Planning",
    icon: Calendar,
  },
  {
    path: "/users",
    label: "Gestion des Utilisateurs",
    icon: Users,
  },
  {
    path: "/tickets",
    label: "Système de Tickets",
    icon: Ticket,
  },
  {
    path: "/inventory",
    label: "Inventaire & Cartographie",
    icon: Map,
  },
  {
    path: "/licenses",
    label: "Licences & Sécurité",
    icon: Shield,
  },
  {
    path: "/settings",
    label: "Paramètres",
    icon: Settings,
  },
] as const; 