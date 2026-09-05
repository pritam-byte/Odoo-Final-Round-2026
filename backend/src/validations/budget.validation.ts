import { z } from "zod";

export const createBudgetSchema = z.object({
  name: z.string().min(1, "Budget name is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  analyticId: z.string().uuid("Analytic ID is required"),
  responsibleId: z.string().uuid("Responsible Contact ID is required"),
  committedAmount: z.coerce.number().positive("Committed amount must be positive"),
});