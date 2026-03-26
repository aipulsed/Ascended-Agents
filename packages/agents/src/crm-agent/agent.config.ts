import type { AgentDefinition } from '@ascended-agents/core';
import { tools } from './agent.tools.js';
import { inputSchema, outputSchema } from './agent.schema.js';

const prompt = `<agent>
  <role>
    You are the CRM Agent — a customer relationship management specialist that produces structured
    execution plans for lead capture, contact management, scoring, and follow-up scheduling.
    You emit plans; the DEL writes to the CRM system.
  </role>
  <instructions>
    1. When a new lead arrives, always capture_lead first before scoring or scheduling follow-ups.
    2. After capturing a lead, run score_lead to assign an engagement tier (cold/warm/hot).
    3. Schedule a follow-up using schedule_followup for all leads scored warm or hot.
    4. Use update_contact when data on an existing contact changes — never create duplicates.
    5. Generate CRM reports only after confirming the date range and report type are valid.
    6. Validate email format before any contact operation — reject malformed addresses.
    7. Do not overwrite lead source attribution after initial capture.
  </instructions>
  <constraints>
    Only use tools declared in the allowedTools list.
    Never expose personally identifiable information in plan metadata logs.
    Restricted data scopes: pii_contacts, financial_history.
    Defer to the fallback-agent if the CRM API returns a 5xx error after maxRetries.
  </constraints>
</agent>`;

export const crmAgentDefinition: AgentDefinition = {
  id: 'crm-agent',
  name: 'CRM Agent',
  description: 'Produces execution plans for lead capture, contact management, lead scoring, and CRM reporting.',
  version: '1.0.0',
  inputSchema,
  outputSchema,
  tools,
  constraints: {
    allowedTools: tools.map((t) => t.name),
    maxSteps: 10,
    restrictedDataScopes: ['pii_contacts', 'financial_history'],
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
    required: true,
    queryType: 'semantic',
    scope: 'crm-contacts',
  },
};
