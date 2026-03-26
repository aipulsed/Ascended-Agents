import { z } from 'zod';

export const inputSchema = z.object({
  reportId: z.string().optional(),
  reportType: z.enum(['summary', 'detailed', 'executive', 'operational']).optional(),
  dataSources: z.array(z.string()).optional(),
  timeRange: z.object({
    from: z.string(),
    to: z.string(),
  }).optional(),
  format: z.enum(['pdf', 'csv', 'html', 'json']).optional(),
  recipients: z.array(z.string().email()).optional(),
  includeCharts: z.boolean().optional(),
  archiveAfterDistribution: z.boolean().optional(),
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
