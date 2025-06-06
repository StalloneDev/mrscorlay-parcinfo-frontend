export const EQUIPMENT_TYPES = [
  { value: "ordinateur", label: "Ordinateur" },
  { value: "serveur", label: "Serveur" },
  { value: "périphérique", label: "Périphérique" },
] as const;

export const EQUIPMENT_STATUS = [
  { value: "en service", label: "En Service", color: "success" },
  { value: "en maintenance", label: "En Maintenance", color: "warning" },
  { value: "hors service", label: "Hors Service", color: "error" },
] as const;

export const USER_ROLES = [
  { value: "admin", label: "Administrateur" },
  { value: "technicien", label: "Technicien" },
  { value: "utilisateur", label: "Utilisateur" },
] as const;

export const TICKET_STATUS = [
  { value: "ouvert", label: "Ouvert", color: "error" },
  { value: "assigné", label: "Assigné", color: "warning" },
  { value: "en cours", label: "En Cours", color: "primary" },
  { value: "résolu", label: "Résolu", color: "success" },
  { value: "clôturé", label: "Clôturé", color: "muted" },
] as const;

export const TICKET_PRIORITY = [
  { value: "basse", label: "Basse", color: "success" },
  { value: "moyenne", label: "Moyenne", color: "warning" },
  { value: "haute", label: "Haute", color: "error" },
] as const;

export const INVENTORY_CONDITION = [
  { value: "fonctionnel", label: "Fonctionnel", color: "success" },
  { value: "défectueux", label: "Défectueux", color: "error" },
] as const;

export const LICENSE_TYPES = [
  "Microsoft Office",
  "Windows",
  "Adobe Creative Suite",
  "Antivirus",
  "CAD Software",
  "Development Tools",
  "Database",
  "Other",
] as const;
