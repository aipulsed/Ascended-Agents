import { z } from 'zod';
import type { ToolDefinition } from '@ascended-agents/core';

export const tools: ToolDefinition[] = [
  {
    name: 'create_user_account',
    description: 'Provision a new user account in the identity provider.',
    inputSchema: z.object({
      userId: z.string(),
      email: z.string().email(),
      displayName: z.string(),
      organizationId: z.string(),
      temporaryPassword: z.boolean().optional(),
    }),
    outputSchema: z.object({
      accountId: z.string(),
      created: z.boolean(),
      createdAt: z.string(),
      loginUrl: z.string().optional(),
    }),
    version: '1.0.0',
    tags: ['onboarding', 'identity', 'user-management'],
  },
  {
    name: 'send_welcome_email',
    description: 'Send a personalised welcome email to a newly onboarded user.',
    inputSchema: z.object({
      userId: z.string(),
      email: z.string().email(),
      displayName: z.string(),
      templateId: z.string().optional(),
      loginUrl: z.string().optional(),
    }),
    outputSchema: z.object({
      emailId: z.string(),
      sent: z.boolean(),
      sentAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['onboarding', 'email', 'notification'],
  },
  {
    name: 'assign_role',
    description: 'Assign one or more roles to a user in the authorisation system.',
    inputSchema: z.object({
      userId: z.string(),
      roles: z.array(z.string()),
      organizationId: z.string().optional(),
      effectiveDate: z.string().optional(),
    }),
    outputSchema: z.object({
      userId: z.string(),
      assignedRoles: z.array(z.string()),
      assignedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['onboarding', 'rbac', 'access-control'],
  },
  {
    name: 'provision_resources',
    description: 'Allocate and configure required resources (storage, queues, etc.) for a new user.',
    inputSchema: z.object({
      userId: z.string(),
      resources: z.array(z.string()),
      organizationId: z.string().optional(),
      environment: z.enum(['dev', 'staging', 'production']).optional(),
    }),
    outputSchema: z.object({
      provisioningId: z.string(),
      provisioned: z.array(z.string()),
      failed: z.array(z.string()),
      completedAt: z.string(),
    }),
    version: '1.0.0',
    tags: ['onboarding', 'provisioning', 'infrastructure'],
  },
  {
    name: 'complete_onboarding',
    description: 'Mark the onboarding workflow as complete and emit the onboarding-completed event.',
    inputSchema: z.object({
      userId: z.string(),
      onboardingId: z.string(),
      skippedSteps: z.array(z.string()).optional(),
    }),
    outputSchema: z.object({
      onboardingId: z.string(),
      completed: z.boolean(),
      completedAt: z.string(),
      duration: z.record(z.unknown()).optional(),
    }),
    version: '1.0.0',
    tags: ['onboarding', 'workflow'],
  },
];
