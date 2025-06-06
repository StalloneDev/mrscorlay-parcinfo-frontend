import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/useRole";
import { 
  LayoutDashboard, 
  Users, 
  UserRoundCheck, 
  Laptop, 
  Ticket, 
  ClipboardList, 
  Shield, 
  Settings,
  Calendar
} from "lucide-react";

const navigation = [
  { name: "Tableau de Bord", href: "/", icon: LayoutDashboard, roles: ["admin", "technicien", "utilisateur"] },
  { name: "Gestion des Utilisateurs", href: "/users", icon: Users, roles: ["admin", "technicien"] },
  { name: "Gestion des Employés", href: "/employees", icon: UserRoundCheck, roles: ["admin", "technicien", "utilisateur"] },
  { name: "Gestion des Équipements", href: "/equipment", icon: Laptop, roles: ["admin", "technicien"] },
  { name: "Gestion du Planning", href: "/planning", icon: Calendar, roles: ["admin", "technicien"] },
  { name: "Système de Tickets", href: "/tickets", icon: Ticket, roles: ["admin", "technicien", "utilisateur"] },
  { name: "Inventaire & Cartographie", href: "/inventory", icon: ClipboardList, roles: ["admin", "technicien"] },
  { name: "Licences & Sécurité", href: "/licenses", icon: Shield, roles: ["admin", "technicien"] },
  { name: "Paramètres", href: "/settings", icon: Settings, roles: ["admin"] },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, hasAccess } = useRole();

  return (
    <div className="w-80 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <img 
            src="https://www.mrsholdings.com/wp-content/uploads/2016/03/MRS-approved-logo-png-1.png" 
            alt="MRS Holdings Logo" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Parc Info</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">v2.0</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation
          .filter((item) => hasAccess(item.roles))
          .map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/50 border-l-4 border-primary-500"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </a>
              </Link>
            );
          })}

      </nav>

      {/* User Profile */}
      
    </div>
  );
}
