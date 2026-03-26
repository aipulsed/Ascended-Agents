import { z } from 'zod';

export const inputSchema = z.object({
  metricNames: z.array(z.string()).optional(),
  timeRange: z.object({
    from: z.string(),
    to: z.string(),
  }).optional(),
  dashboardId: z.string().optional(),
  eventName: z.string().optional(),
  eventProperties: z.record(z.unknown()).optional(),
  reportFormat: z.enum(['pdf', 'csv', 'json', 'html']).optional(),
  groupBy: z.array(z.string()).optional(),
  filters: z.record(z.unknown()).optional(),
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
