import { z } from 'zod';

export const inputSchema = z.object({
  recipientId: z.string().optional(),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional(),
  deviceToken: z.string().optional(),
  channel: z.enum(['email', 'sms', 'push']).optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  scheduledAt: z.string().optional(),
  templateId: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
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
