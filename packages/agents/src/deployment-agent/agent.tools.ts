import { z } from 'zod';
import type { ToolDefinition } from '@ascended-agents/core';

export const tools: ToolDefinition[] = [
  {
    name: 'validate_deployment',
    description: 'Pre-flight check that validates the deployment configuration, image, and environment.',
    inputSchema: z.object({
      serviceId: z.string(),
      imageTag: z.string(),
      environment: z.enum(['dev', 'staging', 'production']),
      config: z.record(z.unknown()).optional(),
    }),
    outputSchema: z.object({
      valid: z.boolean(),
      checks: z.array(z.object({ name: z.string(), passed: z.boolean(), message: z.string().optional() })),
      validatedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['deployment', 'validation', 'ci-cd'],
  },
  {
    name: 'run_deployment',
    description: 'Execute the deployment of a service to the target environment.',
    inputSchema: z.object({
      deploymentId: z.string(),
      serviceId: z.string(),
      imageTag: z.string(),
      environment: z.enum(['dev', 'staging', 'production']),
      strategy: z.enum(['rolling', 'blue_green', 'canary']).optional(),
      dryRun: z.boolean().optional(),
    }),
    outputSchema: z.object({
      deploymentId: z.string(),
      status: z.enum(['in_progress', 'succeeded', 'failed']),
      deployedAt: z.string(),
      endpointUrl: z.string().optional(),
      deploymentDurationMs: z.number().optional(),
    }),
    version: '1.0.0',
    tags: ['deployment', 'ci-cd'],
  },
  {
    name: 'rollback_deployment',
    description: 'Revert a service to a previous stable deployment version.',
    inputSchema: z.object({
      serviceId: z.string(),
      targetVersion: z.string(),
      environment: z.enum(['dev', 'staging', 'production']),
      reason: z.string().optional(),
    }),
    outputSchema: z.object({
      rollbackId: z.string(),
      status: z.enum(['in_progress', 'succeeded', 'failed']),
      rolledBackTo: z.string(),
      rolledBackAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['deployment', 'rollback', 'resilience'],
  },
  {
    name: 'notify_deployment_status',
    description: 'Broadcast deployment status updates to configured notification channels.',
    inputSchema: z.object({
      deploymentId: z.string(),
      serviceId: z.string(),
      status: z.enum(['started', 'succeeded', 'failed', 'rolled_back']),
      environment: z.string(),
      notifyChannels: z.array(z.string()),
      details: z.record(z.unknown()).optional(),
    }),
    outputSchema: z.object({
      notified: z.boolean(),
      channels: z.array(z.string()),
      notifiedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['deployment', 'notification'],
  },
  {
    name: 'update_deployment_log',
    description: 'Append a log entry to the deployment history for audit and traceability.',
    inputSchema: z.object({
      deploymentId: z.string(),
      serviceId: z.string(),
      event: z.string(),
      status: z.string(),
      actor: z.string().optional(),
      metadata: z.record(z.unknown()).optional(),
    }),
    outputSchema: z.object({
      logEntryId: z.string(),
      logged: z.boolean(),
      loggedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['deployment', 'audit', 'logging'],
  },
];
