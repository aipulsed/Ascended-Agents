import { z } from 'zod';

export const inputSchema = z.object({
  topic: z.string().optional(),
  sourceUrls: z.array(z.string().url()).optional(),
  documentPaths: z.array(z.string()).optional(),
  knowledgeBaseId: z.string().optional(),
  searchQuery: z.string().optional(),
  alertThreshold: z.enum(['low', 'medium', 'high']).optional(),
  maxResults: z.number().int().positive().optional(),
  outputFormat: z.enum(['summary', 'structured', 'raw']).optional(),
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
