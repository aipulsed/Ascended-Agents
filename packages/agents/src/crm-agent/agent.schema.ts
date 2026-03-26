import { z } from 'zod';

export const inputSchema = z.object({
  contactId: z.string().optional(),
  leadSource: z.string().optional(),
  email: z.string().email().optional(),
  fullName: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  tags: z.array(z.string()).optional(),
  followUpDate: z.string().optional(),
  reportType: z.enum(['lead_summary', 'conversion_rate', 'pipeline']).optional(),
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
