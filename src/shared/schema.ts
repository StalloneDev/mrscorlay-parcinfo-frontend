import { z } from "zod";

// Types de base
export type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "admin" | "technicien" | "utilisateur";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Equipment = {
  id: string;
  type: "ordinateur" | "serveur" | "périphérique";
  model: string;
  serialNumber: string;
  purchaseDate: Date;
  status: "en service" | "en maintenance" | "hors service";
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Ticket = {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  assignedTo: string | null;
  status: "ouvert" | "assigné" | "en cours" | "résolu" | "clôturé";
  priority: "basse" | "moyenne" | "haute";
  createdAt: Date;
  updatedAt: Date;
};

export type Inventory = {
  id: string;
  equipmentId: string;
  assignedTo: string | null;
  location: string;
  lastChecked: Date;
  condition: "fonctionnel" | "défectueux";
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
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
  purchaseDate: z.date(),
  status: z.enum(["en service", "en maintenance", "hors service"]),
  assignedTo: z.string().nullable(),
});

export const insertInventorySchema = z.object({
  equipmentId: z.string(),
  assignedTo: z.string().nullable(),
  location: z.string(),
  lastChecked: z.date(),
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
}); 