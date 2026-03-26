import { z } from 'zod';

export const inputSchema = z.object({
  targetSystem: z.string().optional(),
  scanScope: z.enum(['full', 'dependencies', 'runtime', 'infrastructure']).optional(),
  accessPolicyId: z.string().optional(),
  userId: z.string().optional(),
  requiredPermissions: z.array(z.string()).optional(),
  alertSeverityThreshold: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  reportFormat: z.enum(['pdf', 'json', 'html']).optional(),
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
