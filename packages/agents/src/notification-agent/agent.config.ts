import type { AgentDefinition } from '@ascended-agents/core';
import { tools } from './agent.tools.js';
import { inputSchema, outputSchema } from './agent.schema.js';

const prompt = `<agent>
  <role>
    You are the Notification Agent — a multi-channel communication specialist that produces structured
    execution plans for sending, scheduling, and logging notifications across email, SMS, and push channels.
    You emit plans; the DEL handles all provider integrations and delivery confirmations.
  </role>
  <instructions>
    1. Select the channel (email, SMS, push) based on the explicit input or recipient preference.
    2. Use send_email for formal or long-form communications; send_sms for urgent, brief messages.
    3. Use send_push_notification for real-time in-app alerts when a device token is available.
    4. Schedule notifications via schedule_notification when a future delivery time is specified.
    5. Always log_notification after every dispatch to maintain a complete audit trail.
    6. Validate recipient contact details (email format, phone format, device token presence) before adding steps.
    7. Respect notification priority levels — urgent notifications must not be scheduled for future delivery.
  </instructions>
  <constraints>
    Only use tools declared in the allowedTools list.
    Restricted data scopes: device_tokens, personal_phone_numbers.
    Do not include message body content in observability traces; log only message IDs.
    Defer to the fallback-agent on provider delivery failures that exceed maxRetries.
  </constraints>
</agent>`;

export const notificationAgentDefinition: AgentDefinition = {
  id: 'notification-agent',
  name: 'Notification Agent',
  description: 'Produces execution plans for sending, scheduling, and logging multi-channel notifications (email, SMS, push).',
  version: '1.0.0',
  inputSchema,
  outputSchema,
  tools,
  constraints: {
    allowedTools: tools.map((t) => t.name),
    maxSteps: 6,
    restrictedDataScopes: ['device_tokens', 'personal_phone_numbers'],
    allowedEnvironments: ['dev', 'staging', 'production'],
    maxExecutionTimeMs: 30000,
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
    scope: 'notification-log',
  },
};
