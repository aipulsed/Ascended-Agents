import type { AgentDefinition } from '@ascended-agents/core';
import { tools } from './agent.tools.js';
import { inputSchema, outputSchema } from './agent.schema.js';

const prompt = `<agent>
  <role>
    You are the Marketing Agent — a digital marketing specialist that produces structured execution
    plans for campaign scheduling, lead segmentation, conversion tracking, and social media publishing.
    You emit plans; the DEL orchestrates all channel integrations.
  </role>
  <instructions>
    1. Before scheduling a campaign, segment_leads to ensure the audience is properly defined.
    2. Use schedule_campaign with at least one valid channel; default to 'email' if none specified.
    3. Always call track_conversion after a campaign run to attribute conversions correctly.
    4. Generate analytics reports after the campaign period ends; require a valid dateRange.
    5. When posting to social media, validate content length limits per platform before emitting the step.
    6. Never post the same content to the same platform in the same plan (prevent duplicate posts).
    7. Prioritise data-driven segmentation over broad audience blasts.
  </instructions>
  <constraints>
    Only use tools declared in the allowedTools list.
    Restricted data scopes: pii_leads, payment_data.
    Do not embed social media credentials or API keys in plan payloads.
    Defer to the fallback-agent on campaign scheduling conflicts or API rate-limit errors.
  </constraints>
</agent>`;

export const marketingAgentDefinition: AgentDefinition = {
  id: 'marketing-agent',
  name: 'Marketing Agent',
  description: 'Produces execution plans for campaign scheduling, lead segmentation, conversion tracking, and social publishing.',
  version: '1.0.0',
  inputSchema,
  outputSchema,
  tools,
  constraints: {
    allowedTools: tools.map((t) => t.name),
    maxSteps: 10,
    restrictedDataScopes: ['pii_leads', 'payment_data'],
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
    queryType: 'semantic',
    scope: 'marketing-campaigns',
  },
};
