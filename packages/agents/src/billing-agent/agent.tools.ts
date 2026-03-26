import { z } from 'zod';
import type { ToolDefinition } from '@ascended-agents/core';

export const tools: ToolDefinition[] = [
  {
    name: 'create_invoice',
    description: 'Generate a new invoice record for a customer and return the invoice ID.',
    inputSchema: z.object({
      customerId: z.string(),
      lineItems: z.array(z.object({
        description: z.string(),
        quantity: z.number().positive(),
        unitPrice: z.number().nonnegative(),
      })),
      currency: z.string().length(3),
      dueDate: z.string(),
    }),
    outputSchema: z.object({
      invoiceId: z.string(),
      totalAmount: z.number(),
      status: z.enum(['draft', 'issued', 'paid', 'overdue']),
      createdAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['billing', 'invoice'],
  },
  {
    name: 'verify_payment',
    description: 'Verify the status of a payment transaction against the payment gateway.',
    inputSchema: z.object({
      transactionId: z.string(),
      expectedAmount: z.number().positive(),
      currency: z.string().length(3),
    }),
    outputSchema: z.object({
      verified: z.boolean(),
      status: z.enum(['pending', 'completed', 'failed', 'disputed']),
      paidAt: z.string().optional(),
      gatewayReference: z.string().optional(),
    }),
    version: '1.0.0',
    tags: ['billing', 'payment'],
  },
  {
    name: 'process_refund',
    description: 'Initiate a refund for a previously completed payment.',
    inputSchema: z.object({
      transactionId: z.string(),
      refundAmount: z.number().positive(),
      reason: z.string(),
      notifyCustomer: z.boolean().optional(),
    }),
    outputSchema: z.object({
      refundId: z.string(),
      status: z.enum(['initiated', 'processing', 'completed', 'failed']),
      refundedAt: z.string().optional(),
      estimatedArrival: z.string().optional(),
    }),
    version: '1.0.0',
    tags: ['billing', 'refund'],
  },
  {
    name: 'update_ledger',
    description: 'Post a debit or credit entry to the financial ledger.',
    inputSchema: z.object({
      accountId: z.string(),
      entryType: z.enum(['debit', 'credit']),
      amount: z.number().positive(),
      currency: z.string().length(3),
      description: z.string(),
      referenceId: z.string().optional(),
    }),
    outputSchema: z.object({
      ledgerEntryId: z.string(),
      newBalance: z.number(),
      postedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['billing', 'accounting'],
  },
  {
    name: 'send_billing_notification',
    description: 'Dispatch a billing-related email or SMS notification to a customer.',
    inputSchema: z.object({
      customerId: z.string(),
      email: z.string().email(),
      notificationType: z.enum(['invoice_issued', 'payment_received', 'refund_processed', 'overdue_reminder']),
      invoiceId: z.string().optional(),
      amount: z.number().optional(),
    }),
    outputSchema: z.object({
      notificationId: z.string(),
      sent: z.boolean(),
      channel: z.string(),
      sentAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['billing', 'notification'],
  },
];
