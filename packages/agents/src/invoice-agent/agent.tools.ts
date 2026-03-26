import { z } from 'zod';
import type { ToolDefinition } from '@ascended-agents/core';

export const tools: ToolDefinition[] = [
  {
    name: 'generate_invoice',
    description: 'Create a structured invoice document from line items and customer data.',
    inputSchema: z.object({
      customerId: z.string(),
      vendorId: z.string().optional(),
      lineItems: z.array(z.object({
        description: z.string(),
        quantity: z.number().positive(),
        unitPrice: z.number().nonnegative(),
        taxRate: z.number().min(0).max(1).optional(),
      })),
      currency: z.string().length(3),
      dueDate: z.string(),
      notes: z.string().optional(),
    }),
    outputSchema: z.object({
      invoiceId: z.string(),
      invoiceNumber: z.string(),
      subtotal: z.number(),
      tax: z.number(),
      total: z.number(),
      status: z.enum(['draft', 'pending_approval', 'approved', 'sent']),
      generatedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['invoice', 'billing'],
  },
  {
    name: 'validate_invoice',
    description: 'Validate an invoice against business rules and compliance requirements before approval.',
    inputSchema: z.object({
      invoiceId: z.string(),
      strictMode: z.boolean().optional(),
    }),
    outputSchema: z.object({
      invoiceId: z.string(),
      valid: z.boolean(),
      violations: z.array(z.object({ rule: z.string(), message: z.string() })),
      validatedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['invoice', 'validation', 'compliance'],
  },
  {
    name: 'approve_invoice',
    description: 'Mark an invoice as approved and ready for payment processing.',
    inputSchema: z.object({
      invoiceId: z.string(),
      approverId: z.string(),
      notes: z.string().optional(),
    }),
    outputSchema: z.object({
      invoiceId: z.string(),
      approved: z.boolean(),
      approvedBy: z.string(),
      approvedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['invoice', 'approval', 'workflow'],
  },
  {
    name: 'archive_invoice',
    description: 'Archive a completed or cancelled invoice to long-term storage.',
    inputSchema: z.object({
      invoiceId: z.string(),
      reason: z.string().optional(),
      retentionDays: z.number().int().positive().optional(),
    }),
    outputSchema: z.object({
      archiveId: z.string(),
      invoiceId: z.string(),
      archivedAt: z.string(),
      location: z.string(),
    }),
    version: '1.0.0',
    tags: ['invoice', 'archive', 'storage'],
  },
  {
    name: 'notify_invoice_recipient',
    description: 'Send an invoice notification email to the customer or recipient.',
    inputSchema: z.object({
      invoiceId: z.string(),
      recipientEmail: z.string().email(),
      notificationType: z.enum(['invoice_sent', 'payment_due', 'overdue', 'payment_received']),
      includeAttachment: z.boolean().optional(),
    }),
    outputSchema: z.object({
      notificationId: z.string(),
      sent: z.boolean(),
      sentAt: z.string(),
      channel: z.string(),
    }),
    version: '1.0.0',
    tags: ['invoice', 'notification', 'email'],
  },
];
