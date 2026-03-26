import { z } from 'zod';

export const inputSchema = z.object({
  customerId: z.string(),
  vendorId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().nonnegative(),
  })).optional(),
  dueDate: z.string().optional(),
  currency: z.string().length(3).optional(),
  recipientEmail: z.string().email().optional(),
  approvalRequired: z.boolean().optional(),
});

export const outputSchema = z.object({
  executionPlan: z.array(z.record(z.unknown())),
  meta: z.record(z.unknown()),
  validation: z.object({
    schemaValid: z.boolean(),
    constraintsPassed: z.boolean(),
    toolsResolved: z.boolean(),
  }),
});
