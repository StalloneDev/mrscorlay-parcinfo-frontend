import { z } from "zod";
import { insertInventorySchema } from "@shared/schema";

export type InventoryFormData = {
  equipmentId: string;
  assignedTo?: string | null;
  location: string;
  condition: "fonctionnel" | "défectueux";
}; 