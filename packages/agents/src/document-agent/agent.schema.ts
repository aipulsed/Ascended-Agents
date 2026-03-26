import { z } from 'zod';

export const inputSchema = z.object({
  documentId: z.string().optional(),
  documentUrl: z.string().url().optional(),
  documentType: z.enum(['pdf', 'docx', 'txt', 'html', 'image']).optional(),
  classificationCategory: z.string().optional(),
  archiveDestination: z.string().optional(),
  summaryMaxWords: z.number().int().positive().optional(),
  validationRules: z.array(z.string()).optional(),
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
