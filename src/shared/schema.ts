import { z } from "zod";

// Types de base
export type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  name?: string;
  phone?: string;
  team?: string;
  role: "admin" | "technicien" | "utilisateur";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  createdAt: string;
  updatedAt: string;
};

export type Equipment = {
  id: string;
  type: "ordinateur" | "serveur" | "périphérique";
  model: string;
  serialNumber: string;
  purchaseDate: string;
  status: "en service" | "en maintenance" | "hors service";
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EquipmentHistory = {
  id: string;
  equipmentId: string;
  action: "assignation" | "maintenance" | "retrait";
  description: string;
  performedBy: string;
  date: string;
  updatedBy: string;
  changes: string;
  createdAt: string;
  updatedAt: string;
};

export type Ticket = {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  assignedTo: string | null;
  status: "ouvert" | "assigné" | "en cours" | "résolu" | "clôturé";
  priority: "basse" | "moyenne" | "haute";
  createdAt: string;
  updatedAt: string;
};

export type Inventory = {
  id: string;
  equipmentId: string;
  assignedTo: string | null;
  location: string;
  lastChecked: string;
  condition: "fonctionnel" | "défectueux";
  createdAt: string;
  updatedAt: string;
};

export type License = {
  id: string;
  name: string;
  vendor: string;
  type: string;
  licenseKey: string | null;
  maxUsers: number | null;
  currentUsers: number;
  cost: number | null;
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Alert = {
  id: string;
  title: string;
  message: string;
  description: string;
  type: "info" | "warning" | "error" | "success";
  status: "nouvelle" | "lue";
  createdAt: string;
  read: boolean;
  userId: string;
};

export type MaintenanceSchedule = {
  id: string;
  equipmentId: string;
  title: string;
  scheduledDate: string;
  startDate: string;
  endDate: string;
  type: "preventive" | "corrective";
  description: string;
  assignedTo: string | null;
  status: "planifié" | "en cours" | "terminé" | "annulé";
  createdAt: string;
  updatedAt: string;
};

// Schémas Zod
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  role: z.enum(["admin", "technicien", "utilisateur"]),
  isActive: z.boolean(),
});

export const insertEmployeeSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  department: z.string(),
  position: z.string(),
});

export const insertEquipmentSchema = z.object({
  type: z.enum(["ordinateur", "serveur", "périphérique"]),
  model: z.string(),
  serialNumber: z.string(),
  purchaseDate: z.string(),
  status: z.enum(["en service", "en maintenance", "hors service"]),
  assignedTo: z.string().nullable(),
});

export const insertInventorySchema = z.object({
  equipmentId: z.string(),
  assignedTo: z.string().nullable(),
  location: z.string(),
  lastChecked: z.string(),
  condition: z.enum(["fonctionnel", "défectueux"]),
});

export const insertLicenseSchema = z.object({
  name: z.string(),
  vendor: z.string(),
  type: z.string(),
  licenseKey: z.string().nullable(),
  maxUsers: z.number().nullable(),
  currentUsers: z.number(),
  cost: z.number().nullable(),
  expiryDate: z.string().nullable(),
}); 