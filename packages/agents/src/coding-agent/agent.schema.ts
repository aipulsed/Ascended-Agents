import { z } from 'zod';

export const inputSchema = z.object({
  repositoryUrl: z.string().url().optional(),
  branch: z.string().optional(),
  targetFiles: z.array(z.string()).optional(),
  lintConfig: z.record(z.unknown()).optional(),
  buildCommand: z.string().optional(),
  testCommand: z.string().optional(),
  generateDocs: z.boolean().optional(),
  securityScanLevel: z.enum(['low', 'medium', 'high']).optional(),
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
