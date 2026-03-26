import { z } from 'zod';
import type { ToolDefinition } from '@ascended-agents/core';

export const tools: ToolDefinition[] = [
  {
    name: 'aggregate_metrics',
    description: 'Aggregate raw metric data from one or more sources into a unified dataset.',
    inputSchema: z.object({
      metricNames: z.array(z.string()),
      timeRange: z.object({ from: z.string(), to: z.string() }),
      groupBy: z.array(z.string()).optional(),
      filters: z.record(z.unknown()).optional(),
      aggregationFunction: z.enum(['sum', 'avg', 'min', 'max', 'count']).optional(),
    }),
    outputSchema: z.object({
      aggregations: z.array(z.object({
        metric: z.string(),
        value: z.number(),
        dimensions: z.record(z.string()),
        timestamp: z.string(),
      })),
      totalRows: z.number(),
      processedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['analytics', 'metrics', 'aggregation'],
  },
  {
    name: 'generate_dashboard',
    description: 'Build or refresh an analytics dashboard with the latest metric data.',
    inputSchema: z.object({
      dashboardId: z.string().optional(),
      dashboardName: z.string().optional(),
      widgets: z.array(z.object({
        type: z.enum(['chart', 'table', 'kpi', 'funnel']),
        metricName: z.string(),
        config: z.record(z.unknown()).optional(),
      })).optional(),
    }),
    outputSchema: z.object({
      dashboardId: z.string(),
      dashboardUrl: z.string().optional(),
      widgetCount: z.number(),
      generatedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['analytics', 'dashboard', 'visualization'],
  },
  {
    name: 'track_event',
    description: 'Record a structured analytics event for user or system behaviour tracking.',
    inputSchema: z.object({
      eventName: z.string(),
      userId: z.string().optional(),
      sessionId: z.string().optional(),
      properties: z.record(z.unknown()).optional(),
      timestamp: z.string().optional(),
    }),
    outputSchema: z.object({
      eventId: z.string(),
      tracked: z.boolean(),
      trackedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['analytics', 'event-tracking'],
  },
  {
    name: 'generate_analytics_report',
    description: 'Generate a structured analytics report from aggregated metric data.',
    inputSchema: z.object({
      reportType: z.string(),
      metricNames: z.array(z.string()).optional(),
      dateRange: z.object({ from: z.string(), to: z.string() }).optional(),
      format: z.enum(['pdf', 'csv', 'json', 'html']).optional(),
    }),
    outputSchema: z.object({
      reportId: z.string(),
      reportUrl: z.string().optional(),
      generatedAt: z.string(),
      summary: z.record(z.unknown()),
    }),
    version: '1.0.0',
    tags: ['analytics', 'reporting'],
  },
  {
    name: 'export_report',
    description: 'Export an analytics report to an external destination (S3, email, FTP).',
    inputSchema: z.object({
      reportId: z.string(),
      destination: z.enum(['s3', 'email', 'ftp', 'webhook']),
      destinationConfig: z.record(z.unknown()),
    }),
    outputSchema: z.object({
      exportId: z.string(),
      exported: z.boolean(),
      exportedAt: z.string(),
      destinationRef: z.string().optional(),
    }),
    version: '1.0.0',
    tags: ['analytics', 'export'],
  },
];
