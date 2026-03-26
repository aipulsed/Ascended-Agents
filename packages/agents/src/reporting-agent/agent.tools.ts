import { z } from 'zod';
import type { ToolDefinition } from '@ascended-agents/core';

export const tools: ToolDefinition[] = [
  {
    name: 'aggregate_data',
    description: 'Collect and aggregate data from multiple sources into a unified reporting dataset.',
    inputSchema: z.object({
      dataSources: z.array(z.string()),
      timeRange: z.object({ from: z.string(), to: z.string() }).optional(),
      filters: z.record(z.unknown()).optional(),
      aggregationConfig: z.record(z.unknown()).optional(),
    }),
    outputSchema: z.object({
      datasetId: z.string(),
      rowCount: z.number(),
      sources: z.array(z.string()),
      aggregatedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['reporting', 'data-aggregation'],
  },
  {
    name: 'generate_report',
    description: 'Build a structured report from an aggregated dataset with configurable sections.',
    inputSchema: z.object({
      datasetId: z.string(),
      reportType: z.enum(['summary', 'detailed', 'executive', 'operational']),
      sections: z.array(z.string()).optional(),
      includeCharts: z.boolean().optional(),
    }),
    outputSchema: z.object({
      reportId: z.string(),
      status: z.enum(['draft', 'ready', 'failed']),
      generatedAt: z.string(),
      sectionCount: z.number(),
    }),
    version: '1.0.0',
    tags: ['reporting', 'generation'],
  },
  {
    name: 'format_report',
    description: 'Render a report into the desired output format (PDF, CSV, HTML, JSON).',
    inputSchema: z.object({
      reportId: z.string(),
      format: z.enum(['pdf', 'csv', 'html', 'json']),
      templateId: z.string().optional(),
      locale: z.string().optional(),
    }),
    outputSchema: z.object({
      formattedReportId: z.string(),
      format: z.string(),
      fileSize: z.number(),
      downloadUrl: z.string().optional(),
      formattedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['reporting', 'formatting'],
  },
  {
    name: 'distribute_report',
    description: 'Distribute a formatted report to a list of email recipients or external destinations.',
    inputSchema: z.object({
      reportId: z.string(),
      recipients: z.array(z.string().email()),
      subject: z.string().optional(),
      attachmentFormat: z.enum(['pdf', 'csv', 'html', 'json']).optional(),
      externalDestination: z.string().optional(),
    }),
    outputSchema: z.object({
      distributionId: z.string(),
      delivered: z.number(),
      failed: z.number(),
      distributedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['reporting', 'distribution', 'email'],
  },
  {
    name: 'archive_report',
    description: 'Archive a completed report to long-term storage with retention metadata.',
    inputSchema: z.object({
      reportId: z.string(),
      destination: z.string().optional(),
      retentionDays: z.number().int().positive().optional(),
      tags: z.array(z.string()).optional(),
    }),
    outputSchema: z.object({
      archiveId: z.string(),
      location: z.string(),
      archivedAt: z.string(),
      expiresAt: z.string().optional(),
    }),
    version: '1.0.0',
    tags: ['reporting', 'archive', 'storage'],
  },
];
