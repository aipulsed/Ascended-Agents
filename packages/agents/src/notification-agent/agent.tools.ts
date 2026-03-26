import { z } from 'zod';
import type { ToolDefinition } from '@ascended-agents/core';

export const tools: ToolDefinition[] = [
  {
    name: 'send_email',
    description: 'Send a transactional or marketing email through the configured email provider.',
    inputSchema: z.object({
      to: z.string().email(),
      subject: z.string(),
      body: z.string(),
      templateId: z.string().optional(),
      templateData: z.record(z.unknown()).optional(),
      from: z.string().email().optional(),
      replyTo: z.string().email().optional(),
    }),
    outputSchema: z.object({
      messageId: z.string(),
      sent: z.boolean(),
      sentAt: z.string(),
      provider: z.string(),
    }),
    version: '1.0.0',
    tags: ['notification', 'email'],
  },
  {
    name: 'send_sms',
    description: 'Send an SMS message to a mobile phone number via the configured SMS gateway.',
    inputSchema: z.object({
      to: z.string(),
      body: z.string().max(160),
      from: z.string().optional(),
      encoding: z.enum(['gsm7', 'ucs2']).optional(),
    }),
    outputSchema: z.object({
      messageId: z.string(),
      sent: z.boolean(),
      sentAt: z.string(),
      segments: z.number(),
    }),
    version: '1.0.0',
    tags: ['notification', 'sms'],
  },
  {
    name: 'send_push_notification',
    description: 'Deliver a push notification to a registered device token.',
    inputSchema: z.object({
      deviceToken: z.string(),
      title: z.string(),
      body: z.string(),
      data: z.record(z.unknown()).optional(),
      platform: z.enum(['ios', 'android', 'web']).optional(),
      priority: z.enum(['normal', 'high']).optional(),
    }),
    outputSchema: z.object({
      notificationId: z.string(),
      delivered: z.boolean(),
      deliveredAt: z.string().optional(),
      platform: z.string(),
    }),
    version: '1.0.0',
    tags: ['notification', 'push'],
  },
  {
    name: 'schedule_notification',
    description: 'Schedule a notification to be sent at a future date and time.',
    inputSchema: z.object({
      recipientId: z.string(),
      channel: z.enum(['email', 'sms', 'push']),
      scheduledAt: z.string(),
      templateId: z.string().optional(),
      payload: z.record(z.unknown()),
    }),
    outputSchema: z.object({
      scheduleId: z.string(),
      scheduledAt: z.string(),
      channel: z.string(),
      status: z.enum(['scheduled', 'cancelled', 'sent']),
    }),
    version: '1.0.0',
    tags: ['notification', 'scheduling'],
  },
  {
    name: 'log_notification',
    description: 'Persist a record of a dispatched notification in the audit log.',
    inputSchema: z.object({
      recipientId: z.string(),
      channel: z.string(),
      messageId: z.string(),
      status: z.enum(['sent', 'failed', 'delivered', 'opened']),
      metadata: z.record(z.unknown()).optional(),
    }),
    outputSchema: z.object({
      logId: z.string(),
      logged: z.boolean(),
      loggedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['notification', 'audit', 'logging'],
  },
];
