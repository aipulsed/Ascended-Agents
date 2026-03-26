import { z } from 'zod';

export const inputSchema = z.object({
  failedAgentId: z.string(),
  failureReason: z.string(),
  originalInput: z.record(z.unknown()).optional(),
  sessionId: z.string().optional(),
  errorCode: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  retryCount: z.number().int().min(0).optional(),
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
