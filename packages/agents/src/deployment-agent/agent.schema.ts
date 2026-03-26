import { z } from 'zod';

export const inputSchema = z.object({
  deploymentId: z.string().optional(),
  environment: z.enum(['dev', 'staging', 'production']).optional(),
  serviceId: z.string().optional(),
  imageTag: z.string().optional(),
  rollbackVersion: z.string().optional(),
  notifyChannels: z.array(z.string()).optional(),
  dryRun: z.boolean().optional(),
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
