import { z } from 'zod';

export const inputSchema = z.object({
  customerId: z.string(),
  amount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  invoiceId: z.string().optional(),
  paymentMethod: z.enum(['credit_card', 'bank_transfer', 'paypal', 'stripe']).optional(),
  refundReason: z.string().optional(),
  notificationEmail: z.string().email().optional(),
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
