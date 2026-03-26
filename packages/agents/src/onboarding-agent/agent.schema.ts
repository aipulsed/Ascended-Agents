import { z } from 'zod';

export const inputSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  role: z.string().optional(),
  teamId: z.string().optional(),
  resourcesRequired: z.array(z.string()).optional(),
  welcomeEmailTemplate: z.string().optional(),
  organizationId: z.string().optional(),
  skipSteps: z.array(z.enum(['welcome_email', 'role_assignment', 'resource_provisioning'])).optional(),
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
