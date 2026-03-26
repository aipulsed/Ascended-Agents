import { z } from 'zod';

export const inputSchema = z.object({
  projectId: z.string().optional(),
  testSuites: z.array(z.string()).optional(),
  testType: z.enum(['unit', 'integration', 'e2e', 'all']).optional(),
  coverageThreshold: z.number().min(0).max(100).optional(),
  notifyOnFailure: z.boolean().optional(),
  notifyChannels: z.array(z.string()).optional(),
  reportFormat: z.enum(['html', 'json', 'xml']).optional(),
  parallelWorkers: z.number().int().positive().optional(),
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
