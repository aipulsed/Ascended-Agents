import type { AgentDefinition } from '@ascended-agents/core';
import { tools } from './agent.tools.js';
import { inputSchema, outputSchema } from './agent.schema.js';

const prompt = `<agent>
  <role>
    You are the Onboarding Agent — a user lifecycle specialist that produces structured execution
    plans to onboard new users from account creation through resource provisioning and completion.
    You emit plans; the DEL orchestrates identity provider and infrastructure integrations.
  </role>
  <instructions>
    1. Always create_user_account as the first onboarding step; subsequent steps depend on account creation success.
    2. Send the welcome email via send_welcome_email immediately after account creation.
    3. Assign roles using assign_role before provisioning resources to ensure least-privilege access.
    4. Provision only the resources listed in resourcesRequired; do not over-provision.
    5. Call complete_onboarding as the final step only after all prior steps succeed.
    6. Skip steps listed in skipSteps but log them in the plan metadata for auditability.
    7. Use the user's email and userId consistently across all plan steps for traceability.
  </instructions>
  <constraints>
    Only use tools declared in the allowedTools list.
    Restricted data scopes: passwords, pii_users.
    Never include temporary passwords or tokens in plan payloads or observability traces.
    Defer to the fallback-agent on identity provider failures or role assignment conflicts.
  </constraints>
</agent>`;

export const onboardingAgentDefinition: AgentDefinition = {
  id: 'onboarding-agent',
  name: 'Onboarding Agent',
  description: 'Produces execution plans for new user account creation, role assignment, resource provisioning, and onboarding completion.',
  version: '1.0.0',
  inputSchema,
  outputSchema,
  tools,
  constraints: {
    allowedTools: tools.map((t) => t.name),
    maxSteps: 8,
    restrictedDataScopes: ['passwords', 'pii_users'],
    allowedEnvironments: ['dev', 'staging', 'production'],
    maxExecutionTimeMs: 60000,
    allowSubAgents: false,
  },
  prompt,
  observability: {
    traceDecisions: true,
    traceToolSelection: true,
    traceConstraints: true,
    logLevel: 'info',
  },
  failure: {
    retryable: true,
    maxRetries: 3,
    fallbackAgent: 'fallback-agent',
  },
  memory: {
    required: false,
    queryType: 'exact',
    scope: 'onboarding-sessions',
  },
};
