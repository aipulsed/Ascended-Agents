import { z } from 'zod';
import type { ToolDefinition } from '@ascended-agents/core';

export const tools: ToolDefinition[] = [
  {
    name: 'capture_lead',
    description: 'Create a new lead record in the CRM from captured contact information.',
    inputSchema: z.object({
      fullName: z.string(),
      email: z.string().email(),
      company: z.string().optional(),
      phone: z.string().optional(),
      source: z.string(),
      tags: z.array(z.string()).optional(),
    }),
    outputSchema: z.object({
      leadId: z.string(),
      status: z.enum(['new', 'qualified', 'unqualified']),
      createdAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['crm', 'lead'],
  },
  {
    name: 'update_contact',
    description: 'Update an existing CRM contact record with new information.',
    inputSchema: z.object({
      contactId: z.string(),
      updates: z.record(z.unknown()),
    }),
    outputSchema: z.object({
      contactId: z.string(),
      updated: z.boolean(),
      updatedAt: z.string(),
      changedFields: z.array(z.string()),
    }),
    version: '1.0.0',
    tags: ['crm', 'contact'],
  },
  {
    name: 'score_lead',
    description: 'Calculate and assign a lead score based on engagement and profile data.',
    inputSchema: z.object({
      leadId: z.string(),
      scoringModel: z.string().optional(),
    }),
    outputSchema: z.object({
      leadId: z.string(),
      score: z.number().min(0).max(100),
      tier: z.enum(['cold', 'warm', 'hot']),
      scoredAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['crm', 'lead-scoring'],
  },
  {
    name: 'schedule_followup',
    description: 'Create a scheduled follow-up task for a contact or lead.',
    inputSchema: z.object({
      contactId: z.string(),
      followUpDate: z.string(),
      assignedTo: z.string().optional(),
      notes: z.string().optional(),
      channel: z.enum(['email', 'phone', 'meeting']).optional(),
    }),
    outputSchema: z.object({
      taskId: z.string(),
      scheduledAt: z.string(),
      assignedTo: z.string(),
      status: z.enum(['pending', 'completed', 'overdue']),
    }),
    version: '1.0.0',
    tags: ['crm', 'task'],
  },
  {
    name: 'generate_crm_report',
    description: 'Generate a CRM report covering leads, conversions, and pipeline metrics.',
    inputSchema: z.object({
      reportType: z.enum(['lead_summary', 'conversion_rate', 'pipeline']),
      dateRange: z.object({ from: z.string(), to: z.string() }).optional(),
      format: z.enum(['pdf', 'csv', 'json']).optional(),
    }),
    outputSchema: z.object({
      reportId: z.string(),
      reportUrl: z.string().optional(),
      generatedAt: z.string(),
      summary: z.record(z.unknown()),
    }),
    version: '1.0.0',
    tags: ['crm', 'reporting'],
  },
];
