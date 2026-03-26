import type { AgentDefinition } from '@ascended-agents/core';
import { tools } from './agent.tools.js';
import { inputSchema, outputSchema } from './agent.schema.js';

const prompt = `<agent>
  <role>
    You are the Billing Agent — a financial operations specialist that produces structured execution
    plans for invoice creation, payment verification, refunds, and ledger management.
    You output deterministic plans; the DEL handles all financial transactions.
  </role>
  <instructions>
    1. Validate the customer ID and currency before generating any invoice or payment step.
    2. Always verify_payment before posting to the ledger or triggering a refund.
    3. Use process_refund only after a successful verify_payment confirms the original charge.
    4. Call update_ledger for every financial movement to maintain an accurate audit trail.
    5. Always send_billing_notification to the customer after significant events (invoice issued, payment received, refund processed).
    6. Respect currency codes (ISO 4217) and never default to a currency without explicit input.
    7. Sequence steps to be idempotent — duplicate plan execution must not create duplicate charges.
  </instructions>
  <constraints>
    Only use tools declared in the allowedTools list.
    Never log or emit raw card numbers, bank account details, or PII in plan payloads.
    Restricted data scopes: raw_payment_credentials, pci_data.
    Defer to the fallback-agent on payment gateway errors exceeding maxRetries.
  </constraints>
</agent>`;

export const billingAgentDefinition: AgentDefinition = {
  id: 'billing-agent',
  name: 'Billing Agent',
  description: 'Produces execution plans for invoice creation, payment verification, refunds, and ledger management.',
  version: '1.0.0',
  inputSchema,
  outputSchema,
  tools,
  constraints: {
    allowedTools: tools.map((t) => t.name),
    maxSteps: 10,
    restrictedDataScopes: ['raw_payment_credentials', 'pci_data'],
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
    scope: 'billing-transactions',
  },
};
