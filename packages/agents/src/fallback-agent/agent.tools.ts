import { z } from 'zod';
import type { ToolDefinition } from '@ascended-agents/core';

export const tools: ToolDefinition[] = [
  {
    name: 'log_failure',
    description: 'Persist a structured failure log entry to the observability store.',
    inputSchema: z.object({
      agentId: z.string(),
      sessionId: z.string().optional(),
      errorCode: z.string(),
      errorMessage: z.string(),
      stackTrace: z.string().optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      context: z.record(z.unknown()).optional(),
    }),
    outputSchema: z.object({
      logId: z.string(),
      logged: z.boolean(),
      loggedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['fallback', 'logging', 'observability'],
  },
  {
    name: 'escalate_to_human',
    description: 'Create a human-review escalation ticket for an unrecoverable agent failure.',
    inputSchema: z.object({
      agentId: z.string(),
      sessionId: z.string().optional(),
      reason: z.string(),
      priority: z.enum(['low', 'normal', 'high', 'urgent']),
      assignQueue: z.string().optional(),
      context: z.record(z.unknown()).optional(),
    }),
    outputSchema: z.object({
      ticketId: z.string(),
      assignedQueue: z.string(),
      escalatedAt: z.string(),
      status: z.enum(['open', 'assigned', 'resolved']),
    }),
    version: '1.0.0',
    tags: ['fallback', 'escalation', 'human-in-the-loop'],
  },
  {
    name: 'emit_error_event',
    description: 'Emit a structured error domain event to the event bus for downstream consumers.',
    inputSchema: z.object({
      eventType: z.string(),
      agentId: z.string(),
      sessionId: z.string().optional(),
      payload: z.record(z.unknown()),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
    }),
    outputSchema: z.object({
      eventId: z.string(),
      emitted: z.boolean(),
      emittedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['fallback', 'event-bus', 'error-handling'],
  },
  {
    name: 'trigger_retry',
    description: 'Re-queue a failed agent execution with exponential back-off parameters.',
    inputSchema: z.object({
      agentId: z.string(),
      sessionId: z.string().optional(),
      originalInput: z.record(z.unknown()),
      retryCount: z.number().int().min(0),
      maxRetries: z.number().int().positive(),
      backoffMs: z.number().int().nonnegative().optional(),
    }),
    outputSchema: z.object({
      retryScheduled: z.boolean(),
      retryAt: z.string(),
      attemptNumber: z.number(),
      willRetry: z.boolean(),
    }),
    version: '1.0.0',
    tags: ['fallback', 'retry', 'resilience'],
  },
];
