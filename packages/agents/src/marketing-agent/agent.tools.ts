import { z } from 'zod';
import type { ToolDefinition } from '@ascended-agents/core';

export const tools: ToolDefinition[] = [
  {
    name: 'schedule_campaign',
    description: 'Schedule a marketing campaign across one or more channels for a target audience.',
    inputSchema: z.object({
      campaignName: z.string(),
      channels: z.array(z.enum(['email', 'sms', 'social', 'push'])),
      targetAudience: z.array(z.string()),
      scheduledAt: z.string(),
      content: z.record(z.unknown()).optional(),
    }),
    outputSchema: z.object({
      campaignId: z.string(),
      status: z.enum(['scheduled', 'draft', 'active', 'paused']),
      scheduledAt: z.string(),
      estimatedReach: z.number().optional(),
    }),
    version: '1.0.0',
    tags: ['marketing', 'campaign'],
  },
  {
    name: 'segment_leads',
    description: 'Divide a lead pool into targeted segments based on behavioural and demographic criteria.',
    inputSchema: z.object({
      criteria: z.record(z.unknown()),
      leadPoolId: z.string().optional(),
      maxSegments: z.number().int().positive().optional(),
    }),
    outputSchema: z.object({
      segments: z.array(z.object({
        segmentId: z.string(),
        name: z.string(),
        size: z.number(),
      })),
      totalLeads: z.number(),
      segmentedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['marketing', 'segmentation'],
  },
  {
    name: 'track_conversion',
    description: 'Record a conversion event and attribute it to the originating campaign or channel.',
    inputSchema: z.object({
      leadId: z.string(),
      campaignId: z.string().optional(),
      conversionType: z.string(),
      value: z.number().nonnegative().optional(),
      metadata: z.record(z.unknown()).optional(),
    }),
    outputSchema: z.object({
      conversionId: z.string(),
      attributed: z.boolean(),
      trackedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['marketing', 'conversion', 'analytics'],
  },
  {
    name: 'generate_analytics_report',
    description: 'Build a marketing analytics report summarising campaign performance and ROI.',
    inputSchema: z.object({
      campaignIds: z.array(z.string()).optional(),
      dateRange: z.object({ from: z.string(), to: z.string() }).optional(),
      metrics: z.array(z.string()).optional(),
      format: z.enum(['pdf', 'csv', 'json']).optional(),
    }),
    outputSchema: z.object({
      reportId: z.string(),
      reportUrl: z.string().optional(),
      generatedAt: z.string(),
      summary: z.record(z.unknown()),
    }),
    version: '1.0.0',
    tags: ['marketing', 'analytics', 'reporting'],
  },
  {
    name: 'post_to_social',
    description: 'Publish content to a social media platform on behalf of the configured account.',
    inputSchema: z.object({
      platform: z.enum(['twitter', 'linkedin', 'facebook', 'instagram']),
      content: z.string(),
      mediaUrls: z.array(z.string().url()).optional(),
      scheduledAt: z.string().optional(),
    }),
    outputSchema: z.object({
      postId: z.string(),
      platform: z.string(),
      published: z.boolean(),
      publishedAt: z.string().optional(),
      postUrl: z.string().optional(),
    }),
    version: '1.0.0',
    tags: ['marketing', 'social-media'],
  },
];
