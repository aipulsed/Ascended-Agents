import { z } from 'zod';

export const inputSchema = z.object({
  campaignId: z.string().optional(),
  campaignName: z.string().optional(),
  targetAudience: z.array(z.string()).optional(),
  scheduleDate: z.string().optional(),
  channels: z.array(z.enum(['email', 'sms', 'social', 'push'])).optional(),
  segmentCriteria: z.record(z.unknown()).optional(),
  socialPlatform: z.enum(['twitter', 'linkedin', 'facebook', 'instagram']).optional(),
  contentBody: z.string().optional(),
  trackingPeriod: z.string().optional(),
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
