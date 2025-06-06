import { useAuth } from "./useAuth";

export function useRole() {
  const { user } = useAuth();

  const hasAccess = (allowedRoles: string[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const isAdmin = () => user?.role === "admin";
  const isTechnician = () => user?.role === "technicien";
  const isUser = () => user?.role === "utilisateur";
  
  const canAccessPage = (page: string) => {
    if (!user) return false;
    
    // Admin et technicien ont accès à tout
    if (isAdmin() || isTechnician()) return true;
    
    // Utilisateurs ont accès seulement à certaines pages
    const userAllowedPages = ["/", "/employees", "/equipment", "/tickets"];
    return userAllowedPages.includes(page);
  };

  const canPerformAction = (action: string) => {
    if (!user) return false;
    
    // Admin peut tout faire
    if (isAdmin()) return true;
    
    // Technicien peut tout faire sauf gestion des utilisateurs
    if (isTechnician()) {
      const technicianRestrictedActions = ["delete_user", "create_user", "edit_user"];
      return !technicianRestrictedActions.includes(action);
    }
    
    // Utilisateurs peuvent seulement créer des tickets
    if (isUser()) {
      const userAllowedActions = ["create_ticket", "view"];
      return userAllowedActions.includes(action);
    }
    
    return false;
  };

  return {
    user,
    hasAccess,
    isAdmin,
    isTechnician,
    isUser,
    canAccessPage,
    canPerformAction
  };
}